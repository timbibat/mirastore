import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, useWindowDimensions, Alert, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
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

    if (width > 768) { // Web detection
      if (window.confirm(`Are you sure you want to delete ${product.name}?`)) {
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
    <View style={styles.container}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <ArrowLeft color={colors.onSurface} size={24} onPress={() => navigation.goBack()} />
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={handleEdit}>
              <Edit3 color={colors.onSurface} size={24} style={styles.icon} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDelete}>
              <Trash2 color={colors.error} size={24} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.imageContainer}>
          {product.imageUrl ? (
            <Image source={{ uri: product.imageUrl }} style={styles.productImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imageText}>No Product Image</Text>
            </View>
          )}
        </View>

        <View style={styles.content}>
          <Text style={styles.sku}>{product.sku}</Text>
          <Text style={styles.name}>{product.name}</Text>
          <Text style={styles.price}>₱{product.price}</Text>

          <View style={styles.stockSection}>
            <View>
              <Text style={styles.stockLabel}>Available Stock</Text>
              <Text style={[
                styles.stockValue,
                product.stock === 0 ? styles.outOfStock : product.stock < 10 ? styles.lowStock : styles.inStock
              ]}>
                {product.stock} {product.unit || 'Units'}
              </Text>
            </View>
            <Button title="Update Stock" variant="outline" onPress={handleEdit} />
          </View>

          <View style={styles.detailsBox}>
            <Text style={styles.detailsTitle}>Product Details</Text>
            <Text style={styles.detailsText}>
              Category: {product.category || 'General'}
              {product.isFastMoving ? '\n✨ Fast Moving Item' : ''}
            </Text>
          </View>
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
  },
  headerActions: {
    flexDirection: 'row',
  },
  icon: {
    marginRight: spacing.md,
  },
  imageContainer: {
    width: '100%',
    height: 300,
    backgroundColor: colors.slate50,
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    flex: 1,
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
