import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { MenuCategory, MenuItem } from '@/types/store';

export const useMenuCategories = (storeId: string) => {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!storeId) return;

    const categoriesRef = collection(db, 'menuCategories');
    const q = query(
      categoriesRef,
      where('storeId', '==', storeId),
      orderBy('order', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const categoriesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MenuCategory[];
      
      setCategories(categoriesData);
      setError(null);
      setLoading(false);
    }, (error) => {
      console.error('Erro ao buscar categorias:', error);
      setError('Erro ao carregar categorias');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [storeId]);

  const addCategory = async (category: Omit<MenuCategory, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await addDoc(collection(db, 'menuCategories'), {
        ...category,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Erro ao adicionar categoria:', error);
      throw error;
    }
  };

  const updateCategory = async (categoryId: string, updates: Partial<MenuCategory>) => {
    try {
      const categoryRef = doc(db, 'menuCategories', categoryId);
      await updateDoc(categoryRef, {
        ...updates,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error);
      throw error;
    }
  };

  const deleteCategory = async (categoryId: string) => {
    try {
      await deleteDoc(doc(db, 'menuCategories', categoryId));
    } catch (error) {
      console.error('Erro ao deletar categoria:', error);
      throw error;
    }
  };

  return { 
    categories, 
    loading, 
    error, 
    addCategory, 
    updateCategory, 
    deleteCategory 
  };
};

export const useMenuItems = (storeId: string, categoryId?: string) => {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!storeId) return;

    const itemsRef = collection(db, 'menuItems');
    let q = query(
      itemsRef,
      where('storeId', '==', storeId),
      orderBy('order', 'asc')
    );

    if (categoryId) {
      q = query(
        itemsRef,
        where('storeId', '==', storeId),
        where('categoryId', '==', categoryId),
        orderBy('order', 'asc')
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const itemsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MenuItem[];
      
      setItems(itemsData);
      setError(null);
      setLoading(false);
    }, (error) => {
      console.error('Erro ao buscar itens do cardápio:', error);
      setError('Erro ao carregar itens do cardápio');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [storeId, categoryId]);

  const addMenuItem = async (item: Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await addDoc(collection(db, 'menuItems'), {
        ...item,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Erro ao adicionar item:', error);
      throw error;
    }
  };

  const updateMenuItem = async (itemId: string, updates: Partial<MenuItem>) => {
    try {
      const itemRef = doc(db, 'menuItems', itemId);
      await updateDoc(itemRef, {
        ...updates,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Erro ao atualizar item:', error);
      throw error;
    }
  };

  const deleteMenuItem = async (itemId: string) => {
    try {
      await deleteDoc(doc(db, 'menuItems', itemId));
    } catch (error) {
      console.error('Erro ao deletar item:', error);
      throw error;
    }
  };

  return { 
    items, 
    loading, 
    error, 
    addMenuItem, 
    updateMenuItem, 
    deleteMenuItem 
  };
};
