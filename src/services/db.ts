import { openDB, IDBPDatabase } from 'idb';
import { Product, Transaction, Supplier, Purchase, PurchaseItem } from '../types';

const DB_NAME = 'lumina_store_db';
const DB_VERSION = 5;

let dbPromise: Promise<IDBPDatabase<any>> | null = null;

export const getDB = () => {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('products')) {
          db.createObjectStore('products', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('transactions')) {
          db.createObjectStore('transactions', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('config')) {
          db.createObjectStore('config');
        }
        if (!db.objectStoreNames.contains('suppliers')) {
          db.createObjectStore('suppliers', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('purchases')) {
          db.createObjectStore('purchases', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('purchase_items')) {
          db.createObjectStore('purchase_items', { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
};

// Config CRUD
export const configDB = {
  async get(key: string) {
    const db = await getDB();
    return db.get('config', key);
  },
  async set(key: string, value: any) {
    const db = await getDB();
    return db.put('config', value, key);
  }
};

// Products CRUD
export const productsDB = {
  async getAll(): Promise<Product[]> {
    const db = await getDB();
    return db.getAll('products');
  },
  async getById(id: string): Promise<Product | undefined> {
    const db = await getDB();
    return db.get('products', id);
  },
  async add(product: Product) {
    const db = await getDB();
    return db.add('products', product);
  },
  async update(product: Product) {
    const db = await getDB();
    return db.put('products', product);
  },
  async delete(id: string) {
    const db = await getDB();
    return db.delete('products', id);
  },
  async bulkAdd(products: Product[]) {
    const db = await getDB();
    const tx = db.transaction('products', 'readwrite');
    const store = tx.objectStore('products');
    for (const product of products) {
      await store.put(product);
    }
    await tx.done;
  }
};

// Transactions CRUD
export const transactionsDB = {
  async getAll(): Promise<Transaction[]> {
    const db = await getDB();
    return db.getAll('transactions');
  },
  async add(transaction: Transaction) {
    const db = await getDB();
    return db.add('transactions', transaction);
  },
  async delete(id: string) {
    const db = await getDB();
    return db.delete('transactions', id);
  }
};

// Suppliers CRUD
export const suppliersDB = {
  async getAll(): Promise<Supplier[]> {
    const db = await getDB();
    return db.getAll('suppliers');
  },
  async add(supplier: Supplier) {
    const db = await getDB();
    return db.add('suppliers', supplier);
  },
  async update(supplier: Supplier) {
    const db = await getDB();
    return db.put('suppliers', supplier);
  },
  async delete(id: string) {
    const db = await getDB();
    return db.delete('suppliers', id);
  },
  async seed() {
    const existing = await this.getAll();
    if (existing.length === 0) {
      const initialSuppliers: Supplier[] = [
        {
          id: 'SPL-001',
          nama_vendor: 'Textile Elite Indonesia',
          kontak_person: 'Bapak Ahmad',
          telepon: '08123456789',
          alamat: 'Jl. Tekstil No. 10, Bandung',
          kategori: 'Fabrics'
        },
        {
          id: 'SPL-002',
          nama_vendor: 'Grand Luxury Accessories',
          kontak_person: 'Ibu Sarah',
          telepon: '08112233445',
          alamat: 'Kuningan City, Jakarta Selatan',
          kategori: 'Hardware & Accessories'
        }
      ];
      const db = await getDB();
      const tx = db.transaction('suppliers', 'readwrite');
      const store = tx.objectStore('suppliers');
      for (const s of initialSuppliers) {
        await store.put(s);
      }
      await tx.done;
    }
  }
};

// Purchases CRUD
export const purchasesDB = {
  async getAll(): Promise<Purchase[]> {
    const db = await getDB();
    const purchases = await db.getAll('purchases');
    const allItems = await db.getAll('purchase_items');
    return purchases.map(p => ({
      ...p,
      items: allItems.filter(item => item.purchase_id === p.id)
    }));
  },
  async add(purchase: Purchase) {
    const db = await getDB();
    const tx = db.transaction(['purchases', 'purchase_items', 'products'], 'readwrite');
    
    // Add purchase meta
    const pStore = tx.objectStore('purchases');
    const { items, ...pData } = purchase;
    await pStore.add(pData);
    
    // Add items and update stock
    const iStore = tx.objectStore('purchase_items');
    for (const item of items) {
      await iStore.add(item);
      
      // Auto-Stock Update logic: If status is 'Selesai' (Completed)
      if (purchase.status === 'Selesai') {
        const prodStore = tx.objectStore('products');
        const product = await prodStore.get(item.product_id);
        if (product) {
          product.stock += item.qty_beli;
          await prodStore.put(product);
        }
      }
    }
    
    await tx.done;
  },
  async delete(id: string) {
    const db = await getDB();
    const tx = db.transaction(['purchases', 'purchase_items'], 'readwrite');
    await tx.objectStore('purchases').delete(id);
    
    const iStore = tx.objectStore('purchase_items');
    const allItems = await iStore.getAll();
    for (const item of allItems) {
      if (item.purchase_id === id) {
        await iStore.delete(item.id);
      }
    }
    await tx.done;
  }
};
