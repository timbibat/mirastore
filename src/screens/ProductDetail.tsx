import React from 'react';
import { View, Text, ScrollView, Image, useWindowDimensions, Alert, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
    <SafeAreaView style={tw`flex-1 bg-violet-50`} edges={['top']}>
      <View style={tw`flex-1 w-full bg-violet-50`}>
      <ScrollView style={tw`flex-1 w-full bg-violet-50`}>
        <View style={tw`px-6 pb-6 pt-4 flex-row justify-between items-center bg-white border-b border-slate-100`}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={tw`w-12 h-12 rounded-2xl bg-slate-50 justify-center items-center border border-slate-100 shadow-sm`}
          >
            <ArrowLeft color={colors.onSurface} size={24} />
          </TouchableOpacity>
          <View style={tw`flex-row items-center`}>
            <TouchableOpacity 
              onPress={handleEdit} 
              style={tw`w-12 h-12 rounded-2xl bg-violet-50 justify-center items-center border border-violet-100 shadow-sm mr-3`}
            >
              <Edit3 color={colors.primary} size={22} />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={handleDelete}
              style={tw`w-12 h-12 rounded-2xl bg-red-50 justify-center items-center border border-red-100 shadow-sm`}
            >
              <Trash2 color={colors.error} size={22} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={tw`w-full h-[320px] bg-white items-center justify-center p-6`}>
          {product.imageUrl ? (
            <View style={tw`w-full h-full rounded-[32px] overflow-hidden shadow-lg border border-slate-100`}>
              <Image source={{ uri: product.imageUrl }} style={tw`w-full h-full`} resizeMode="cover" />
            </View>
          ) : (
            <View style={tw`w-full h-full rounded-[32px] bg-slate-50 justify-center items-center border border-dashed border-slate-300`}>
              <Text style={tw`text-slate-400 font-bold`}>No Product Image</Text>
            </View>
          )}
        </View>

        <View style={tw`p-4 bg-white mt-2`}>
          <Text style={tw`text-2xl font-extrabold text-indigo-950 mb-1`}>{product.name}</Text>
          <Text style={tw`text-2xl font-bold text-violet-600 mb-6`}>₱{product.price}</Text>

          <View style={tw`flex-row justify-between items-center bg-violet-600 p-5 rounded-[24px] shadow-lg mb-8`}>
            <View>
              <Text style={tw`text-[10px] font-bold text-white opacity-80 uppercase tracking-widest`}>Available Stock</Text>
              <Text style={tw`text-2xl font-black text-white mt-1`}>
                {product.stock} {product.unit || 'Units'}
              </Text>
            </View>
            <TouchableOpacity 
              onPress={handleEdit}
              style={tw`bg-white/20 px-4 py-2 rounded-xl border border-white/30`}
            >
              <Text style={tw`text-white font-bold text-sm`}>Update</Text>
            </TouchableOpacity>
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
    </SafeAreaView>
  );
}
