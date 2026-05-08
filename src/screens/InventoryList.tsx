import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { Search, SlidersHorizontal, MoreVertical, Coffee, FlaskConical, Wine, Package, ChevronLeft, ChevronRight } from 'lucide-react-native';

const MOCK_DATA = [
  { 
    id: '1', 
    name: 'Kopiko Black', 
    sku: 'KP-BLK-01', 
    stock: 240, 
    unit: 'sachets',
    price: 8.00, 
    status: 'IN STOCK',
    isFastMoving: true,
    icon: Coffee
  },
  { 
    id: '2', 
    name: 'Silver Swan Soy Sauce (200ml)', 
    sku: 'SS-SOY-200', 
    stock: 15, 
    unit: 'bottles',
    price: 18.00, 
    status: 'LOW STOCK',
    isFastMoving: false,
    icon: FlaskConical
  },
  { 
    id: '3', 
    name: 'Datu Puti Vinegar', 
    sku: 'DP-VIN-200', 
    stock: 0, 
    unit: 'bottles',
    price: 15.00, 
    status: 'OUT OF STOCK',
    isFastMoving: false,
    icon: Wine
  },
  { 
    id: '4', 
    name: 'Surf Powder Sachet', 
    sku: 'SRF-PWD-01', 
    stock: 120, 
    unit: 'sachets',
    price: 12.00, 
    status: 'IN STOCK',
    isFastMoving: true,
    icon: Package
  },
];

export default function InventoryList({ navigation }: any) {
  const [search, setSearch] = useState('');

  const renderItem = ({ item }: any) => {
    const IconComponent = item.icon;
    
    return (
      <TouchableOpacity 
        style={styles.card}
        onPress={() => navigation.navigate('ProductDetail', { product: item })}
      >
        <View style={styles.cardHeader}>
          <View style={styles.iconContainer}>
            <IconComponent color={colors.primary} size={24} />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.skuText}>SKU: {item.sku}</Text>
            <Text style={styles.itemName}>{item.name}</Text>
            <View style={styles.badgeRow}>
              {item.isFastMoving && (
                <View style={[styles.badge, styles.fastMovingBadge]}>
                  <Text style={styles.fastMovingText}>FAST MOVING</Text>
                </View>
              )}
              <View style={[
                styles.badge, 
                item.status === 'IN STOCK' ? styles.inStockBadge : 
                item.status === 'LOW STOCK' ? styles.lowStockBadge : styles.outOfStockBadge
              ]}>
                <View style={[
                  styles.dot, 
                  { backgroundColor: item.status === 'IN STOCK' ? '#10B981' : item.status === 'LOW STOCK' ? '#F59E0B' : '#EF4444' }
                ]} />
                <Text style={[
                  styles.statusText,
                  { color: item.status === 'IN STOCK' ? '#065F46' : item.status === 'LOW STOCK' ? '#92400E' : '#991B1B' }
                ]}>{item.status}</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity style={styles.menuButton}>
            <MoreVertical color={colors.slate200} size={20} />
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        <View style={styles.cardFooter}>
          <View>
            <Text style={styles.footerLabel}>Stock</Text>
            <Text style={styles.footerValue}>{item.stock} {item.unit}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.footerLabel}>Unit Price</Text>
            <Text style={styles.footerValue}>₱{item.price.toFixed(2)}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Tindahan Inventory</Text>
        <View style={styles.itemCountBadge}>
          <Text style={styles.itemCountText}>458 Items</Text>
        </View>
      </View>

      <View style={styles.searchRow}>
        <View style={styles.searchContainer}>
          <Search color={colors.slate200} size={20} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search item..."
            value={search}
            onChangeText={setSearch}
            placeholderTextColor={colors.slate200}
          />
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <SlidersHorizontal color={colors.onSurface} size={20} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={MOCK_DATA.filter(i => i.name.toLowerCase().includes(search.toLowerCase()))}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
      />

      <View style={styles.pagination}>
        <Text style={styles.paginationText}>Showing 1 to 4 of 458 items</Text>
        <View style={styles.paginationButtons}>
          <TouchableOpacity style={styles.pageButton}>
            <ChevronLeft color={colors.onSurface} size={20} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.pageButton, { marginLeft: spacing.xs }]}>
            <ChevronRight color={colors.onSurface} size={20} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.onSurface,
  },
  itemCountBadge: {
    backgroundColor: colors.secondaryContainer,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 20,
    marginLeft: spacing.sm,
  },
  itemCountText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  searchRow: {
    flexDirection: 'row',
    padding: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.slate50,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    borderRadius: spacing.radius,
    borderWidth: 1,
    borderColor: colors.slate200,
    marginRight: spacing.sm,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.sm,
    fontSize: 16,
    color: colors.onSurface,
  },
  filterButton: {
    backgroundColor: colors.white,
    padding: spacing.sm,
    borderRadius: spacing.radius,
    borderWidth: 1,
    borderColor: colors.slate200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: spacing.md,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: spacing.radius,
    marginBottom: spacing.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.slate200,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 60,
    height: 60,
    backgroundColor: colors.background,
    borderRadius: spacing.radius,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.secondaryContainer,
  },
  cardContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  skuText: {
    fontSize: 11,
    color: colors.slate500,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  itemName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.onSurface,
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    marginTop: spacing.sm,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: spacing.xs,
  },
  fastMovingBadge: {
    backgroundColor: colors.primaryContainer,
  },
  fastMovingText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '700',
  },
  inStockBadge: {
    backgroundColor: '#ECFDF5',
  },
  lowStockBadge: {
    backgroundColor: '#FFFBEB',
  },
  outOfStockBadge: {
    backgroundColor: '#FEF2F2',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  menuButton: {
    padding: 4,
  },
  divider: {
    height: 1,
    backgroundColor: colors.slate50,
    marginVertical: spacing.md,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerLabel: {
    fontSize: 11,
    color: colors.slate500,
    marginBottom: 4,
  },
  footerValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.onSurface,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.secondaryContainer,
  },
  paginationText: {
    fontSize: 14,
    color: colors.slate500,
  },
  paginationButtons: {
    flexDirection: 'row',
  },
  pageButton: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.slate200,
    padding: 6,
    borderRadius: 4,
  },
});
