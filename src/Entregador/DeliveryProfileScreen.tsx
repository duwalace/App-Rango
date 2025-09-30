import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

const DeliveryProfileScreen = () => {
  const { usuarioLogado, logout } = useAuth();

  const handleLogout = () => {
    console.log('=== INÍCIO DO PROCESSO DE LOGOUT ===');
    console.log('Usuário logado:', usuarioLogado?.email);
    
    Alert.alert(
      'Sair da conta',
      'Tem certeza que deseja sair da sua conta de entregador?',
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
              console.log('Usuário deve ser redirecionado para tela de autenticação');
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
    { icon: 'bicycle-outline', title: 'Dados do veículo', onPress: () => console.log('Dados do veículo') },
    { icon: 'document-text-outline', title: 'Documentos', onPress: () => console.log('Documentos') },
    { icon: 'card-outline', title: 'Dados bancários', onPress: () => console.log('Dados bancários') },
    { icon: 'notifications-outline', title: 'Notificações', onPress: () => console.log('Notificações') },
    { icon: 'time-outline', title: 'Histórico de trabalho', onPress: () => console.log('Histórico') },
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
              <Ionicons name="bicycle" size={40} color="#EA1D2C" />
            </View>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>Entregador</Text>
            </View>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>Olá, Entregador!</Text>
            <Text style={styles.userEmail}>{usuarioLogado?.email}</Text>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={styles.ratingText}>4.9 • 234 entregas</Text>
            </View>
          </View>
        </View>

        {/* Estatísticas Rápidas */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>R$ 1.234,50</Text>
            <Text style={styles.statLabel}>Este mês</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>4.9</Text>
            <Text style={styles.statLabel}>Avaliação</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>98%</Text>
            <Text style={styles.statLabel}>Aceitação</Text>
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
    position: 'relative',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF5F5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#EA1D2C',
  },
  statusBadge: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 10,
    color: 'white',
    fontWeight: 'bold',
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
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
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

export default DeliveryProfileScreen;