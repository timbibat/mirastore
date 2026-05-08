import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, Switch } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { Button } from '../components/Button';
import { X } from 'lucide-react-native';

export default function AddItem({ navigation }: any) {
  const [form, setForm] = useState({
    name: '',
    sku: '',
    price: '',
    initialStock: '',
    category: '',
  });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Add New Item</Text>
        <X color={colors.onSurface} size={24} onPress={() => navigation.goBack()} />
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Product Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Premium Headphones"
            value={form.name}
            onChangeText={(v) => setForm({ ...form, name: v })}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>SKU</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. WH-1000"
            value={form.sku}
            onChangeText={(v) => setForm({ ...form, sku: v })}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: spacing.sm }]}>
            <Text style={styles.label}>Price ($)</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              keyboardType="numeric"
              value={form.price}
              onChangeText={(v) => setForm({ ...form, price: v })}
            />
          </View>
          <View style={[styles.inputGroup, { flex: 1, marginLeft: spacing.sm }]}>
            <Text style={styles.label}>Initial Stock</Text>
            <TextInput
              style={styles.input}
              placeholder="0"
              keyboardType="numeric"
              value={form.initialStock}
              onChangeText={(v) => setForm({ ...form, initialStock: v })}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Category</Text>
          <TextInput
            style={styles.input}
            placeholder="Select category"
            value={form.category}
            onChangeText={(v) => setForm({ ...form, category: v })}
          />
        </View>

        <Button 
          title="Save Product" 
          style={styles.saveButton} 
          onPress={() => navigation.goBack()}
        />
      </View>
    </ScrollView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.onSurface,
  },
  form: {
    padding: spacing.md,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.onSurfaceVariant,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.slate200,
    borderRadius: spacing.radius,
    padding: spacing.sm,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
  },
  saveButton: {
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
  },
});
