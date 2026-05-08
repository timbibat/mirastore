import React from 'react';
import { View, Text, ScrollView, Image, useWindowDimensions, Alert, TouchableOpacity, Platform } from 'react-native';
import tw from 'twrnc';
import { colors } from '../theme/colors';
import { Button } from '../components/Button';
import { ArrowLeft, Edit3, Trash2 } from 'lucide-react-native';
import { productService } from '../services/productService';

export default function ProductDetail({ route, navigation }: any) {
  const { product } = route.params;
  const { width } = useWindowDimensions();
  const isLargeScreen = width > 768;

  const handleDelete = () => {
    const confirmDelete = () => {
      productService.deleteProduct(product.id, product.imageUrl)
        .then(() => {
          navigation.navigate('InventoryList');
        })
        .catch(error => {
          console.error('Error deleting product:', error);
          Alert.alert('Error', 'Failed to delete product.');
        });
    };

    if (Platform.OS === 'web') {
      if (confirm(`Are you sure you want to delete ${product.name}?`)) {
        confirmDelete();
      }
    } else {
      Alert.alert(
        'Delete Product',
        `Are you sure you want to delete ${product.name}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: confirmDelete }
        ]
      );
    }
  };

  const handleEdit = () => {
    navigation.navigate('AddItem', { product });
  };

  return (
    <View style={tw`flex-1 w-full bg-violet-50`}>
      <ScrollView style={tw`flex-1 w-full bg-violet-50`}>
        <View style={tw`p-4 flex-row justify-between items-center bg-white border-b border-slate-100`}>
          <ArrowLeft color={colors.onSurface} size={24} onPress={() => navigation.goBack()} />
          <View style={tw`flex-row items-center`}>
            <TouchableOpacity onPress={handleEdit} style={tw`mr-4`}>
              <Edit3 color={colors.onSurface} size={24} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDelete}>
              <Trash2 color={colors.error} size={24} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={tw`w-full h-[300px] bg-white items-center justify-center border-b border-slate-200`}>
          {product.imageUrl ? (
            <Image source={{ uri: product.imageUrl }} style={tw`w-full h-full`} resizeMode="contain" />
          ) : (
            <View style={tw`flex-1 justify-center items-center`}>
              <Text style={tw`text-slate-500`}>No Product Image</Text>
            </View>
          )}
        </View>

        <View style={tw`p-4 bg-white mt-2`}>
          <Text style={tw`text-2xl font-extrabold text-indigo-950 mb-1`}>{product.name}</Text>
          <Text style={tw`text-2xl font-bold text-violet-600 mb-6`}>₱{product.price}</Text>

          <View style={tw`flex-row justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6`}>
            <View>
              <Text style={tw`text-xs font-semibold text-slate-500 uppercase`}>Available Stock</Text>
              <Text style={[
                tw`text-xl font-bold mt-1`,
                product.stock === 0 ? tw`text-red-600` : product.stock < 10 ? tw`text-amber-500` : tw`text-emerald-600`
              ]}>
                {product.stock} {product.unit || 'Units'}
              </Text>
            </View>
            <Button title="Update Stock" variant="outline" onPress={handleEdit} />
          </View>

          <View style={tw`mb-4`}>
            <Text style={tw`text-base font-bold text-indigo-950 mb-2`}>Product Details</Text>
            <View style={tw`bg-slate-50 p-4 rounded-xl border border-slate-100`}>
              <Text style={tw`text-sm font-medium text-indigo-950 leading-5`}>
                Category: <Text style={tw`font-bold`}>{product.category || 'General'}</Text>
                {product.isFastMoving ? '\n\n✨ Fast Moving Item' : ''}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
