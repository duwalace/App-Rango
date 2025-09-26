// src/contexts/AuthContext.tsx
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { User } from 'firebase/auth'; // Tipo do próprio Firebase

interface AuthContextType {
  usuarioLogado: User | null;
  login: (userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [usuarioLogado, setUsuarioLogado] = useState<User | null>(null);

  const login = (userData: User) => {
    setUsuarioLogado(userData);
  };

  const logout = () => {
    setUsuarioLogado(null);
  };

  const value = { usuarioLogado, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};