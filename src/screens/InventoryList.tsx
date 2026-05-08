import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator, RefreshControl, useWindowDimensions } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { Search, SlidersHorizontal, MoreVertical, Coffee, FlaskConical, Wine, Package, ChevronLeft, ChevronRight, Image as ImageIcon, ShoppingCart, Plus } from 'lucide-react-native';
import { productService, Product } from '../services/productService';
import { salesService } from '../services/salesService';
import { Modal, Alert } from 'react-native';

export default function InventoryList({ navigation }: any) {
  const { width } = useWindowDimensions();
  const isLargeScreen = width > 768;
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Sell Modal State
  const [sellModalVisible, setSellModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [sellQuantity, setSellQuantity] = useState('1');
  const [isSelling, setIsSelling] = useState(false);

  const fetchProducts = async () => {
    try {
      const data = await productService.getProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchProducts();
    });
    return unsubscribe;
  }, [navigation]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProducts();
  };

  const handleQuickSell = (product: Product) => {
    setSelectedProduct(product);
    setSellQuantity('1');
    setSellModalVisible(true);
  };

  const submitSale = async () => {
    if (!selectedProduct || !sellQuantity) return;
    
    const qty = parseInt(sellQuantity);
    if (isNaN(qty) || qty <= 0) {
      Alert.alert('Error', 'Please enter a valid quantity.');
      return;
    }

    if (qty > selectedProduct.stock) {
      Alert.alert('Error', `Not enough stock. Only ${selectedProduct.stock} available.`);
      return;
    }

    setIsSelling(true);
    try {
      await salesService.recordSale([{
        productId: selectedProduct.id!,
        productName: selectedProduct.name,
        quantity: qty,
        pricePerUnit: selectedProduct.price,
        totalPrice: selectedProduct.price * qty
      }]);
      
      Alert.alert('Success', `Sold ${qty} ${selectedProduct.name}(s)!`);
      setSellModalVisible(false);
      fetchProducts(); // Refresh inventory
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to record sale.');
    } finally {
      setIsSelling(false);
    }
  };

  const renderItem = ({ item }: { item: Product }) => {
    return (
      <View style={styles.card}>
        <TouchableOpacity 
          style={styles.cardHeader}
          onPress={() => navigation.navigate('ProductDetail', { product: item })}
        >
          <View style={styles.iconContainer}>
            <Package color={colors.primary} size={24} />
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
        </TouchableOpacity>

        <View style={styles.divider} />

        <View style={styles.cardFooter}>
          <View>
            <Text style={styles.footerLabel}>Stock</Text>
            <Text style={styles.footerValue}>{item.stock} {item.unit}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ alignItems: 'flex-end', marginRight: spacing.md }}>
              <Text style={styles.footerLabel}>Unit Price</Text>
              <Text style={styles.footerValue}>₱{Number(item.price).toFixed(2)}</Text>
            </View>
            <TouchableOpacity 
              style={[styles.sellButton, item.stock === 0 && styles.sellButtonDisabled]}
              onPress={() => handleQuickSell(item)}
              disabled={item.stock === 0}
            >
              <ShoppingCart color={colors.white} size={20} />
              <Text style={styles.sellButtonText}>Sell</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const filteredProducts = products.filter(i => 
    i.name.toLowerCase().includes(search.toLowerCase()) || 
    i.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mira Inventory</Text>
        <View style={styles.itemCountBadge}>
          <Text style={styles.itemCountText}>{products.length} Items</Text>
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
        data={filteredProducts}
        renderItem={renderItem}
        keyExtractor={item => item.id!}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No items found.</Text>
            <TouchableOpacity 
              style={styles.addFirstButton}
              onPress={() => navigation.navigate('AddItem')}
            >
              <Text style={styles.addFirstButtonText}>Add Your First Product</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Floating Action Button for Adding Items */}
      <TouchableOpacity 
        style={[styles.fab, isLargeScreen && styles.fabLargeScreen]}
        onPress={() => navigation.navigate('AddItem')}
      >
        <Plus color={colors.white} size={32} />
      </TouchableOpacity>

      {/* Sell Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={sellModalVisible}
        onRequestClose={() => setSellModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Record Sale</Text>
            <Text style={styles.modalSubtitle}>Product: {selectedProduct?.name}</Text>
            
            <View style={styles.quantityInputGroup}>
              <Text style={styles.modalLabel}>How many items sold?</Text>
              <TextInput
                style={styles.modalInput}
                value={sellQuantity}
                onChangeText={setSellQuantity}
                keyboardType="numeric"
                autoFocus
              />
              <Text style={styles.availableStockText}>
                Available: {selectedProduct?.stock} {selectedProduct?.unit}
              </Text>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setSellModalVisible(false)}
                disabled={isSelling}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.confirmButton, isSelling && styles.confirmButtonDisabled]}
                onPress={submitSale}
                disabled={isSelling}
              >
                {isSelling ? (
                  <ActivityIndicator color={colors.white} size="small" />
                ) : (
                  <Text style={styles.confirmButtonText}>Confirm Sale</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.pagination}>
        <Text style={styles.paginationText}>Showing {filteredProducts.length} of {products.length} items</Text>
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
  outerContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    width: '100%',
  },
  largeScreenContainer: {
    maxWidth: 700,
    width: '100%',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: colors.slate100,
    backgroundColor: colors.white,
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
    flexGrow: 1,
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
  emptyState: {
    marginTop: 100,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.slate500,
  },
  sellButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: 8,
  },
  sellButtonDisabled: {
    backgroundColor: colors.slate200,
  },
  sellButtonText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 14,
    marginLeft: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: spacing.radius,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 400,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.onSurface,
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: spacing.lg,
  },
  quantityInputGroup: {
    marginBottom: spacing.xl,
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.onSurface,
    marginBottom: spacing.sm,
  },
  modalInput: {
    backgroundColor: colors.slate50,
    borderWidth: 1,
    borderColor: colors.slate200,
    borderRadius: 8,
    padding: spacing.md,
    fontSize: 20,
    fontWeight: '700',
    color: colors.onSurface,
    textAlign: 'center',
  },
  availableStockText: {
    fontSize: 12,
    color: colors.slate500,
    marginTop: 8,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: spacing.md,
    marginRight: spacing.sm,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.slate200,
  },
  cancelButtonText: {
    color: colors.onSurface,
    fontWeight: '600',
    fontSize: 16,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    marginLeft: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  confirmButtonDisabled: {
    opacity: 0.7,
  },
  confirmButtonText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 16,
  },
  fab: {
    position: 'absolute',
    bottom: 90, // Moved up to clear the pagination bar
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    zIndex: 10,
  },
  fabLargeScreen: {
    right: 40,
    bottom: 100, // Also adjusted for large screens
  },
  addFirstButton: {
    marginTop: spacing.lg,
    backgroundColor: colors.secondaryContainer,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  addFirstButtonText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 16,
  },
});
