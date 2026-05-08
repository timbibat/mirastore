import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, ActivityIndicator, Alert, useWindowDimensions } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { Button } from '../components/Button';
import { X, Camera } from 'lucide-react-native';
import { productService } from '../services/productService';

export default function AddItem({ navigation }: any) {
  const { width } = useWindowDimensions();
  const isLargeScreen = width > 768;
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    sku: '',
    price: '',
    stock: '',
    unit: 'sachets',
    category: 'General',
    isFastMoving: false
  });

  const handleSave = async () => {
    if (!form.name || !form.sku || !form.price || !form.stock) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      const productData = {
        name: form.name,
        sku: form.sku,
        price: parseFloat(form.price),
        stock: parseInt(form.stock),
        unit: form.unit,
        status: parseInt(form.stock) > 10 ? 'IN STOCK' : parseInt(form.stock) > 0 ? 'LOW STOCK' : 'OUT OF STOCK',
        isFastMoving: form.isFastMoving,
        category: form.category,
        createdAt: new Date()
      };

      await productService.addProduct(productData);
      Alert.alert('Success', 'Product added successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Error adding product:', error);
      Alert.alert('Error', 'Failed to add product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.outerContainer}>
      <ScrollView style={[styles.container, isLargeScreen && styles.largeScreenContainer]}>
        <View style={styles.header}>
          <Text style={styles.title}>Add New Item</Text>
          <X color={colors.onSurface} size={24} onPress={() => navigation.goBack()} />
        </View>

        <View style={styles.form}>
          {/* Image Placeholder */}
          <TouchableOpacity style={styles.imagePicker}>
            <Camera color={colors.slate500} size={32} />
            <Text style={styles.imagePickerText}>Add Product Photo</Text>
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
            title={loading ? "Saving..." : "Save Product"} 
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
    maxWidth: 600,
    width: '100%',
    backgroundColor: colors.white,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: colors.slate100,
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
    height: 150,
    backgroundColor: colors.white,
    borderRadius: spacing.radius,
    borderWidth: 1,
    borderColor: colors.slate200,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
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
