import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

type ProfileMenuItem = {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  screen: string;
  color?: string;
};

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { usuarioLogado: user, logout } = useAuth();

  const menuItems: ProfileMenuItem[] = [
    {
      id: '1',
      icon: 'person-outline',
      label: 'Dados pessoais',
      screen: 'PersonalData',
    },
    {
      id: '2',
      icon: 'location-outline',
      label: 'Endereços',
      screen: 'Addresses',
    },
    {
      id: '3',
      icon: 'card-outline',
      label: 'Formas de pagamento',
      screen: 'PaymentMethods',
    },
    {
      id: '4',
      icon: 'notifications-outline',
      label: 'Notificações',
      screen: 'Notifications',
    },
    {
      id: '5',
      icon: 'help-circle-outline',
      label: 'Ajuda',
      screen: 'Help',
    },
    {
      id: '6',
      icon: 'information-circle-outline',
      label: 'Sobre',
      screen: 'About',
    },
  ];

  const handleMenuPress = (screen: string) => {
    navigation.navigate(screen);
  };

  const handleLogout = async () => {
    try {
      await logout();
      // A navegação para login será tratada pelo AuthContext
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header com foto do usuário */}
      <View style={styles.header}>
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            {user?.photoURL ? (
              <Image 
                source={{ uri: user.photoURL }} 
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={40} color="#999" />
              </View>
            )}
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.greeting}>Olá!</Text>
            <Text style={styles.email}>{user?.email || 'Usuário'}</Text>
          </View>
        </View>
      </View>

      {/* Lista de Menu */}
      <ScrollView 
        style={styles.menuContainer}
        showsVerticalScrollIndicator={false}
      >
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.menuItem}
            onPress={() => handleMenuPress(item.screen)}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <View style={styles.iconContainer}>
                <Ionicons 
                  name={item.icon} 
                  size={24} 
                  color={item.color || '#666'} 
                />
              </View>
              <Text style={styles.menuItemText}>{item.label}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        ))}

        {/* Botão de Logout */}
        <TouchableOpacity
          style={[styles.menuItem, styles.logoutButton]}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <View style={styles.menuItemLeft}>
            <View style={styles.iconContainer}>
              <Ionicons name="log-out-outline" size={24} color="#EA1D2C" />
            </View>
            <Text style={[styles.menuItemText, styles.logoutText]}>
              Sair
            </Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#666',
  },
  menuContainer: {
    flex: 1,
    marginTop: 1,
  },
  menuItem: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    alignItems: 'flex-start',
  },
  menuItemText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  logoutButton: {
    marginTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  logoutText: {
    color: '#EA1D2C',
  },
});

export default ProfileScreen;
