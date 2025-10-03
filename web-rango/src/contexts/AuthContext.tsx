import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

interface StoreOwner extends User {
  role: 'dono_da_loja' | 'store_owner' | 'dono_do_site';
  storeId?: string;
  storeName?: string;
}

interface AuthContextType {
  user: StoreOwner | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<StoreOwner | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Buscar dados do usuário no Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log('📋 Dados do usuário encontrados:', userData);
            
            if (userData.role === 'dono_da_loja' || userData.role === 'store_owner' || userData.role === 'dono_do_site') {
              setUser({
                ...firebaseUser,
                role: userData.role,
                storeId: userData.storeId,
                storeName: userData.storeName
              });
              console.log('✅ Usuário logado com sucesso. Role:', userData.role);
            } else {
              console.log('❌ Usuário não tem permissão para acessar. Role:', userData.role);
              // Usuário não tem permissão
              await signOut(auth);
              setUser(null);
            }
          } else {
            console.log('❌ Documento do usuário não encontrado');
            await signOut(auth);
            setUser(null);
          }
        } catch (error) {
          console.error('Erro ao buscar dados do usuário:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
