import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, ActivityIndicator, RefreshControl, useWindowDimensions, Modal, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import tw from 'twrnc';
import { colors } from '../theme/colors';
import { Search, Package, ChevronLeft, ChevronRight, ShoppingCart, Plus } from 'lucide-react-native';
import { productService, Product } from '../services/productService';
import { salesService } from '../services/salesService';

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
        totalPrice: selectedProduct.price * qty,
        imageUrl: selectedProduct.imageUrl
      }]);
      
      Alert.alert('Success', `Sold ${qty} ${selectedProduct.name}(s)!`);
      setSellModalVisible(false);
      fetchProducts();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to record sale.');
    } finally {
      setIsSelling(false);
    }
  };

  const renderItem = ({ item }: { item: Product }) => {
    const isInStock = item.status === 'IN STOCK';
    const isLowStock = item.status === 'LOW STOCK';

    return (
      <View style={tw`bg-white rounded-2xl mb-4 p-4 border border-slate-200`}>
        <TouchableOpacity 
          style={tw`flex-row items-start`}
          onPress={() => navigation.navigate('ProductDetail', { product: item })}
        >
          <View style={tw`w-[120px] h-[120px] bg-violet-50 rounded-xl justify-center items-center border border-violet-100 overflow-hidden`}>
            {item.imageUrl ? (
              <Image source={{ uri: item.imageUrl }} style={tw`w-full h-full`} resizeMode="cover" />
            ) : (
              <Package color={colors.primary} size={24} />
            )}
          </View>
          <View style={tw`flex-1 ml-4`}>
            <Text style={tw`text-lg font-bold text-indigo-950 mt-0.5`}>{item.name}</Text>
            <View style={tw`flex-row mt-2`}>
              {item.isFastMoving && (
                <View style={tw`flex-row items-center px-2 py-1 rounded-full bg-violet-800 mr-1`}>
                  <Text style={tw`text-white text-[10px] font-bold`}>FAST MOVING</Text>
                </View>
              )}
              <View style={[
                tw`flex-row items-center px-2 py-1 rounded-full`,
                isInStock ? tw`bg-emerald-50` : isLowStock ? tw`bg-amber-50` : tw`bg-red-50`
              ]}>
                <View style={[
                  tw`w-1.5 h-1.5 rounded-full mr-1.5`,
                  isInStock ? tw`bg-emerald-500` : isLowStock ? tw`bg-amber-500` : tw`bg-red-500`
                ]} />
                <Text style={[
                  tw`text-[10px] font-bold`,
                  isInStock ? tw`text-emerald-800` : isLowStock ? tw`text-amber-800` : tw`text-red-800`
                ]}>{item.status}</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        <View style={tw`h-[1px] bg-slate-50 my-4`} />

        <View style={tw`flex-row justify-between items-center`}>
          <View>
            <Text style={tw`text-[11px] text-slate-500 mb-1`}>Stock</Text>
            <Text style={tw`text-base font-bold text-indigo-950`}>{item.stock} {item.unit}</Text>
          </View>
          <View style={tw`flex-row items-center`}>
            <View style={tw`items-end mr-4`}>
              <Text style={tw`text-[11px] text-slate-500 mb-1`}>Unit Price</Text>
              <Text style={tw`text-base font-bold text-indigo-950`}>₱{Number(item.price).toFixed(2)}</Text>
            </View>
            <TouchableOpacity 
              style={[tw`flex-row items-center bg-violet-600 px-4 py-2 rounded-lg`, item.stock === 0 && tw`bg-slate-200`]}
              onPress={() => handleQuickSell(item)}
              disabled={item.stock === 0}
            >
              <ShoppingCart color={colors.white} size={20} />
              <Text style={tw`text-white font-bold text-sm ml-1.5`}>Sell</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={tw`flex-1 bg-violet-50 justify-center items-center`}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const filteredProducts = products.filter(i => 
    i.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={tw`flex-1 bg-white`} edges={['top']}>
      <View style={tw`flex-1 w-full bg-violet-50`}>
        <View style={tw`p-4 flex-row items-center bg-white`}>
          <Text style={tw`text-2xl font-bold text-indigo-950`}>Mira Inventory</Text>
          <View style={tw`bg-violet-100 px-2 py-1 rounded-full ml-2`}>
            <Text style={tw`text-xs text-violet-600 font-semibold`}>{products.length} Items</Text>
          </View>
        </View>

        <View style={tw`flex-row p-4 bg-white border-b border-slate-50`}>
          <View style={tw`flex-1 flex-row items-center bg-white px-4 rounded-xl border border-slate-200`}>
            <Search color={colors.slate200} size={20} style={tw`mr-2`} />
            <TextInput
              style={tw`flex-1 py-2 text-base text-indigo-950`}
              placeholder="Search item..."
              value={search}
              onChangeText={setSearch}
              placeholderTextColor={colors.slate200}
            />
          </View>
        </View>

        <FlatList
          data={filteredProducts}
          renderItem={renderItem}
          keyExtractor={item => item.id!}
          contentContainerStyle={tw`p-4 grow`}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
          ListEmptyComponent={
            <View style={tw`mt-24 items-center`}>
              <Text style={tw`text-base text-slate-500`}>No items found.</Text>
              <TouchableOpacity 
                style={tw`mt-6 bg-violet-100 px-6 py-4 rounded-3xl border border-violet-600`}
                onPress={() => navigation.navigate('AddItem')}
              >
                <Text style={tw`text-violet-600 font-bold text-base`}>Add Your First Product</Text>
              </TouchableOpacity>
            </View>
          }
        />

        <TouchableOpacity 
          style={[
            tw`absolute w-15 h-15 rounded-full bg-violet-600 justify-center items-center shadow-lg z-10`,
            { elevation: 8 },
            isLargeScreen ? tw`right-10 bottom-[100px]` : tw`right-6 bottom-[90px]`
          ]}
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
          <View style={tw`flex-1 bg-black/50 justify-center items-center p-4`}>
            <View style={[tw`bg-white rounded-2xl p-6 w-full max-w-[400px] shadow-md`, { elevation: 5 }]}>
              <Text style={tw`text-2xl font-extrabold text-indigo-950 mb-1`}>Record Sale</Text>
              <Text style={tw`text-sm text-violet-600 font-semibold mb-6`}>Product: {selectedProduct?.name}</Text>
              
              <View style={tw`mb-6`}>
                <Text style={tw`text-base font-semibold text-indigo-950 mb-2`}>How many items sold?</Text>
                <TextInput
                  style={tw`bg-slate-50 border border-slate-200 rounded-lg p-4 text-xl font-bold text-indigo-950 text-center`}
                  value={sellQuantity}
                  onChangeText={setSellQuantity}
                  keyboardType="numeric"
                  autoFocus
                />
                <Text style={tw`text-xs text-slate-500 mt-2 text-center`}>
                  Available: {selectedProduct?.stock} {selectedProduct?.unit}
                </Text>
              </View>

              <View style={tw`flex-row justify-between`}>
                <TouchableOpacity 
                  style={tw`flex-1 py-4 mr-2 items-center rounded-lg border border-slate-200`}
                  onPress={() => setSellModalVisible(false)}
                  disabled={isSelling}
                >
                  <Text style={tw`text-indigo-950 font-semibold text-base`}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[tw`flex-1 bg-violet-600 py-4 ml-2 items-center justify-center rounded-lg`, isSelling && tw`opacity-70`]}
                  onPress={submitSale}
                  disabled={isSelling}
                >
                  {isSelling ? (
                    <ActivityIndicator color={colors.white} size="small" />
                  ) : (
                    <Text style={tw`text-white font-bold text-base`}>Confirm Sale</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <View style={tw`flex-row justify-between items-center p-4 bg-violet-50 border-t border-violet-100`}>
          <Text style={tw`text-sm text-slate-500`}>Showing {filteredProducts.length} of {products.length} items</Text>
          <View style={tw`flex-row`}>
            <TouchableOpacity style={tw`bg-white border border-slate-200 p-1.5 rounded`}>
              <ChevronLeft color={colors.onSurface} size={20} />
            </TouchableOpacity>
            <TouchableOpacity style={tw`bg-white border border-slate-200 p-1.5 rounded ml-2`}>
              <ChevronRight color={colors.onSurface} size={20} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}