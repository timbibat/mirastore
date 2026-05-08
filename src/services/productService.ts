import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from './firebase';

export interface Product {
  id?: string;
  name: string;
  price: number;
  stock: number;
  unit: string;
  status: string;
  isFastMoving: boolean;
  imageUrl?: string;
  category?: string;
  createdAt: any;
}

const PRODUCTS_COLLECTION = 'products';

export const productService = {
  // Fetch all products ordered by creation date
  async getProducts(): Promise<Product[]> {
    try {
      const q = query(collection(db, PRODUCTS_COLLECTION), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
    } catch (error: any) {
      console.error('Error fetching products:', error);
      // Only show alert if it's a permission issue or network error
      if (error.code === 'permission-denied') {
        import('react-native').then(({ Alert }) => 
          Alert.alert('Database Error', 'Access denied. Please check your Firestore Security Rules.')
        );
      }
      return [];
    }
  },

  // Add new product with optional image
  async addProduct(product: Product, imageUri?: string): Promise<string> {
    let imageUrl = '';
    
    if (imageUri) {
      const response = await fetch(imageUri);
      const blob = await response.blob();
      const storageRef = ref(storage, `products/${product.name}_${Date.now()}`);
      await uploadBytes(storageRef, blob);
      imageUrl = await getDownloadURL(storageRef);
    }

    const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), {
      ...product,
      imageUrl,
      createdAt: new Date()
    });

    return docRef.id;
  },

  // Update existing product
  async updateProduct(id: string, updates: Partial<Product>): Promise<void> {
    const productRef = doc(db, PRODUCTS_COLLECTION, id);
    await updateDoc(productRef, {
      ...updates,
      updatedAt: new Date()
    });
  },

  // Delete product and its image
  async deleteProduct(id: string, imageUrl?: string): Promise<void> {
    await deleteDoc(doc(db, PRODUCTS_COLLECTION, id));
    
    if (imageUrl) {
      try {
        const imageRef = ref(storage, imageUrl);
        await deleteObject(imageRef);
      } catch (error) {
        console.error('Error deleting image:', error);
      }
    }
  }
};
