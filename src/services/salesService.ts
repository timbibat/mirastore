import { collection, addDoc, getDocs, query, orderBy, Timestamp, runTransaction, doc } from 'firebase/firestore';
import { db } from './firebase';

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  pricePerUnit: number;
  totalPrice: number;
  imageUrl?: string;
}

export interface Sale {
  id?: string;
  items: SaleItem[];
  totalAmount: number;
  timestamp: any;
}

const SALES_COLLECTION = 'sales';
const PRODUCTS_COLLECTION = 'products';

export const salesService = {
  // Record a new sale and update inventory stock
  async recordSale(items: SaleItem[]): Promise<string> {
    const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0);
    
    return await runTransaction(db, async (transaction) => {
      // 1. Validate and update all product stocks
      for (const item of items) {
        const productRef = doc(db, PRODUCTS_COLLECTION, item.productId);
        const productDoc = await transaction.get(productRef);
        
        if (!productDoc.exists()) {
          throw new Error(`Product ${item.productName} not found.`);
        }
        
        const currentStock = productDoc.data().stock;
        if (currentStock < item.quantity) {
          throw new Error(`Not enough stock for ${item.productName}. Available: ${currentStock}`);
        }
        
        const newStock = currentStock - item.quantity;
        const newStatus = newStock > 10 ? 'IN STOCK' : newStock > 0 ? 'LOW STOCK' : 'OUT OF STOCK';
        
        transaction.update(productRef, { 
          stock: newStock,
          status: newStatus,
          updatedAt: Timestamp.now() 
        });
      }

      // 2. Record the sale
      const saleRef = doc(collection(db, SALES_COLLECTION));
      transaction.set(saleRef, {
        items,
        totalAmount,
        timestamp: Timestamp.now()
      });

      return saleRef.id;
    });
  },

  // Fetch all sales ordered by timestamp
  async getSales(): Promise<Sale[]> {
    const q = query(collection(db, SALES_COLLECTION), orderBy('timestamp', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Sale[];
  },

  // Delete a sale and revert product stocks
  async deleteSale(sale: Sale): Promise<void> {
    if (!sale.id) return;

    return await runTransaction(db, async (transaction) => {
      // 1. Revert product stocks
      for (const item of sale.items) {
        const productRef = doc(db, PRODUCTS_COLLECTION, item.productId);
        const productDoc = await transaction.get(productRef);
        
        if (productDoc.exists()) {
          const currentStock = productDoc.data().stock;
          const newStock = currentStock + item.quantity;
          const newStatus = newStock > 10 ? 'IN STOCK' : newStock > 0 ? 'LOW STOCK' : 'OUT OF STOCK';
          
          transaction.update(productRef, { 
            stock: newStock,
            status: newStatus,
            updatedAt: Timestamp.now() 
          });
        }
      }

      // 2. Delete the sale record
      const saleRef = doc(db, SALES_COLLECTION, sale.id!);
      transaction.delete(saleRef);
    });
  }
};
