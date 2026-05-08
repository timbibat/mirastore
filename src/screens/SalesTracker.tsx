import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, FlatList, useWindowDimensions, Image } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { Card } from '../components/Card';
import { TrendingUp, Receipt, Calendar, ArrowUpRight, ArrowDownRight, Package, ChevronDown } from 'lucide-react-native';
import { salesService, Sale } from '../services/salesService';

export default function SalesTracker({ navigation }: any) {
  const { width } = useWindowDimensions();
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'Today' | 'Weekly' | 'Monthly' | 'Total'>('Today');

  const fetchSales = async () => {
    try {
      const data = await salesService.getSales();
      setSales(data);
    } catch (error) {
      console.error('Error fetching sales:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchSales();
    });
    return unsubscribe;
  }, [navigation]);

  // Filtering Logic
  const filteredSales = sales.filter(s => {
    if (period === 'Total') return true;
    const saleDate = s.timestamp?.toDate ? s.timestamp.toDate() : new Date(s.timestamp);
    const now = new Date();
    
    if (period === 'Today') {
      return saleDate.toDateString() === now.toDateString();
    }
    if (period === 'Weekly') {
      const weekAgo = new Date();
      weekAgo.setDate(now.getDate() - 7);
      return saleDate >= weekAgo;
    }
    if (period === 'Monthly') {
      return saleDate.getMonth() === now.getMonth() && saleDate.getFullYear() === now.getFullYear();
    }
    return true;
  });

  const totalEarnings = filteredSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
  const totalSalesCount = filteredSales.length;

  const renderSaleItem = ({ item }: { item: Sale }) => {
    const date = item.timestamp?.toDate ? item.timestamp.toDate() : new Date(item.timestamp);
    return (
      <Card style={styles.transactionCard}>
        <View style={styles.transactionHeader}>
          <View style={styles.transactionIcon}>
            {item.items[0]?.imageUrl ? (
              <Image source={{ uri: item.items[0].imageUrl }} style={styles.transactionProductImage} />
            ) : (
              <View style={styles.receiptIconBox}>
                <Receipt color={colors.primary} size={20} />
              </View>
            )}
          </View>
          <View style={styles.transactionInfo}>
            <Text style={styles.transactionTitle} numberOfLines={1}>
              {item.items.length > 1 
                ? `${item.items[0].productName} & ${item.items.length - 1} more`
                : item.items[0].productName}
            </Text>
            <Text style={styles.transactionDate}>{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {date.toLocaleDateString()}</Text>
          </View>
          <Text style={styles.transactionAmount}>₱{item.totalAmount.toFixed(2)}</Text>
        </View>
        <View style={styles.transactionDetails}>
          {item.items.map((prod, idx) => (
            <View key={idx} style={styles.productRow}>
              <View style={styles.productMainInfo}>
                <View style={styles.itemImageContainer}>
                  {prod.imageUrl ? (
                    <Image source={{ uri: prod.imageUrl }} style={styles.itemThumbnail} />
                  ) : (
                    <Package color={colors.slate400} size={14} />
                  )}
                </View>
                <Text style={styles.productName}>{prod.productName} x {prod.quantity}</Text>
              </View>
              <Text style={styles.productPrice}>₱{prod.totalPrice.toFixed(2)}</Text>
            </View>
          ))}
        </View>
      </Card>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Sales Tracker</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {['Today', 'Weekly', 'Monthly', 'Total'].map((p) => (
            <TouchableOpacity 
              key={p} 
              style={[styles.periodButton, period === p && styles.periodButtonActive]}
              onPress={() => setPeriod(p as any)}
            >
              <Text style={[styles.periodButtonText, period === p && styles.periodButtonTextActive]}>{p}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Summary Stats */}
        <View style={styles.statsRow}>
          <Card style={[styles.statCard, { backgroundColor: colors.primary }]}>
            <Text style={[styles.statLabel, { color: colors.white, opacity: 0.8 }]}>{period.toUpperCase()} EARNINGS</Text>
            <Text style={[styles.statValue, { color: colors.white }]}>₱{totalEarnings.toLocaleString()}</Text>
            <View style={styles.trendRow}>
              <TrendingUp color={colors.white} size={14} />
              <Text style={[styles.trendText, { color: colors.white }]}>Live Data</Text>
            </View>
          </Card>
          
          <Card style={styles.statCard}>
            <Text style={styles.statLabel}>ORDERS</Text>
            <Text style={[styles.statValue, { color: colors.onSurface }]}>{totalSalesCount}</Text>
            <View style={styles.trendRow}>
              <Receipt color={colors.primary} size={14} />
              <Text style={[styles.trendText, { color: colors.primary }]}>{period} Count</Text>
            </View>
          </Card>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{period} Transactions</Text>
        </View>

        {filteredSales.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Receipt color={colors.slate200} size={64} />
            <Text style={styles.emptyText}>No sales for this period.</Text>
          </View>
        ) : (
          <FlatList
            data={filteredSales}
            renderItem={renderSaleItem}
            keyExtractor={item => item.id || Math.random().toString()}
            scrollEnabled={false}
            contentContainerStyle={styles.listContainer}
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    width: '100%',
  },
  largeScreenContainer: {
    maxWidth: 700,
    width: '100%',
    backgroundColor: colors.white,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: colors.slate100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: colors.background,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.slate200,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.primary,
    textAlign: 'center',
  },
  content: {
    padding: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: spacing.radius,
    padding: 4,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.slate200,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: spacing.radius - 4,
  },
  periodButtonActive: {
    backgroundColor: colors.primary,
  },
  periodButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.slate500,
  },
  periodButtonTextActive: {
    color: colors.white,
  },
  productMainInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.slate50,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.slate100,
  },
  transactionProductImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  itemImageContainer: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: colors.slate50,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    overflow: 'hidden',
  },
  itemThumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  statCard: {
    flex: 0.48,
    padding: spacing.md,
    borderRadius: spacing.radius,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.slate500,
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    marginVertical: 4,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendText: {
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 4,
  },
  secondaryStats: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: spacing.radius,
    padding: spacing.md,
    marginBottom: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.slate200,
  },
  secStatBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  secStatValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.onSurface,
  },
  secStatLabel: {
    fontSize: 12,
    color: colors.slate500,
  },
  secStatDivider: {
    width: 1,
    height: '100%',
    backgroundColor: colors.slate200,
    marginHorizontal: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.onSurface,
  },
  seeAll: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  listContainer: {
    paddingBottom: spacing.xl,
  },
  transactionCard: {
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderColor: colors.slate200,
  },
  transactionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  receiptIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.secondaryContainer,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionInfo: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.onSurface,
  },
  transactionDate: {
    fontSize: 12,
    color: colors.slate500,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.onSurface,
  },
  transactionDetails: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.slate50,
  },
  productRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  productName: {
    fontSize: 13,
    color: colors.slate500,
  },
  productPrice: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.onSurface,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.slate500,
    fontWeight: '500',
  },
  actionButton: {
    marginTop: 24,
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  actionButtonText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 15,
  },
});
