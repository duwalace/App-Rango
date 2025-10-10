import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  TouchableOpacity,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';

const DeliveryMoreScreen: React.FC = () => {
  const { logout, usuarioLogado } = useAuth();
  const navigation = useNavigation();

  const handleLogout = () => {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Sair', 
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              console.error('Erro ao fazer logout:', error);
            }
          }
        }
      ]
    );
  };

  const menuItems = [
    {
      section: 'Conta',
      items: [
        { icon: 'person-outline', title: 'Dados Pessoais', screen: 'DeliveryProfile' },
        { icon: 'card-outline', title: 'Dados Bancários', screen: 'DeliveryWallet' },
        { icon: 'document-text-outline', title: 'Documentos', screen: 'DeliveryDocuments' },
        { icon: 'bicycle-outline', title: 'Meu Veículo', screen: null },
      ]
    },
    {
      section: 'Atividade',
      items: [
        { icon: 'stats-chart-outline', title: 'Estatísticas', screen: null },
        { icon: 'time-outline', title: 'Histórico de Entregas', screen: 'DeliveryHistory' },
        { icon: 'star-outline', title: 'Minhas Avaliações', screen: null },
      ]
    },
    {
      section: 'Configurações',
      items: [
        { icon: 'notifications-outline', title: 'Notificações', screen: null },
        { icon: 'language-outline', title: 'Idioma', screen: null },
        { icon: 'shield-checkmark-outline', title: 'Privacidade', screen: null },
      ]
    },
    {
      section: 'Sobre',
      items: [
        { icon: 'information-circle-outline', title: 'Sobre o Rappy', screen: null },
        { icon: 'document-outline', title: 'Termos de Uso', screen: null },
        { icon: 'lock-closed-outline', title: 'Política de Privacidade', screen: null },
      ]
    }
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mais</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Perfil do Usuário */}
        <TouchableOpacity style={styles.profileCard}>
          <View style={styles.profileAvatar}>
            <Ionicons name="person" size={32} color="#FF6B35" />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {usuarioLogado?.email?.split('@')[0] || 'Entregador'}
            </Text>
            <Text style={styles.profileEmail}>{usuarioLogado?.email}</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#CCC" />
        </TouchableOpacity>

        {/* Menu Sections */}
        {menuItems.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.menuSection}>
            <Text style={styles.sectionTitle}>{section.section}</Text>
            <View style={styles.menuItems}>
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity 
                  key={itemIndex} 
                  style={styles.menuItem}
                  onPress={() => {
                    if (item.screen) {
                      navigation.navigate(item.screen as never);
                    } else {
                      Alert.alert('Em breve', 'Esta funcionalidade estará disponível em breve.');
                    }
                  }}
                >
                  <View style={styles.menuItemLeft}>
                    <Ionicons name={item.icon as any} size={24} color="#666" />
                    <Text style={styles.menuItemText}>{item.title}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#CCC" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#EA1D2C" />
          <Text style={styles.logoutText}>Sair da Conta</Text>
        </TouchableOpacity>

        {/* App Version */}
        <Text style={styles.appVersion}>Versão 1.0.0</Text>

        {/* Espaçamento para SafeArea inferior */}
        <View style={{ height: 100 }} />
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
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
  scrollView: {
    flex: 1,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    marginBottom: 8,
  },
  profileAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F0F9F4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#666',
  },
  menuSection: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    paddingHorizontal: 16,
    paddingVertical: 12,
    textTransform: 'uppercase',
  },
  menuItems: {
    backgroundColor: '#FFF',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemText: {
    fontSize: 16,
    color: '#000',
    marginLeft: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 12,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EA1D2C',
  },
  appVersion: {
    textAlign: 'center',
    fontSize: 12,
    color: '#999',
    paddingVertical: 24,
  },
});

export default DeliveryMoreScreen;

