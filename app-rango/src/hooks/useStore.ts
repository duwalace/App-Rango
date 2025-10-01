import { useState, useEffect } from 'react';
import { Store } from '../types/shared';
import { 
  getStoreById, 
  getActiveStores,
  subscribeToStore 
} from '../services/storeService';

/**
 * Hook para buscar uma loja específica em tempo real
 */
export const useStore = (storeId: string | null) => {
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!storeId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    // Subscrever às mudanças da loja em tempo real
    const unsubscribe = subscribeToStore(storeId, (storeData) => {
      setStore(storeData);
      setError(null);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [storeId]);

  return { store, loading, error };
};

/**
 * Hook para buscar todas as lojas ativas
 */
export const useActiveStores = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        setLoading(true);
        const activeStores = await getActiveStores();
        setStores(activeStores);
        setError(null);
      } catch (err) {
        setError('Erro ao carregar lojas');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, []);

  return { stores, loading, error, refetch: () => {} };
}; 