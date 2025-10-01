import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Store } from '@/types/store';

export const useStore = (storeId: string) => {
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!storeId) return;

    const storeRef = doc(db, 'stores', storeId);
    
    const unsubscribe = onSnapshot(storeRef, (doc) => {
      if (doc.exists()) {
        const storeData = doc.data() as Store;
        setStore(storeData);
        setError(null);
      } else {
        setError('Loja não encontrada');
      }
      setLoading(false);
    }, (error) => {
      console.error('Erro ao buscar dados da loja:', error);
      setError('Erro ao carregar dados da loja');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [storeId]);

  const updateStore = async (updates: Partial<Store>) => {
    if (!storeId) return;

    try {
      const storeRef = doc(db, 'stores', storeId);
      await updateDoc(storeRef, {
        ...updates,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Erro ao atualizar loja:', error);
      throw error;
    }
  };

  return { store, loading, error, updateStore };
};
