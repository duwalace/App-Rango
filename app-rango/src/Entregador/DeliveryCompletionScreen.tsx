import React, { useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface CompletionScreenProps {
  route?: {
    params?: {
      tripData?: any;
    };
  };
}

const DeliveryCompletionScreen: React.FC<CompletionScreenProps> = ({ route }) => {
  const navigation = useNavigation();
  
  const tripData = route?.params?.tripData || {
    orderId: '#54321',
    earnings: 12.50,
    customer: { name: 'Maria Silva' }
  };

  useEffect(() => {
    // Auto-redirect após 5 segundos
    const timer = setTimeout(() => {
      handleBackToDashboard();
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleBackToDashboard = () => {
    // Voltar para o dashboard principal
    navigation.navigate('Main' as never);
  };

  const handleViewHistory = () => {
    navigation.navigate('DeliveryHistory' as never);
  };

  const formatCurrency = (value: number) => {
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        {/* Ícone de Sucesso */}
        <View style={styles.successIcon}>
          <Ionicons name="checkmark-circle" size={100} color="#4CAF50" />
        </View>

        {/* Mensagem Principal */}
        <Text style={styles.title}>Entrega Concluída!</Text>
        <Text style={styles.subtitle}>
          Parabéns! Você entregou o pedido {tripData.orderId} para {tripData.customer.name}
        </Text>

        {/* Card de Ganhos */}
        <View style={styles.earningsCard}>
          <Text style={styles.earningsLabel}>Você ganhou</Text>
          <Text style={styles.earningsValue}>{formatCurrency(tripData.earnings)}</Text>
          <View style={styles.earningsDetail}>
            <Ionicons name="wallet-outline" size={16} color="#4CAF50" />
            <Text style={styles.earningsDetailText}>Adicionado à sua carteira</Text>
          </View>
        </View>

        {/* Estatísticas Rápidas */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Ionicons name="time-outline" size={24} color="#666" />
            <Text style={styles.statValue}>25 min</Text>
            <Text style={styles.statLabel}>Tempo total</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <Ionicons name="location-outline" size={24} color="#666" />
            <Text style={styles.statValue}>4.2 km</Text>
            <Text style={styles.statLabel}>Distância</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <Ionicons name="star" size={24} color="#FFD700" />
            <Text style={styles.statValue}>5.0</Text>
            <Text style={styles.statLabel}>Avaliação</Text>
          </View>
        </View>
      </View>

      {/* Botões de Ação */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.secondaryButton} onPress={handleViewHistory}>
          <Text style={styles.secondaryButtonText}>Ver Histórico</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.primaryButton} onPress={handleBackToDashboard}>
          <Text style={styles.primaryButtonText}>Continuar Trabalhando</Text>
        </TouchableOpacity>
      </View>

      {/* Auto-redirect info */}
      <Text style={styles.autoRedirectText}>
        Redirecionando automaticamente em 5 segundos...
      </Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  successIcon: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 40,
  },
  earningsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    width: '100%',
  },
  earningsLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  earningsValue: {
    fontSize: 36,
    fontWeight: '700',
    color: '#4CAF50',
    marginBottom: 12,
  },
  earningsDetail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  earningsDetailText: {
    fontSize: 14,
    color: '#4CAF50',
    marginLeft: 6,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    justifyContent: 'space-around',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E5E5',
    marginHorizontal: 15,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
  },
  buttonContainer: {
    paddingHorizontal: 30,
    paddingBottom: 20,
  },
  primaryButton: {
    backgroundColor: '#EA1D2C',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#EA1D2C',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EA1D2C',
  },
  autoRedirectText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    paddingBottom: 10,
  },
});

export default DeliveryCompletionScreen;