// src/screens/PerfilLogadoScreen.tsx
import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

const PerfilLogadoScreen = () => {
  const { usuarioLogado, logout } = useAuth();

  // O cabeçalho da sua tela de perfil estilo iFood viria aqui
  // com a imagem, nome, etc.
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Perfil</Text>
      <Text>Bem-vindo!</Text>
      <Text>{usuarioLogado?.email}</Text>
      
      {/* A lista de opções (Conversas, Notificações) viria aqui */}
      
      <Button title="Sair" onPress={logout} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
});

export default PerfilLogadoScreen;