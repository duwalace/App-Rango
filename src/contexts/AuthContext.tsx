// src/contexts/AuthContext.tsx
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebaseConfig';
import { UserRole } from '../services/authService';

interface AuthContextType {
  usuarioLogado: User | null;
  userRole: UserRole | null;
  loading: boolean;
  login: (userData: User, role?: UserRole) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [usuarioLogado, setUsuarioLogado] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
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
            console.log('Dados do usuário encontrados:', userData.role);
            setUsuarioLogado(user);
            setUserRole(userData.role as UserRole);
            console.log('✅ Estado atualizado - usuário logado');
          } else {
            console.log('❌ Documento do usuário não existe, fazendo logout...');
            // Documento não existe, fazer logout
            await signOut(auth);
            setUsuarioLogado(null);
            setUserRole(null);
          }
        } catch (error) {
          console.error('❌ Erro ao buscar dados do usuário:', error);
          setUsuarioLogado(null);
          setUserRole(null);
        }
      } else {
        console.log('✅ Usuário NÃO está logado - limpando estado');
        // Usuário não está logado
        setUsuarioLogado(null);
        setUserRole(null);
      }
      
      console.log('Definindo loading como false');
      setLoading(false);
      console.log('=== onAuthStateChanged CONCLUÍDO ===');
    });

    return () => unsubscribe();
  }, []);

  const login = (userData: User, role?: UserRole) => {
    setUsuarioLogado(userData);
    setUserRole(role || 'cliente');
  };

  const logout = async () => {
    console.log('=== AUTHCONTEXT: INICIANDO LOGOUT ===');
    console.log('Estado atual - usuarioLogado:', usuarioLogado?.email);
    console.log('Estado atual - userRole:', userRole);
    
    try {
      console.log('Chamando signOut do Firebase...');
      await signOut(auth);
      console.log('✅ signOut do Firebase concluído');
      
      console.log('Limpando estado local...');
      setUsuarioLogado(null);
      setUserRole(null);
      console.log('✅ Estado local limpo');
      
      console.log('✅ LOGOUT REALIZADO COM SUCESSO!');
      console.log('onAuthStateChanged deve ser disparado automaticamente');
    } catch (error) {
      console.error('❌ ERRO NO LOGOUT (AuthContext):', error);
      console.error('Tipo do erro:', typeof error);
      console.error('Mensagem:', error.message);
      console.error('Código:', error.code);
      throw error;
    }
  };

  const value = { usuarioLogado, userRole, loading, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};