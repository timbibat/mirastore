import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, ActivityIndicator, Alert, useWindowDimensions, Image } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { Button } from '../components/Button';
import { X, Camera, Image as ImageIcon } from 'lucide-react-native';
import { productService, Product } from '../services/productService';
import * as ImagePicker from 'expo-image-picker';

export default function AddItem({ route, navigation }: any) {
  const { width } = useWindowDimensions();
  const isLargeScreen = width > 768;
  const editingProduct = route.params?.product as Product;
  
  const [loading, setLoading] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(editingProduct?.imageUrl || null);
  const [form, setForm] = useState({
    name: editingProduct?.name || '',
    sku: editingProduct?.sku || '',
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
    if (!form.name || !form.sku || !form.price || !form.stock) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      const productData: any = {
        name: form.name,
        sku: form.sku,
        price: parseFloat(form.price),
        stock: parseInt(form.stock),
        unit: form.unit,
        status: parseInt(form.stock) > 10 ? 'IN STOCK' : parseInt(form.stock) > 0 ? 'LOW STOCK' : 'OUT OF STOCK',
        isFastMoving: form.isFastMoving,
        category: form.category,
      };

      if (editingProduct?.id) {
        // Update mode
        await productService.updateProduct(editingProduct.id, productData);
        navigation.navigate('InventoryList');
      } else {
        // Add mode
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
    <View style={styles.container}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{editingProduct ? 'Edit Product' : 'Add New Item'}</Text>
          <X color={colors.onSurface} size={24} onPress={() => navigation.goBack()} />
        </View>

        <View style={styles.form}>
          {/* Image Picker */}
          <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.previewImage} />
            ) : (
              <>
                <Camera color={colors.slate500} size={32} />
                <Text style={styles.imagePickerText}>Add Product Photo</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Product Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Kopiko Black"
              value={form.name}
              onChangeText={(v) => setForm({ ...form, name: v })}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>SKU *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. KP-BLK-01"
              value={form.sku}
              onChangeText={(v) => setForm({ ...form, sku: v })}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: spacing.sm }]}>
              <Text style={styles.label}>Price (₱) *</Text>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                keyboardType="numeric"
                value={form.price}
                onChangeText={(v) => setForm({ ...form, price: v })}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1, marginLeft: spacing.sm }]}>
              <Text style={styles.label}>Initial Stock *</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                keyboardType="numeric"
                value={form.stock}
                onChangeText={(v) => setForm({ ...form, stock: v })}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: spacing.sm }]}>
              <Text style={styles.label}>Unit</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. sachets"
                value={form.unit}
                onChangeText={(v) => setForm({ ...form, unit: v })}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1, marginLeft: spacing.sm }]}>
              <Text style={styles.label}>Category</Text>
              <TextInput
                style={styles.input}
                placeholder="General"
                value={form.category}
                onChangeText={(v) => setForm({ ...form, category: v })}
              />
            </View>
          </View>

          <TouchableOpacity 
            style={styles.switchRow}
            onPress={() => setForm({ ...form, isFastMoving: !form.isFastMoving })}
          >
            <Text style={styles.label}>Mark as Fast Moving</Text>
            <View style={[styles.customSwitch, form.isFastMoving && styles.customSwitchActive]}>
              <View style={[styles.customSwitchThumb, form.isFastMoving && styles.customSwitchThumbActive]} />
            </View>
          </TouchableOpacity>

          <Button 
            title={loading ? "Saving..." : (editingProduct ? "Update Product" : "Save Product")} 
            style={styles.saveButton} 
            onPress={handleSave}
            disabled={loading}
          />
          {loading && <ActivityIndicator style={{ marginTop: 10 }} color={colors.primary} />}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
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
  header: {
    padding: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.onSurface,
  },
  form: {
    padding: spacing.md,
  },
  imagePicker: {
    height: 180,
    backgroundColor: colors.white,
    borderRadius: spacing.radius,
    borderWidth: 1,
    borderColor: colors.slate200,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePickerText: {
    color: colors.slate500,
    marginTop: 8,
    fontSize: 14,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.onSurface,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.slate200,
    borderRadius: spacing.radius,
    padding: spacing.sm,
    fontSize: 16,
    color: colors.onSurface,
  },
  row: {
    flexDirection: 'row',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  customSwitch: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.slate200,
    padding: 2,
  },
  customSwitchActive: {
    backgroundColor: colors.primary,
  },
  customSwitchThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.white,
  },
  customSwitchThumbActive: {
    alignSelf: 'flex-end',
  },
  saveButton: {
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
  },
});
