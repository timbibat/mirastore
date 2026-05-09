import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, ActivityIndicator, Alert, useWindowDimensions, Image, Modal, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
  const [photoModalVisible, setPhotoModalVisible] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(editingProduct?.imageUrl || null);
  const [form, setForm] = useState({
    name: editingProduct?.name || '',
    price: editingProduct?.price.toString() || '',
    stock: editingProduct?.stock.toString() || '',
    unit: editingProduct?.unit || 'sachets',
    category: editingProduct?.category || 'General',
    isFastMoving: editingProduct?.isFastMoving || false
  });

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'You need to grant camera permissions to use this feature.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

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

  const handleImageSelection = () => {
    // Using a custom modal guarantees it works on React Native Web
    setPhotoModalVisible(true);
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
    <SafeAreaView style={tw`flex-1 bg-violet-50`} edges={['top']}>
      <View style={tw`flex-1 w-full bg-violet-50`}>
      <ScrollView style={tw`flex-1 w-full bg-violet-50`}>
        <View style={tw`px-6 pb-6 pt-4 flex-row justify-between items-center bg-white border-b border-slate-100`}>
          <View>
            <Text style={tw`text-xs font-bold text-slate-400 uppercase tracking-widest`}>Inventory Management</Text>
            <Text style={tw`text-3xl font-black text-indigo-950`}>{editingProduct ? 'Edit Product' : 'Add New Item'}</Text>
          </View>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={tw`w-12 h-12 rounded-2xl bg-slate-50 justify-center items-center border border-slate-100 shadow-sm`}
          >
            <X color={colors.onSurface} size={24} />
          </TouchableOpacity>
        </View>

        <View style={tw`p-4`}>
          {/* Image Picker Trigger */}
          <TouchableOpacity 
            style={tw`h-[180px] bg-white rounded-2xl border border-slate-200 justify-center items-center mb-6 overflow-hidden border-dashed`} 
            onPress={handleImageSelection}
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

          <View style={tw`mb-5`}>
            <Text style={tw`text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1`}>Product Name *</Text>
            <View style={tw`flex-row items-center bg-white rounded-2xl border border-slate-200 px-4 h-14`}>
              <TextInput
                style={tw`flex-1 h-full text-base font-semibold text-indigo-950`}
                placeholder="e.g. Kopiko Black"
                placeholderTextColor={colors.slate400}
                value={form.name}
                onChangeText={(v) => setForm({ ...form, name: v })}
              />
            </View>
          </View>

          <View style={tw`flex-row mb-5`}>
            <View style={tw`flex-1 mr-2`}>
              <Text style={tw`text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1`}>Price (₱) *</Text>
              <View style={tw`flex-row items-center bg-white rounded-2xl border border-slate-200 px-4 h-14`}>
                <TextInput
                  style={tw`flex-1 h-full text-base font-semibold text-indigo-950`}
                  placeholder="0.00"
                  placeholderTextColor={colors.slate400}
                  keyboardType="numeric"
                  value={form.price}
                  onChangeText={(v) => setForm({ ...form, price: v })}
                />
              </View>
            </View>
            <View style={tw`flex-1 ml-2`}>
              <Text style={tw`text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1`}>Initial Stock *</Text>
              <View style={tw`flex-row items-center bg-white rounded-2xl border border-slate-200 px-4 h-14`}>
                <TextInput
                  style={tw`flex-1 h-full text-base font-semibold text-indigo-950`}
                  placeholder="0"
                  placeholderTextColor={colors.slate400}
                  keyboardType="numeric"
                  value={form.stock}
                  onChangeText={(v) => setForm({ ...form, stock: v })}
                />
              </View>
            </View>
          </View>

          <View style={tw`flex-row mb-6`}>
            <View style={tw`flex-1 mr-2`}>
              <Text style={tw`text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1`}>Unit</Text>
              <View style={tw`flex-row items-center bg-white rounded-2xl border border-slate-200 px-4 h-14`}>
                <TextInput
                  style={tw`flex-1 h-full text-base font-semibold text-indigo-950`}
                  placeholder="e.g. sachets"
                  placeholderTextColor={colors.slate400}
                  value={form.unit}
                  onChangeText={(v) => setForm({ ...form, unit: v })}
                />
              </View>
            </View>
            <View style={tw`flex-1 ml-2`}>
              <Text style={tw`text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1`}>Category</Text>
              <View style={tw`flex-row items-center bg-white rounded-2xl border border-slate-200 px-4 h-14`}>
                <TextInput
                  style={tw`flex-1 h-full text-base font-semibold text-indigo-950`}
                  placeholder="General"
                  placeholderTextColor={colors.slate400}
                  value={form.category}
                  onChangeText={(v) => setForm({ ...form, category: v })}
                />
              </View>
            </View>
          </View>

          <TouchableOpacity 
            style={tw`flex-row justify-between items-center p-4 bg-white rounded-2xl border border-slate-100 mb-6`}
            onPress={() => setForm({ ...form, isFastMoving: !form.isFastMoving })}
          >
            <View>
              <Text style={tw`text-sm font-bold text-indigo-950`}>Fast Moving Item</Text>
              <Text style={tw`text-xs text-slate-500 mt-0.5`}>Feature this product in dashboard</Text>
            </View>
            <View style={[
              tw`w-[50px] h-[28px] rounded-full p-1`,
              form.isFastMoving ? tw`bg-violet-600` : tw`bg-slate-200`
            ]}>
              <View style={[
                tw`w-5 h-5 rounded-full bg-white shadow-sm`,
                form.isFastMoving ? tw`self-end` : tw`self-start`
              ]} />
            </View>
          </TouchableOpacity>

          <Button 
            title={loading ? "Saving..." : (editingProduct ? "Update Product" : "Save Product")} 
            style={tw`py-5 rounded-2xl shadow-md`} 
            onPress={handleSave}
            disabled={loading}
          />
          {loading && <ActivityIndicator style={tw`mt-2`} color={colors.primary} />}
        </View>
      </ScrollView>

      {/* Web-Compatible Photo Options Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={photoModalVisible}
        onRequestClose={() => setPhotoModalVisible(false)}
      >
        <View style={tw`flex-1 bg-black/50 justify-center items-center p-4`}>
          <View style={[tw`bg-white rounded-2xl w-full max-w-[320px] shadow-lg overflow-hidden`, { elevation: 5 }]}>
            <Text style={tw`text-lg font-bold text-indigo-950 p-4 border-b border-slate-100 text-center`}>Product Photo</Text>
            
            <TouchableOpacity 
              style={tw`p-4 border-b border-slate-100`}
              onPress={() => { setPhotoModalVisible(false); takePhoto(); }}
            >
              <Text style={tw`text-base text-center text-indigo-950 font-medium`}>Take Photo</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={tw`p-4 border-b border-slate-100`}
              onPress={() => { setPhotoModalVisible(false); pickImage(); }}
            >
              <Text style={tw`text-base text-center text-indigo-950 font-medium`}>Choose from Gallery</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={tw`p-4 bg-slate-50`}
              onPress={() => setPhotoModalVisible(false)}
            >
              <Text style={tw`text-base text-center text-red-500 font-bold`}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      </View>
    </SafeAreaView>
  );
}