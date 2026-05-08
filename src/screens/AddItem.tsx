import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, ActivityIndicator, Alert, useWindowDimensions, Image } from 'react-native';
import tw from 'twrnc';
import { colors } from '../theme/colors';
import { Button } from '../components/Button';
import { X, Camera } from 'lucide-react-native';
import { productService, Product } from '../services/productService';
import * as ImagePicker from 'expo-image-picker';

export default function AddItem({ route, navigation }: any) {
  const { width } = useWindowDimensions();
  const editingProduct = route.params?.product as Product;
  
  const [loading, setLoading] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(editingProduct?.imageUrl || null);
  const [form, setForm] = useState({
    name: editingProduct?.name || '',
    price: editingProduct?.price.toString() || '',
    stock: editingProduct?.stock.toString() || '',
    unit: editingProduct?.unit || 'sachets',
    category: editingProduct?.category || 'General',
    isFastMoving: editingProduct?.isFastMoving || false
  });

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!form.name || !form.price || !form.stock) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      const productData: any = {
        name: form.name,
        price: parseFloat(form.price),
        stock: parseInt(form.stock),
        unit: form.unit,
        status: parseInt(form.stock) > 10 ? 'IN STOCK' : parseInt(form.stock) > 0 ? 'LOW STOCK' : 'OUT OF STOCK',
        isFastMoving: form.isFastMoving,
        category: form.category,
      };

      if (editingProduct?.id) {
        await productService.updateProduct(editingProduct.id, productData);
        navigation.navigate('InventoryList');
      } else {
        await productService.addProduct(productData, imageUri || undefined);
        navigation.navigate('InventoryList');
      }
    } catch (error) {
      console.error('Error saving product:', error);
      Alert.alert('Error', 'Failed to save product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={tw`flex-1 w-full bg-violet-50`}>
      <ScrollView style={tw`flex-1 w-full bg-violet-50`}>
        <View style={tw`p-4 flex-row justify-between items-center bg-white`}>
          <Text style={tw`text-xl font-bold text-indigo-950`}>{editingProduct ? 'Edit Product' : 'Add New Item'}</Text>
          <X color={colors.onSurface} size={24} onPress={() => navigation.goBack()} />
        </View>

        <View style={tw`p-4`}>
          {/* Image Picker */}
          <TouchableOpacity 
            style={tw`h-[180px] bg-white rounded-2xl border border-slate-200 justify-center items-center mb-6 overflow-hidden border-dashed`} 
            onPress={pickImage}
          >
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={tw`w-full h-full`} resizeMode="cover" />
            ) : (
              <>
                <Camera color={colors.slate500} size={32} />
                <Text style={tw`text-slate-500 mt-2 text-sm`}>Add Product Photo</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={tw`mb-4`}>
            <Text style={tw`text-sm font-semibold text-indigo-950 mb-1`}>Product Name *</Text>
            <TextInput
              style={tw`bg-white border border-slate-200 rounded-lg p-3 text-base text-indigo-950`}
              placeholder="e.g. Kopiko Black"
              value={form.name}
              onChangeText={(v) => setForm({ ...form, name: v })}
            />
          </View>

          <View style={tw`flex-row mb-4`}>
            <View style={tw`flex-1 mr-2`}>
              <Text style={tw`text-sm font-semibold text-indigo-950 mb-1`}>Price (₱) *</Text>
              <TextInput
                style={tw`bg-white border border-slate-200 rounded-lg p-3 text-base text-indigo-950`}
                placeholder="0.00"
                keyboardType="numeric"
                value={form.price}
                onChangeText={(v) => setForm({ ...form, price: v })}
              />
            </View>
            <View style={tw`flex-1 ml-2`}>
              <Text style={tw`text-sm font-semibold text-indigo-950 mb-1`}>Initial Stock *</Text>
              <TextInput
                style={tw`bg-white border border-slate-200 rounded-lg p-3 text-base text-indigo-950`}
                placeholder="0"
                keyboardType="numeric"
                value={form.stock}
                onChangeText={(v) => setForm({ ...form, stock: v })}
              />
            </View>
          </View>

          <View style={tw`flex-row mb-4`}>
            <View style={tw`flex-1 mr-2`}>
              <Text style={tw`text-sm font-semibold text-indigo-950 mb-1`}>Unit</Text>
              <TextInput
                style={tw`bg-white border border-slate-200 rounded-lg p-3 text-base text-indigo-950`}
                placeholder="e.g. sachets"
                value={form.unit}
                onChangeText={(v) => setForm({ ...form, unit: v })}
              />
            </View>
            <View style={tw`flex-1 ml-2`}>
              <Text style={tw`text-sm font-semibold text-indigo-950 mb-1`}>Category</Text>
              <TextInput
                style={tw`bg-white border border-slate-200 rounded-lg p-3 text-base text-indigo-950`}
                placeholder="General"
                value={form.category}
                onChangeText={(v) => setForm({ ...form, category: v })}
              />
            </View>
          </View>

          <TouchableOpacity 
            style={tw`flex-row justify-between items-center py-2 mb-4`}
            onPress={() => setForm({ ...form, isFastMoving: !form.isFastMoving })}
          >
            <Text style={tw`text-sm font-semibold text-indigo-950 mb-1`}>Mark as Fast Moving</Text>
            <View style={[
              tw`w-[50px] h-[28px] rounded-full p-0.5`,
              form.isFastMoving ? tw`bg-violet-600` : tw`bg-slate-200`
            ]}>
              <View style={[
                tw`w-6 h-6 rounded-full bg-white`,
                form.isFastMoving ? tw`self-end` : tw`self-start`
              ]} />
            </View>
          </TouchableOpacity>

          <Button 
            title={loading ? "Saving..." : (editingProduct ? "Update Product" : "Save Product")} 
            style={tw`mt-6 py-4`} 
            onPress={handleSave}
            disabled={loading}
          />
          {loading && <ActivityIndicator style={tw`mt-2`} color={colors.primary} />}
        </View>
      </ScrollView>
    </View>
  );
}
