import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, useWindowDimensions, Image, Modal, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { Card } from '../components/Card';
import { Menu, Bell, User, Calculator, Store, MoreVertical, Receipt, Package } from 'lucide-react-native';
import { productService, Product } from '../services/productService';
import { salesService, Sale } from '../services/salesService';

export default function Dashboard({ navigation }: any) {
  const { width } = useWindowDimensions();
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Calculator State
  const [calculatorVisible, setCalculatorVisible] = useState(false);
  const [calcExpression, setCalcExpression] = useState('');
  const [calcResult, setCalcResult] = useState('0');

  const handleCalcInput = (value: string) => {
    if (value === 'C') {
      setCalcExpression('');
      setCalcResult('0');
    } else if (value === '=') {
      try {
        // Simple evaluation logic (using Function for quick implementation, but in production consider a safer library)
        const result = eval(calcExpression.replace(/×/g, '*').replace(/÷/g, '/'));
        setCalcResult(String(result));
        setCalcExpression(String(result));
      } catch (e) {
        setCalcResult('Error');
      }
    } else {
      setCalcExpression(prev => prev + value);
    }
  };

  const fetchMetrics = async () => {
    try {
      const [productsData, salesData] = await Promise.all([
        productService.getProducts(),
        salesService.getSales()
      ]);
      setProducts(productsData);
      setSales(salesData);
    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchMetrics();
    });
    return unsubscribe;
  }, [navigation]);

  // Inventory metrics
  const totalItems = products.length;
  const fullyStocked = products.filter(p => p.stock > 10).length;
  const needsRestock = products.filter(p => p.stock <= 5).length;

  // Sales metrics
  const today = new Date().toDateString();
  const todaySales = sales.filter(s => {
    const date = s.timestamp?.toDate ? s.timestamp.toDate() : new Date(s.timestamp);
    return date.toDateString() === today;
  });
  const todayEarnings = todaySales.reduce((sum, sale) => sum + sale.totalAmount, 0);

  // Chart data (last 8 sales or mock bars if few sales)
  const barData = sales.length > 0 
    ? sales.slice(0, 8).reverse().map(s => (s.totalAmount / 100) * 10) 
    : [30, 50, 40, 60, 55, 75, 70, 100];

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Menu color={colors.primary} size={24} />
          <Text style={styles.headerTitle}>Mira's Sari-Sari Store</Text>
          <View style={styles.headerIcons}>
            <Bell color={colors.primary} size={24} style={styles.icon} />
            <View style={styles.profilePic}>
              <User color={colors.slate500} size={20} />
            </View>
          </View>
        </View>

        <View style={styles.content}>
          {/* Greeting */}
          <View style={styles.greetingSection}>
            <Text style={styles.greetingTitle}>Kumusta, Mira!</Text>
            <Text style={styles.greetingSubtitle}>Here's your store update for today.</Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionRow}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.outlineButton]}
              onPress={() => setCalculatorVisible(true)}
            >
              <Calculator color={colors.onSurface} size={20} />
              <Text style={styles.outlineButtonText}>Calculator</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, styles.solidButton]}
              onPress={() => navigation.navigate('Sales')}
            >
              <Store color={colors.white} size={20} />
              <Text style={styles.solidButtonText}>New Sale</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.dashboardGrid}>
            {/* Today's Sales Card */}
            <TouchableOpacity style={styles.gridItem} onPress={() => navigation.navigate('Sales')}>
              <Card style={styles.salesCard}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardSmallTitle}>TODAY'S SALES</Text>
                  <MoreVertical color={colors.onSurface} size={20} />
                </View>
                <View style={styles.salesValueRow}>
                  <Text style={styles.salesValue}>₱{todayEarnings.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
                </View>

                {/* Simple Bar Chart */}
                <View style={styles.chartContainer}>
                  {barData.map((height, index) => (
                    <View 
                      key={index} 
                      style={[
                        styles.bar, 
                        { height: Math.min(height, 80) }, 
                        index === barData.length - 1 && styles.activeBar
                      ]} 
                    />
                  ))}
                </View>
              </Card>
            </TouchableOpacity>

            {/* Store Status Card */}
            <Card style={[styles.statusCard, styles.gridItem]}>
              <Text style={styles.cardSmallTitle}>STORE STATUS</Text>
              
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Total Items</Text>
                <Text style={styles.statusValue}>{totalItems}</Text>
              </View>
              
              <View style={styles.statusDivider} />

              <View style={styles.statusRow}>
                <View style={styles.labelWithDot}>
                  <View style={[styles.dot, { backgroundColor: colors.secondaryContainer }]} />
                  <Text style={styles.statusLabel}>Fully Stocked</Text>
                </View>
                <Text style={styles.statusValue}>{fullyStocked}</Text>
              </View>

              <View style={styles.statusDivider} />

              <View style={styles.statusRow}>
                <View style={styles.labelWithDot}>
                  <View style={[styles.dot, { backgroundColor: colors.primary }]} />
                  <Text style={[styles.statusLabel, { color: colors.primary }]}>Needs Restock</Text>
                </View>
                <Text style={[styles.statusValue, { color: colors.primary }]}>{needsRestock}</Text>
              </View>
            </Card>
          </View>

          {/* Recent Transactions */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Sales')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          {sales.slice(0, 3).map((sale) => (
            <Card key={sale.id} style={styles.transactionCard}>
              <View style={styles.transactionHeader}>
                <View style={styles.transactionIcon}>
                  <Receipt color={colors.primary} size={20} />
                </View>
                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionTitle} numberOfLines={1}>
                    {sale.items.length > 1 
                      ? `${sale.items[0].productName} & ${sale.items.length - 1} more`
                      : sale.items[0].productName}
                  </Text>
                  <Text style={styles.transactionDate}>
                    {sale.timestamp?.toDate ? sale.timestamp.toDate().toLocaleDateString() : 'Just now'}
                  </Text>
                </View>
                <Text style={styles.transactionAmount}>₱{sale.totalAmount.toFixed(2)}</Text>
              </View>
              <View style={styles.transactionProducts}>
                {sale.items.map((item, idx) => (
                  <View key={idx} style={styles.itemRow}>
                    <View style={styles.itemNameGroup}>
                      <View style={styles.miniIconBox}>
                        {item.imageUrl ? (
                          <Image source={{ uri: item.imageUrl }} style={styles.miniProductImage} />
                        ) : (
                          <Package color={colors.slate400} size={10} />
                        )}
                      </View>
                      <Text style={styles.itemName}>{item.productName} x {item.quantity}</Text>
                    </View>
                    <Text style={styles.itemPrice}>₱{item.totalPrice.toFixed(2)}</Text>
                  </View>
                ))}
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>
      
      {/* Calculator Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={calculatorVisible}
        onRequestClose={() => setCalculatorVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.calcContainer}>
            <View style={styles.calcHeader}>
              <Text style={styles.calcTitle}>Store Calculator</Text>
              <TouchableOpacity onPress={() => setCalculatorVisible(false)}>
                <Text style={styles.closeText}>Close</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.calcDisplay}>
              <Text style={styles.calcExpression}>{calcExpression || '0'}</Text>
              <Text style={styles.calcResult}>= ₱{Number(calcResult).toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
            </View>
            
            <View style={styles.calcButtons}>
              {['7', '8', '9', '÷', '4', '5', '6', '×', '1', '2', '3', '-', '0', '.', 'C', '+', '='].map((btn) => (
                <TouchableOpacity 
                  key={btn} 
                  style={[
                    styles.calcBtn, 
                    btn === '=' && styles.calcBtnEqual,
                    ['÷', '×', '-', '+'].includes(btn) && styles.calcBtnOp,
                    btn === 'C' && styles.calcBtnClear
                  ]}
                  onPress={() => handleCalcInput(btn)}
                >
                  <Text style={[
                    styles.calcBtnText,
                    ['÷', '×', '-', '+', '='].includes(btn) && styles.calcBtnTextWhite,
                    btn === 'C' && styles.calcBtnTextClear
                  ]}>{btn}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
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
    backgroundColor: colors.white,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.primary,
    textAlign: 'center',
    flex: 1,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: spacing.sm,
  },
  profilePic: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.slate200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: spacing.md,
  },
  greetingSection: {
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  greetingTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.onSurface,
  },
  greetingSubtitle: {
    fontSize: 14,
    color: colors.slate500,
    marginTop: 4,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  actionButton: {
    flex: 0.48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: spacing.radius,
    borderWidth: 1,
  },
  outlineButton: {
    backgroundColor: colors.white,
    borderColor: colors.slate200,
  },
  solidButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  outlineButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.onSurface,
    marginLeft: 8,
  },
  solidButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
    marginLeft: 8,
  },
  dashboardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  gridItem: {
    width: '48%',
    marginBottom: spacing.md,
  },
  salesCard: {
    padding: spacing.md,
    height: '100%',
    borderColor: colors.slate200,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  cardSmallTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.slate500,
    letterSpacing: 0.5,
  },
  salesValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  salesValue: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.primary,
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 60,
    marginTop: spacing.md,
  },
  bar: {
    width: '10%',
    backgroundColor: colors.slate50,
    borderRadius: 2,
  },
  activeBar: {
    backgroundColor: colors.primary,
  },
  statusCard: {
    padding: spacing.md,
    height: '100%',
    borderColor: colors.slate200,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.onSurface,
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.onSurface,
  },
  statusDivider: {
    height: 1,
    backgroundColor: colors.slate50,
  },
  labelWithDot: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    marginTop: spacing.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.onSurface,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  transactionCard: {
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderColor: colors.slate100,
  },
  transactionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionIcon: {
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
    fontSize: 14,
    fontWeight: '700',
    color: colors.onSurface,
  },
  transactionDate: {
    fontSize: 12,
    color: colors.slate500,
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.onSurface,
  },
  transactionProducts: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.slate50,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemNameGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniIconBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: colors.slate50,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    overflow: 'hidden',
  },
  miniProductImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  itemName: {
    fontSize: 12,
    color: colors.slate500,
  },
  itemPrice: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.onSurface,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: SCREEN_WIDTH < 768 ? 'flex-end' : 'center',
    alignItems: 'center',
  },
  calcContainer: {
    backgroundColor: colors.white,
    width: '100%',
    maxWidth: SCREEN_WIDTH < 768 ? '100%' : 360,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderBottomLeftRadius: SCREEN_WIDTH < 768 ? 0 : 32,
    borderBottomRightRadius: SCREEN_WIDTH < 768 ? 0 : 32,
    padding: spacing.lg,
    paddingBottom: SCREEN_WIDTH < 768 ? 40 : spacing.lg,
    elevation: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },
  calcHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingTop: SCREEN_WIDTH < 768 ? spacing.xs : 0,
  },
  calcTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.onSurface,
  },
  closeText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  calcDisplay: {
    backgroundColor: colors.slate50,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    alignItems: 'flex-end',
    borderWidth: 1,
    borderColor: colors.slate100,
  },
  calcExpression: {
    fontSize: 16,
    color: colors.slate500,
    marginBottom: 4,
    fontWeight: '500',
  },
  calcResult: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.primary,
  },
  calcButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  calcBtn: {
    width: '23%',
    aspectRatio: 1.1,
    backgroundColor: colors.white,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.slate200,
  },
  calcBtnText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.onSurface,
  },
  calcBtnTextWhite: {
    color: colors.white,
  },
  calcBtnOp: {
    backgroundColor: colors.primaryContainer,
    borderColor: colors.primaryContainer,
  },
  calcBtnEqual: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    width: '100%',
    aspectRatio: 5,
    marginTop: 4,
    borderRadius: 12,
  },
  calcBtnClear: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FEE2E2',
  },
  calcBtnTextClear: {
    color: '#EF4444',
  },
});
