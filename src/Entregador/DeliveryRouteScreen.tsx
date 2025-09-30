import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  Dimensions,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface RouteScreenProps {
  route?: {
    params?: {
      destination?: { latitude: number; longitude: number };
      tripData?: any;
    };
  };
}

const DeliveryRouteScreen: React.FC<RouteScreenProps> = ({ route }) => {
  const navigation = useNavigation();
  const [deliveryStage, setDeliveryStage] = useState<'pickup' | 'delivery'>('pickup');
  const [routeInfo, setRouteInfo] = useState({
    distance: '1.2 km',
    estimatedTime: '5 min',
    nextInstruction: 'Vire à direita na Av. Paulista'
  });

  // Dados da corrida (normalmente viriam dos parâmetros)
  const tripData = route?.params?.tripData || {
    restaurant: { name: 'Burger King', address: 'Av. Paulista, 1000' },
    customer: { name: 'Maria Silva', address: 'Rua das Flores, 123' },
    orderId: '#54321'
  };

  useEffect(() => {
    // Simular atualização da rota baseada no estágio
    if (deliveryStage === 'pickup') {
      setRouteInfo({
        distance: '1.2 km',
        estimatedTime: '5 min',
        nextInstruction: 'Vire à direita na Av. Paulista'
      });
    } else {
      setRouteInfo({
        distance: '3.8 km',
        estimatedTime: '12 min',
        nextInstruction: 'Continue reto por 800m'
      });
    }
  }, [deliveryStage]);

  const handleConfirmPickup = () => {
    Alert.alert(
      'Confirmar Coleta',
      'Você coletou o pedido no restaurante?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Sim, coletei', 
          onPress: () => {
            console.log('Pedido coletado confirmado');
            setDeliveryStage('delivery');
            // Aqui você atualizaria a rota para o endereço do cliente
          }
        }
      ]
    );
  };

  const handleConfirmDelivery = () => {
    Alert.alert(
      'Confirmar Entrega',
      'Você entregou o pedido ao cliente?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Sim, entreguei', 
          onPress: () => {
            console.log('Entrega confirmada');
            // Navegar para tela de conclusão ou voltar ao dashboard
            navigation.navigate('DeliveryCompletion' as never, { tripData } as never);
          }
        }
      ]
    );
  };

  const handleBackPress = () => {
    Alert.alert(
      'Sair da Navegação',
      'Tem certeza que deseja sair da navegação? A corrida ainda não foi concluída.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sair', onPress: () => navigation.goBack() }
      ]
    );
  };

  const getButtonConfig = () => {
    if (deliveryStage === 'pickup') {
      return {
        text: 'CHEGUEI E COLETEI O PEDIDO',
        onPress: handleConfirmPickup,
        backgroundColor: '#4CAF50'
      };
    } else {
      return {
        text: 'ENTREGA REALIZADA',
        onPress: handleConfirmDelivery,
        backgroundColor: '#2196F3'
      };
    }
  };

  const buttonConfig = getButtonConfig();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Overlay de Instruções no Topo */}
      <View style={styles.topOverlay}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        
        <View style={styles.instructionContainer}>
          <Text style={styles.instructionText}>{routeInfo.nextInstruction}</Text>
          <View style={styles.routeInfo}>
            <Text style={styles.routeInfoText}>{routeInfo.distance} • {routeInfo.estimatedTime}</Text>
          </View>
        </View>
      </View>

      {/* Mapa em Tela Cheia (Placeholder) */}
      <View style={styles.mapContainer}>
        <View style={styles.mapPlaceholder}>
          <Ionicons name="map" size={80} color="#CCCCCC" />
          <Text style={styles.mapPlaceholderText}>
            {deliveryStage === 'pickup' ? 'Rota para o Restaurante' : 'Rota para o Cliente'}
          </Text>
          <Text style={styles.mapPlaceholderSubtext}>
            {deliveryStage === 'pickup' ? tripData.restaurant.name : tripData.customer.name}
          </Text>
        </View>

        {/* Indicador de Estágio */}
        <View style={styles.stageIndicator}>
          <View style={[styles.stageStep, deliveryStage === 'pickup' && styles.activeStep]}>
            <Ionicons 
              name="restaurant" 
              size={20} 
              color={deliveryStage === 'pickup' ? '#FFFFFF' : '#666'} 
            />
          </View>
          <View style={styles.stageLine} />
          <View style={[styles.stageStep, deliveryStage === 'delivery' && styles.activeStep]}>
            <Ionicons 
              name="home" 
              size={20} 
              color={deliveryStage === 'delivery' ? '#FFFFFF' : '#666'} 
            />
          </View>
        </View>
      </View>

      {/* Overlay de Ação Inferior */}
      <View style={styles.bottomOverlay}>
        <View style={styles.tripInfo}>
          <Text style={styles.tripInfoTitle}>
            {deliveryStage === 'pickup' ? 'Indo para coleta' : 'Indo para entrega'}
          </Text>
          <Text style={styles.tripInfoSubtitle}>
            Pedido {tripData.orderId}
          </Text>
        </View>

        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: buttonConfig.backgroundColor }]}
          onPress={buttonConfig.onPress}
        >
          <Text style={styles.actionButtonText}>{buttonConfig.text}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    marginRight: 15,
  },
  instructionContainer: {
    flex: 1,
  },
  instructionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  routeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeInfoText: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapPlaceholderText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 15,
  },
  mapPlaceholderSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
  },
  stageIndicator: {
    position: 'absolute',
    top: 120,
    right: 20,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 25,
    padding: 15,
  },
  stageStep: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5E5E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeStep: {
    backgroundColor: '#EA1D2C',
  },
  stageLine: {
    width: 2,
    height: 20,
    backgroundColor: '#E5E5E5',
    marginVertical: 5,
  },
  bottomOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  tripInfo: {
    marginBottom: 20,
  },
  tripInfoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  tripInfoSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  actionButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default DeliveryRouteScreen;