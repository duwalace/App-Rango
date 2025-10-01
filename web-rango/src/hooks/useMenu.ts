import { useState, useEffect } from 'react';
import { MenuCategory, MenuItem } from '@/types/shared';
import { 
  subscribeToStoreCategories,
  subscribeToStoreMenuItems,
  createCategory,
  updateCategory,
  deleteCategory,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem
} from '@/services/menuService';

export const useMenu = (storeId: string) => {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!storeId) {
      setLoading(false);
      return;
    }

    console.log('🔵 Carregando menu da loja:', storeId);

    // Inscrever-se nas categorias
    const unsubscribeCategories = subscribeToStoreCategories(storeId, (categoriesData) => {
      console.log('✅ Categorias recebidas:', categoriesData.length);
      setCategories(categoriesData);
    });

    // Inscrever-se nos itens do menu
    const unsubscribeItems = subscribeToStoreMenuItems(storeId, (itemsData) => {
      console.log('✅ Itens do menu recebidos:', itemsData.length);
      setMenuItems(itemsData);
      setLoading(false);
    });

    return () => {
      console.log('🔴 Cancelando inscrições do menu');
      unsubscribeCategories();
      unsubscribeItems();
    };
  }, [storeId]);

  // Funções para categorias
  const addCategory = async (categoryData: any) => {
    try {
      await createCategory(categoryData);
      return true;
    } catch (err) {
      console.error('Erro ao criar categoria:', err);
      setError('Erro ao criar categoria');
      throw err;
    }
  };

  const editCategory = async (categoryId: string, categoryData: any) => {
    try {
      await updateCategory(categoryId, categoryData);
      return true;
    } catch (err) {
      console.error('Erro ao atualizar categoria:', err);
      setError('Erro ao atualizar categoria');
      throw err;
    }
  };

  const removeCategory = async (categoryId: string) => {
    try {
      await deleteCategory(categoryId);
      return true;
    } catch (err) {
      console.error('Erro ao excluir categoria:', err);
      setError('Erro ao excluir categoria');
      throw err;
    }
  };

  // Funções para itens
  const addMenuItem = async (itemData: any) => {
    try {
      await createMenuItem(itemData);
      return true;
    } catch (err) {
      console.error('Erro ao criar item:', err);
      setError('Erro ao criar item');
      throw err;
    }
  };

  const editMenuItem = async (itemId: string, itemData: any) => {
    try {
      await updateMenuItem(itemId, itemData);
      return true;
    } catch (err) {
      console.error('Erro ao atualizar item:', err);
      setError('Erro ao atualizar item');
      throw err;
    }
  };

  const removeMenuItem = async (itemId: string) => {
    try {
      await deleteMenuItem(itemId);
      return true;
    } catch (err) {
      console.error('Erro ao excluir item:', err);
      setError('Erro ao excluir item');
      throw err;
    }
  };

  // Funções auxiliares
  const getCategoryById = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId);
  };

  const getItemsByCategory = (categoryId: string) => {
    return menuItems.filter(item => item.categoryId === categoryId);
  };

  const getAvailableItems = () => {
    return menuItems.filter(item => item.isAvailable);
  };

  const getActiveCategories = () => {
    return categories.filter(cat => cat.isActive);
  };

  return {
    categories,
    menuItems,
    loading,
    error,
    addCategory,
    editCategory,
    removeCategory,
    addMenuItem,
    editMenuItem,
    removeMenuItem,
    getCategoryById,
    getItemsByCategory,
    getAvailableItems,
    getActiveCategories
  };
};
