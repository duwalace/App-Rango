// src/contexts/AuthContext.tsx
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { User, onAuthStateChanged, signOut, AuthError } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, db } from '../services/firebaseConfig';
import { UserRole } from '../services/authService';

interface AppUser extends User {
  role: UserRole;
}

interface AuthContextType {
  // Unificando usuarioLogado e userRole para maior consistência
  currentUser: AppUser | null;
  // Mantendo compatibilidade com código antigo
  usuarioLogado: AppUser | null;
  userRole: UserRole | undefined;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Monitorar estado de autenticação do Firebase
  useEffect(() => {
    console.log('=== CONFIGURANDO onAuthStateChanged ===');
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('=== onAuthStateChanged DISPARADO ===');
      console.log('User recebido:', user ? user.email : 'null');
      
      if (user) {
        console.log('Usuário está logado, buscando role no Firestore...');
        // Usuário está logado, buscar role no Firestore
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const role = userData.role as UserRole;
            console.log('Dados do usuário encontrados:', role);
            setCurrentUser({ ...user, role });
            console.log('✅ Estado atualizado - usuário logado');
          } else {
            console.log('❌ Documento do usuário não existe, fazendo logout...');
            // Documento não existe, fazer logout
            await signOut(auth);
            setCurrentUser(null);
          }
        } catch (error) {
          console.error('❌ Erro ao buscar dados do usuário:', error);
          setCurrentUser(null);
        }
      } else {
        console.log('✅ Usuário NÃO está logado - limpando estado');
        // Usuário não está logado
        setCurrentUser(null);
      }
      
      console.log('Definindo loading como false');
      setLoading(false);
      console.log('=== onAuthStateChanged CONCLUÍDO ===');
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    console.log('=== AUTHCONTEXT: INICIANDO LOGOUT ===');
    console.log('Estado atual - currentUser:', currentUser?.email);
    console.log('Estado atual - userRole:', currentUser?.role);
    
    try {
      // 1. Limpar estado local PRIMEIRO (para UI responsiva)
      console.log('🧼 Limpando estado local...');
      setCurrentUser(null);
      
      // 2. Fazer signOut do Firebase
      console.log('🚪 Chamando signOut do Firebase...');
      await signOut(auth);
      console.log('✅ signOut do Firebase concluído');
      
      // 3. Limpar AsyncStorage (Firebase auth keys) - não crítico
      console.log('🧹 Limpando AsyncStorage...');
      try {
        const keys = await AsyncStorage.getAllKeys();
        const firebaseKeys = keys.filter(key => 
          key.startsWith('firebase:') || 
          key.startsWith('firebaseAuth:') ||
          key.includes('auth')
        );
        
        if (firebaseKeys.length > 0) {
          console.log('🗑️ Removendo', firebaseKeys.length, 'chaves do Firebase');
          await AsyncStorage.multiRemove(firebaseKeys);
        }
      } catch (storageError) {
        console.warn('⚠️ Erro ao limpar AsyncStorage (não crítico):', storageError);
        // Não interrompe o logout - continua normalmente
      }
      
      console.log('✅ LOGOUT REALIZADO COM SUCESSO!');
      
    } catch (error: any) {
      console.error('❌ ERRO NO LOGOUT (AuthContext):', error);
      console.error('Mensagem:', error?.message || 'Erro desconhecido');
      
      // Garantir que o estado seja limpo mesmo com erro
      setCurrentUser(null);
      
      // Tentar limpar AsyncStorage mesmo com erro (não crítico)
      try {
        await AsyncStorage.clear();
        console.log('✅ AsyncStorage limpo completamente (fallback)');
      } catch (clearError) {
        console.error('❌ Erro ao limpar AsyncStorage:', clearError);
        // Ignora erro de storage - não é crítico
      }
      
      // NÃO fazer throw - logout deve sempre funcionar
      console.log('✅ Logout forçado com sucesso (apesar dos erros)');
    }
  };

  const value = { 
    currentUser, 
    usuarioLogado: currentUser, // Alias para compatibilidade
    userRole: currentUser?.role, // Extrair role para acesso direto
    loading, 
    logout 
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};