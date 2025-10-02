import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import {
  getStoreMenuItems,
  getCategoryMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleItemAvailability,
  getStoreCategories
} from '@/services/menuService';
import { MenuItem, CreateMenuItemData, UpdateMenuItemData } from '@/types/menu-advanced';
import { MenuCategory } from '@/types/shared';
import { useToast } from '@/hooks/use-toast';

// ========================================
// QUERY KEYS
// ========================================

export const menuKeys = {
  all: ['menu'] as const,
  items: () => [...menuKeys.all, 'items'] as const,
  item: (id: string) => [...menuKeys.items(), id] as const,
  storeItems: (storeId: string) => [...menuKeys.items(), 'store', storeId] as const,
  categoryItems: (storeId: string, categoryId: string) => 
    [...menuKeys.items(), 'store', storeId, 'category', categoryId] as const,
  categories: () => [...menuKeys.all, 'categories'] as const,
  storeCategories: (storeId: string) => [...menuKeys.categories(), 'store', storeId] as const,
};

// ========================================
// HOOKS - ITEMS
// ========================================

/**
 * Hook para buscar todos os itens de uma loja com cache
 */
export function useMenuItems(storeId?: string) {
  return useQuery({
    queryKey: menuKeys.storeItems(storeId || ''),
    queryFn: () => getStoreMenuItems(storeId!),
    enabled: !!storeId, // Só executa se storeId existir
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

/**
 * Hook para buscar itens de uma categoria específica
 */
export function useCategoryMenuItems(storeId?: string, categoryId?: string) {
  return useQuery({
    queryKey: menuKeys.categoryItems(storeId || '', categoryId || ''),
    queryFn: () => getCategoryMenuItems(storeId!, categoryId!),
    enabled: !!storeId && !!categoryId,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hook para buscar um item específico
 */
export function useMenuItem(itemId?: string, options?: Omit<UseQueryOptions<MenuItem | null>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: menuKeys.item(itemId || ''),
    queryFn: () => getMenuItemById(itemId!),
    enabled: !!itemId,
    ...options,
  });
}

/**
 * Hook para criar item com invalidação automática de cache
 */
export function useCreateMenuItem() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: (data: CreateMenuItemData) => createMenuItem(data),
    onSuccess: (itemId, variables) => {
      // Invalidar cache da loja
      queryClient.invalidateQueries({ 
        queryKey: menuKeys.storeItems(variables.storeId) 
      });
      
      // Invalidar cache da categoria
      queryClient.invalidateQueries({ 
        queryKey: menuKeys.categoryItems(variables.storeId, variables.categoryId) 
      });
      
      toast({
        title: '✅ Item criado!',
        description: `"${variables.name}" foi adicionado ao cardápio`,
      });
    },
    onError: (error: any) => {
      toast({
        title: '❌ Erro ao criar item',
        description: error.message || 'Tente novamente',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook para atualizar item com optimistic update
 */
export function useUpdateMenuItem() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: ({ itemId, updates }: { itemId: string; updates: UpdateMenuItemData }) => 
      updateMenuItem(itemId, updates),
      
    // Optimistic update - atualizar UI antes da resposta
    onMutate: async ({ itemId, updates }) => {
      // Cancelar queries em andamento
      await queryClient.cancelQueries({ queryKey: menuKeys.item(itemId) });
      
      // Snapshot do valor anterior
      const previousItem = queryClient.getQueryData<MenuItem>(menuKeys.item(itemId));
      
      // Optimistic update
      if (previousItem) {
        queryClient.setQueryData<MenuItem>(menuKeys.item(itemId), {
          ...previousItem,
          ...updates,
          updatedAt: new Date(),
        });
      }
      
      return { previousItem };
    },
    
    // Em caso de erro, reverter para valor anterior
    onError: (error: any, variables, context) => {
      if (context?.previousItem) {
        queryClient.setQueryData(
          menuKeys.item(variables.itemId), 
          context.previousItem
        );
      }
      
      toast({
        title: '❌ Erro ao atualizar',
        description: error.message || 'Tente novamente',
        variant: 'destructive',
      });
    },
    
    // Sempre invalidar cache após sucesso/erro
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: menuKeys.item(variables.itemId) });
      
      // Invalidar lista de itens também
      queryClient.invalidateQueries({ 
        predicate: (query) => 
          query.queryKey[0] === 'menu' && 
          query.queryKey[1] === 'items'
      });
    },
    
    onSuccess: () => {
      toast({
        title: '✅ Item atualizado!',
      });
    },
  });
}

/**
 * Hook para deletar item
 */
export function useDeleteMenuItem() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: (itemId: string) => deleteMenuItem(itemId),
    onSuccess: (_, itemId) => {
      // Remover item do cache
      queryClient.removeQueries({ queryKey: menuKeys.item(itemId) });
      
      // Invalidar todas as listas
      queryClient.invalidateQueries({ 
        predicate: (query) => 
          query.queryKey[0] === 'menu' && 
          query.queryKey[1] === 'items'
      });
      
      toast({
        title: '✅ Item removido',
      });
    },
    onError: (error: any) => {
      toast({
        title: '❌ Erro ao remover item',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook para toggle disponibilidade com optimistic update
 */
export function useToggleItemAvailability() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: ({ itemId, isAvailable }: { itemId: string; isAvailable: boolean }) =>
      toggleItemAvailability(itemId, isAvailable),
      
    // Optimistic update imediato
    onMutate: async ({ itemId, isAvailable }) => {
      await queryClient.cancelQueries({ queryKey: menuKeys.item(itemId) });
      
      const previousItem = queryClient.getQueryData<MenuItem>(menuKeys.item(itemId));
      
      if (previousItem) {
        queryClient.setQueryData<MenuItem>(menuKeys.item(itemId), {
          ...previousItem,
          isAvailable,
          updatedAt: new Date(),
        });
      }
      
      // Também atualizar nas listas
      queryClient.setQueriesData<MenuItem[]>(
        { predicate: (query) => query.queryKey.includes('items') },
        (old) => old?.map(item => 
          item.id === itemId ? { ...item, isAvailable } : item
        )
      );
      
      return { previousItem };
    },
    
    onError: (error: any, variables, context) => {
      if (context?.previousItem) {
        queryClient.setQueryData(menuKeys.item(variables.itemId), context.previousItem);
      }
      
      toast({
        title: '❌ Erro ao atualizar disponibilidade',
        description: error.message,
        variant: 'destructive',
      });
    },
    
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({ queryKey: menuKeys.item(variables.itemId) });
    },
    
    onSuccess: (_, { isAvailable }) => {
      toast({
        title: isAvailable ? '✅ Item disponível' : '⚪ Item indisponível',
      });
    },
  });
}

// ========================================
// HOOKS - CATEGORIES
// ========================================

/**
 * Hook para buscar categorias de uma loja
 */
export function useStoreCategories(storeId?: string) {
  return useQuery({
    queryKey: menuKeys.storeCategories(storeId || ''),
    queryFn: () => getStoreCategories(storeId!),
    enabled: !!storeId,
    staleTime: 1000 * 60 * 10, // 10 minutos (categorias mudam menos)
  });
}

// ========================================
// HOOKS - UTILITIES
// ========================================

/**
 * Hook para prefetch de item (carregar antes de precisar)
 */
export function usePrefetchMenuItem() {
  const queryClient = useQueryClient();
  
  return (itemId: string) => {
    queryClient.prefetchQuery({
      queryKey: menuKeys.item(itemId),
      queryFn: () => getMenuItemById(itemId),
      staleTime: 1000 * 60 * 5,
    });
  };
}

/**
 * Hook para invalidar cache manualmente
 */
export function useInvalidateMenuCache() {
  const queryClient = useQueryClient();
  
  return {
    invalidateAll: () => {
      queryClient.invalidateQueries({ queryKey: menuKeys.all });
    },
    invalidateItems: (storeId?: string) => {
      if (storeId) {
        queryClient.invalidateQueries({ queryKey: menuKeys.storeItems(storeId) });
      } else {
        queryClient.invalidateQueries({ queryKey: menuKeys.items() });
      }
    },
    invalidateCategories: (storeId?: string) => {
      if (storeId) {
        queryClient.invalidateQueries({ queryKey: menuKeys.storeCategories(storeId) });
      } else {
        queryClient.invalidateQueries({ queryKey: menuKeys.categories() });
      }
    },
  };
} 