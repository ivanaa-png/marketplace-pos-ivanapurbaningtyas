import { openDB, IDBPDatabase } from 'idb';
import { Product, Transaction } from '../types';

const DB_NAME = 'lumina_store_db';
const DB_VERSION = 2;

export interface LuminaDB extends IDBPDatabase {
  products: Product;
  transactions: Transaction;
}

export const initDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
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
    },
  });
};

// Config CRUD
export const configDB = {
  async get(key: string) {
    const db = await initDB();
    return db.get('config', key);
  },
  async set(key: string, value: any) {
    const db = await initDB();
    return db.put('config', value, key);
  }
};

// Products CRUD
export const productsDB = {
  async getAll(): Promise<Product[]> {
    const db = await initDB();
    return db.getAll('products');
  },
  async getById(id: string): Promise<Product | undefined> {
    const db = await initDB();
    return db.get('products', id);
  },
  async add(product: Product) {
    const db = await initDB();
    return db.add('products', product);
  },
  async update(product: Product) {
    const db = await initDB();
    return db.put('products', product);
  },
  async delete(id: string) {
    const db = await initDB();
    return db.delete('products', id);
  },
  async bulkAdd(products: Product[]) {
    const db = await initDB();
    const tx = db.transaction('products', 'readwrite');
    for (const product of products) {
      tx.store.put(product);
    }
    await tx.done;
  }
};

// Transactions CRUD
export const transactionsDB = {
  async getAll(): Promise<Transaction[]> {
    const db = await initDB();
    return db.getAll('transactions');
  },
  async add(transaction: Transaction) {
    const db = await initDB();
    return db.add('transactions', transaction);
  },
  async delete(id: string) {
    const db = await initDB();
    return db.delete('transactions', id);
  }
};
