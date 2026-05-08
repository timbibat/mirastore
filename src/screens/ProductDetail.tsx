import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { Button } from '../components/Button';
import { ArrowLeft, Edit3, Trash2 } from 'lucide-react-native';

export default function ProductDetail({ route, navigation }: any) {
  const { product } = route.params;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <ArrowLeft color={colors.onSurface} size={24} onPress={() => navigation.goBack()} />
        <View style={styles.headerActions}>
          <Edit3 color={colors.onSurface} size={20} style={styles.icon} />
          <Trash2 color={colors.crimson} size={20} />
        </View>
      </View>

      <View style={styles.imagePlaceholder}>
        <Text style={styles.imageText}>Product Image</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.sku}>{product.sku}</Text>
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.price}>${product.price}</Text>

        <View style={styles.stockSection}>
          <View>
            <Text style={styles.stockLabel}>Available Stock</Text>
            <Text style={[
              styles.stockValue,
              product.stock === 0 ? styles.outOfStock : product.stock < 10 ? styles.lowStock : styles.inStock
            ]}>
              {product.stock} Units
            </Text>
          </View>
          <Button title="Update Stock" variant="outline" />
        </View>

        <View style={styles.detailsBox}>
          <Text style={styles.detailsTitle}>Product Details</Text>
          <Text style={styles.detailsText}>
            This is a high-quality product designed for maximum efficiency and durability. 
            Perfect for professional use in industrial environments.
          </Text>
        </View>
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
  headerActions: {
    flexDirection: 'row',
  },
  icon: {
    marginRight: spacing.md,
  },
  imagePlaceholder: {
    height: 300,
    backgroundColor: colors.slate50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageText: {
    color: colors.slate500,
  },
  content: {
    padding: spacing.md,
  },
  sku: {
    fontSize: 12,
    color: colors.slate500,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.onSurface,
    marginBottom: spacing.xs,
  },
  price: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: spacing.lg,
  },
  stockSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: spacing.radius,
    borderWidth: 1,
    borderColor: colors.slate200,
    marginBottom: spacing.lg,
  },
  stockLabel: {
    fontSize: 12,
    color: colors.slate500,
  },
  stockValue: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 2,
  },
  inStock: { color: colors.primary },
  lowStock: { color: colors.amber },
  outOfStock: { color: colors.crimson },
  detailsBox: {
    marginTop: spacing.md,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.onSurface,
    marginBottom: spacing.sm,
  },
  detailsText: {
    fontSize: 14,
    color: colors.onSurfaceVariant,
    lineHeight: 20,
  },
});
