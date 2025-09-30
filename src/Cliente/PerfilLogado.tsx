import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

const PerfilLogadoScreen = () => {
  const { usuarioLogado, logout } = useAuth();

  const handleLogout = () => {
    console.log('=== PERFIL LOGADO: INÍCIO DO PROCESSO DE LOGOUT ===');
    console.log('Usuário logado:', usuarioLogado?.email);
    
    Alert.alert(
      'Sair da conta',
      'Tem certeza que deseja sair da sua conta?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
          onPress: () => {
            console.log('Logout cancelado pelo usuário');
          }
        },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            console.log('Usuário confirmou logout, iniciando processo...');
            try {
              console.log('Chamando função logout do AuthContext...');
              await logout();
              console.log('✅ Logout realizado com sucesso!');
              console.log('Usuário deve ser redirecionado para tela inicial');
            } catch (error) {
              console.error('❌ ERRO NO LOGOUT:', error);
              console.error('Detalhes do erro:', error.message);
              console.error('Stack trace:', error.stack);
              Alert.alert('Erro', 'Não foi possível fazer logout. Tente novamente.');
            }
          },
        },
      ]
    );
  };

  const menuItems = [
    { icon: 'person-outline', title: 'Dados pessoais', onPress: () => console.log('Dados pessoais') },
    { icon: 'location-outline', title: 'Endereços', onPress: () => console.log('Endereços') },
    { icon: 'card-outline', title: 'Formas de pagamento', onPress: () => console.log('Pagamento') },
    { icon: 'notifications-outline', title: 'Notificações', onPress: () => console.log('Notificações') },
    { icon: 'help-circle-outline', title: 'Ajuda', onPress: () => console.log('Ajuda') },
    { icon: 'information-circle-outline', title: 'Sobre', onPress: () => console.log('Sobre') },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header do Perfil */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={40} color="#666" />
            </View>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>Olá!</Text>
            <Text style={styles.userEmail}>{usuarioLogado?.email}</Text>
          </View>
        </View>

        {/* Menu de Opções */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <View style={styles.menuItemLeft}>
                <Ionicons name={item.icon as any} size={24} color="#666" />
                <Text style={styles.menuItemText}>{item.title}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Botão de Sair */}
        <View style={styles.logoutContainer}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#EA1D2C" />
            <Text style={styles.logoutText}>Sair da conta</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: 'white',
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
  },
  menuContainer: {
    backgroundColor: 'white',
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 16,
  },
  logoutContainer: {
    backgroundColor: 'white',
    marginBottom: 32,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  logoutText: {
    fontSize: 16,
    color: '#EA1D2C',
    marginLeft: 16,
    fontWeight: '500',
  },
});

export default PerfilLogadoScreen;