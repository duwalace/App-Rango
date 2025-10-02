import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  FlatList,
  Alert,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';

interface ProfileMenuItem {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  action: string;
  showArrow?: boolean;
}

const DeliveryProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const { usuarioLogado, logout } = useAuth();
  
  // Dados simulados do perfil do entregador
  const [profileData] = useState({
    name: 'Carlos Entregador Silva',
    deliveryId: 'ENT-2025-001',
    photo: null, // URL da foto ou null para placeholder
    rating: 4.9,
    acceptanceRate: 85,
    completionRate: 98,
    totalDeliveries: 1247,
    memberSince: 'Janeiro 2024'
  });

  // Itens do menu do perfil
  const [menuItems] = useState<ProfileMenuItem[]>([
    {
      id: '1',
      title: 'Meus Dados Pessoais',
      icon: 'person-outline',
      action: 'PersonalData',
      showArrow: true
    },
    {
      id: '2',
      title: 'Informações do Veículo',
      icon: 'bicycle-outline',
      action: 'VehicleInfo',
      showArrow: true
    },
    {
      id: '3',
      title: 'Meus Documentos',
      icon: 'document-text-outline',
      action: 'Documents',
      showArrow: true
    },
    {
      id: '4',
      title: 'Central de Ajuda',
      icon: 'help-circle-outline',
      action: 'HelpCenter',
      showArrow: true
    },
    {
      id: '5',
      title: 'Configurações do App',
      icon: 'settings-outline',
      action: 'AppSettings',
      showArrow: true
    },
    {
      id: '6',
      title: 'Sair',
      icon: 'log-out-outline',
      action: 'Logout',
      showArrow: false
    }
  ]);

  const handleLogout = async () => {
    Alert.alert(
      'Sair da Conta',
      'Tem certeza que deseja sair da sua conta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Sair', 
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('🔵 DeliveryProfileScreen: Iniciando logout...');
              await logout();
              console.log('✅ DeliveryProfileScreen: Logout realizado com sucesso');
              // Não precisa navegar - o AuthContext vai detectar e mostrar a tela de login automaticamente
            } catch (error) {
              console.error('❌ DeliveryProfileScreen: Erro no logout:', error);
              Alert.alert('Erro', 'Não foi possível sair da conta. Tente novamente.');
            }
          }
        }
      ]
    );
  };

  const MapsTo = (destination: string) => {
    console.log('Navegar para:', destination);
    
    switch (destination) {
      case 'PersonalData':
        navigation.navigate('DeliveryPersonalData' as never);
        break;
      case 'VehicleInfo':
        navigation.navigate('DeliveryVehicleInfo' as never);
        break;
      case 'Documents':
        navigation.navigate('DeliveryDocuments' as never);
        break;
      case 'HelpCenter':
        navigation.navigate('DeliveryHelpCenter' as never);
        break;
      case 'AppSettings':
        navigation.navigate('DeliveryAppSettings' as never);
        break;
      case 'Logout':
        handleLogout();
        break;
      default:
        Alert.alert('Em Desenvolvimento', 'Esta funcionalidade estará disponível em breve.');
    }
  };

  const renderStarRating = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Ionicons key={i} name="star" size={16} color="#FFD700" />
      );
    }
    
    if (hasHalfStar) {
      stars.push(
        <Ionicons key="half" name="star-half" size={16} color="#FFD700" />
      );
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Ionicons key={`empty-${i}`} name="star-outline" size={16} color="#FFD700" />
      );
    }
    
    return stars;
  };

  const renderMenuItem = ({ item }: { item: ProfileMenuItem }) => (
    <TouchableOpacity 
      style={[
        styles.menuItem,
        item.action === 'Logout' && styles.logoutMenuItem
      ]}
      onPress={() => MapsTo(item.action)}
    >
      <View style={styles.menuItemLeft}>
        <Ionicons 
          name={item.icon} 
          size={24} 
          color={item.action === 'Logout' ? '#FF5722' : '#666'} 
        />
        <Text style={[
          styles.menuItemText,
          item.action === 'Logout' && styles.logoutMenuItemText
        ]}>
          {item.title}
        </Text>
      </View>
      
      {item.showArrow && (
        <Ionicons name="chevron-forward" size={16} color="#999" />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={menuItems}
        renderItem={renderMenuItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            {/* Header do Perfil */}
            <View style={styles.profileHeader}>
              <View style={styles.photoContainer}>
                {profileData.photo ? (
                  <Image source={{ uri: profileData.photo }} style={styles.profilePhoto} />
                ) : (
                  <View style={styles.photoPlaceholder}>
                    <Ionicons name="person" size={40} color="#999" />
                  </View>
                )}
              </View>
              
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{profileData.name}</Text>
                <Text style={styles.deliveryId}>ID: {profileData.deliveryId}</Text>
                <Text style={styles.memberSince}>Membro desde {profileData.memberSince}</Text>
              </View>
            </View>

            {/* Métricas de Desempenho */}
            <View style={styles.metricsContainer}>
              <Text style={styles.metricsTitle}>Desempenho</Text>
              
              <View style={styles.metricsGrid}>
                {/* Nota de Avaliação */}
                <View style={styles.metricCard}>
                  <View style={styles.metricHeader}>
                    <Ionicons name="star" size={20} color="#FFD700" />
                    <Text style={styles.metricLabel}>Avaliação</Text>
                  </View>
                  <Text style={styles.metricValue}>{profileData.rating.toFixed(1)}/5</Text>
                  <View style={styles.starsContainer}>
                    {renderStarRating(profileData.rating)}
                  </View>
                </View>

                {/* Taxa de Aceitação */}
                <View style={styles.metricCard}>
                  <View style={styles.metricHeader}>
                    <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                    <Text style={styles.metricLabel}>Aceitação</Text>
                  </View>
                  <Text style={styles.metricValue}>{profileData.acceptanceRate}%</Text>
                  <Text style={styles.metricSubtext}>Taxa de aceitação</Text>
                </View>

                {/* Taxa de Conclusão */}
                <View style={styles.metricCard}>
                  <View style={styles.metricHeader}>
                    <Ionicons name="trophy" size={20} color="#FF9800" />
                    <Text style={styles.metricLabel}>Conclusão</Text>
                  </View>
                  <Text style={styles.metricValue}>{profileData.completionRate}%</Text>
                  <Text style={styles.metricSubtext}>Taxa de conclusão</Text>
                </View>

                {/* Total de Entregas */}
                <View style={styles.metricCard}>
                  <View style={styles.metricHeader}>
                    <Ionicons name="bicycle" size={20} color="#2196F3" />
                    <Text style={styles.metricLabel}>Entregas</Text>
                  </View>
                  <Text style={styles.metricValue}>{profileData.totalDeliveries.toLocaleString()}</Text>
                  <Text style={styles.metricSubtext}>Total realizadas</Text>
                </View>
              </View>
            </View>

            {/* Título da Lista de Opções */}
            <Text style={styles.menuTitle}>Configurações</Text>
          </View>
        }
        contentContainerStyle={styles.scrollContent}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  profileHeader: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  photoContainer: {
    marginRight: 15,
  },
  profilePhoto: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  photoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  deliveryId: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  memberSince: {
    fontSize: 12,
    color: '#999',
  },
  metricsContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginTop: 10,
  },
  metricsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricCard: {
    width: '48%',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    alignItems: 'center',
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
    marginLeft: 5,
    fontWeight: '500',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  metricSubtext: {
    fontSize: 10,
    color: '#999',
    textAlign: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 20,
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  menuItem: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  logoutMenuItem: {
    borderBottomWidth: 0,
    marginTop: 10,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
    fontWeight: '500',
  },
  logoutMenuItemText: {
    color: '#FF5722',
  },
});

export default DeliveryProfileScreen;