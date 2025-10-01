import { useState, useEffect } from 'react';
import { MenuCategory, MenuItem } from '../types/shared';
import { 
  subscribeToStoreCategories,
  subscribeToStoreMenuItems,
  getCategoryMenuItems
} from '../services/menuService';

/**
 * Hook para buscar categorias de uma loja em tempo real
 */
export const useStoreCategories = (storeId: string | null) => {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!storeId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const unsubscribe = subscribeToStoreCategories(storeId, (categoriesData) => {
      setCategories(categoriesData);
      setError(null);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [storeId]);

  return { categories, loading, error };
};

/**
 * Hook para buscar itens do cardápio em tempo real
 */
export const useStoreMenuItems = (
  storeId: string | null, 
  categoryId?: string | null
) => {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!storeId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const unsubscribe = subscribeToStoreMenuItems(
      storeId, 
      (itemsData) => {
        // Filtrar por categoria se especificado
        const filteredItems = categoryId 
          ? itemsData.filter(item => item.categoryId === categoryId && item.isAvailable)
          : itemsData.filter(item => item.isAvailable);
        
        setItems(filteredItems);
        setError(null);
        setLoading(false);
      },
      categoryId || undefined
    );

    return () => unsubscribe();
  }, [storeId, categoryId]);

  return { items, loading, error };
};

/**
 * Hook para buscar itens de uma categoria específica
 */
export const useCategoryItems = (storeId: string | null, categoryId: string | null) => {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!storeId || !categoryId) {
      setLoading(false);
      return;
    }

    const fetchItems = async () => {
      try {
        setLoading(true);
        const categoryItems = await getCategoryMenuItems(storeId, categoryId);
        setItems(categoryItems);
        setError(null);
      } catch (err) {
        setError('Erro ao carregar itens');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [storeId, categoryId]);

  return { items, loading, error };
}; 