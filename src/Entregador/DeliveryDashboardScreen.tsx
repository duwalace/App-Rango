import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  Switch,
  ScrollView,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

import DeliveryAlertModal from './DeliveryAlertModal';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const DeliveryDashboardScreen: React.FC = () => {
  const { usuarioLogado } = useAuth();
  const [isOnline, setIsOnline] = useState(false);
  const [showDeliveryAlert, setShowDeliveryAlert] = useState(false);
  
  // Dados simulados de ganhos
  const [earnings] = useState({
    today: 45.80,
    week: 234.50
  });

  // Simular chegada de nova entrega quando online
  useEffect(() => {
    if (isOnline) {
      const timer = setTimeout(() => {
        setShowDeliveryAlert(true);
      }, 5000); // Simula nova entrega após 5 segundos online

      return () => clearTimeout(timer);
    }
  }, [isOnline]);

  const handleStatusChange = (value: boolean) => {
    setIsOnline(value);
    console.log('Status do entregador:', value ? 'Online' : 'Offline');
  };

  const MapsToWallet = () => {
    console.log('Navegar para carteira - Cards de ganhos clicados');
    // Implementar navegação para tela de carteira
  };

  const handleGoOnline = () => {
    setIsOnline(true);
  };

  const formatCurrency = (value: number) => {
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const userName = usuarioLogado?.email?.split('@')[0] || 'Entregador';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.greetingContainer}>
            <Text style={styles.greeting}>
              {getGreeting()}, {userName}!
            </Text>
            <Text style={styles.statusText}>
              Status: <Text style={[styles.statusValue, { color: isOnline ? '#4CAF50' : '#999' }]}>
                {isOnline ? 'Online' : 'Offline'}
              </Text>
            </Text>
          </View>
          
          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>
              {isOnline ? 'Online' : 'Offline'}
            </Text>
            <Switch
              value={isOnline}
              onValueChange={handleStatusChange}
              trackColor={{ false: '#E5E5E5', true: '#4CAF50' }}
              thumbColor={isOnline ? '#FFFFFF' : '#FFFFFF'}
              style={styles.switch}
            />
          </View>
        </View>

        {/* Resumo de Ganhos */}
        <View style={styles.earningsContainer}>
          <TouchableOpacity style={styles.earningCard} onPress={MapsToWallet}>
            <View style={styles.earningHeader}>
              <Ionicons name="today" size={24} color="#EA1D2C" />
              <Text style={styles.earningLabel}>Ganhos de Hoje</Text>
            </View>
            <Text style={styles.earningValue}>{formatCurrency(earnings.today)}</Text>
            <Text style={styles.earningSubtext}>Toque para ver detalhes</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.earningCard} onPress={MapsToWallet}>
            <View style={styles.earningHeader}>
              <Ionicons name="calendar" size={24} color="#4CAF50" />
              <Text style={styles.earningLabel}>Ganhos da Semana</Text>
            </View>
            <Text style={styles.earningValue}>{formatCurrency(earnings.week)}</Text>
            <Text style={styles.earningSubtext}>Toque para ver detalhes</Text>
          </TouchableOpacity>
        </View>

        {/* Mapa da Área de Atuação */}
        <View style={styles.mapContainer}>
          <Text style={styles.mapTitle}>Área de Atuação</Text>
          <View style={[styles.mapPlaceholder, { opacity: isOnline ? 1 : 0.5 }]}>
            {!isOnline && (
              <View style={styles.offlineOverlay}>
                <TouchableOpacity style={styles.goOnlineButton} onPress={handleGoOnline}>
                  <Ionicons name="power" size={32} color="white" />
                  <Text style={styles.goOnlineText}>Ficar Online</Text>
                </TouchableOpacity>
              </View>
            )}
            
            {isOnline && (
              <View style={styles.onlineStatus}>
                <View style={styles.pulseContainer}>
                  <View style={styles.pulse} />
                  <View style={styles.pulseCenter} />
                </View>
                <Text style={styles.searchingText}>Procurando corridas...</Text>
              </View>
            )}

            {/* Simulação de mapa */}
            <View style={styles.mapContent}>
              <Text style={styles.mapLabel}>Mapa da Região</Text>
              <Text style={styles.mapSubtext}>
                {isOnline ? 'Você está visível para clientes' : 'Fique online para receber pedidos'}
              </Text>
            </View>
          </View>
        </View>

        {/* Estatísticas Rápidas */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Ionicons name="bicycle" size={20} color="#666" />
            <Text style={styles.statLabel}>Entregas Hoje</Text>
            <Text style={styles.statValue}>8</Text>
          </View>
          
          <View style={styles.statItem}>
            <Ionicons name="star" size={20} color="#FFD700" />
            <Text style={styles.statLabel}>Avaliação</Text>
            <Text style={styles.statValue}>4.9</Text>
          </View>
          
          <View style={styles.statItem}>
            <Ionicons name="time" size={20} color="#666" />
            <Text style={styles.statLabel}>Online Hoje</Text>
            <Text style={styles.statValue}>6h 30m</Text>
          </View>
        </View>
      </ScrollView>

      {/* Modal de Alerta de Nova Entrega */}
      <DeliveryAlertModal
        visible={showDeliveryAlert}
        onClose={() => setShowDeliveryAlert(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    marginBottom: 16,
  },
  greetingContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statusText: {
    fontSize: 16,
    color: '#666',
  },
  statusValue: {
    fontWeight: '600',
  },
  switchContainer: {
    alignItems: 'center',
  },
  switchLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontWeight: '500',
  },
  switch: {
    transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }],
  },
  earningsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 16,
  },
  earningCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  earningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  earningLabel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    fontWeight: '500',
  },
  earningValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  earningSubtext: {
    fontSize: 12,
    color: '#999',
  },
  mapContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  mapTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  mapPlaceholder: {
    height: SCREEN_HEIGHT * 0.5, // Aumentado para 50% da tela conforme requisito
    backgroundColor: '#E8F5E8',
    borderRadius: 12,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  offlineOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  goOnlineButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  goOnlineText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
  },
  onlineStatus: {
    position: 'absolute',
    top: 20,
    left: 20,
    alignItems: 'center',
  },
  pulseContainer: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  pulse: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(76, 175, 80, 0.3)',
  },
  pulseCenter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4CAF50',
  },
  searchingText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  mapContent: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  mapLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  mapSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    backgroundColor: 'white',
    paddingVertical: 20,
    marginTop: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default DeliveryDashboardScreen;