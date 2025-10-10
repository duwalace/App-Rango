import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  Modal, 
  StyleSheet, 
  TouchableOpacity,
  Dimensions,
  Animated,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Trip, acceptTrip, rejectTrip, assignTrip } from '../services/tripService';
import { getDeliveryPerson } from '../services/deliveryService';
import { RootStackParamList } from '../types/navigation';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface DeliveryAlertModalProps {
  visible: boolean;
  onClose: () => void;
  trip: Trip;
  deliveryPersonId: string;
}

const DeliveryAlertModal: React.FC<DeliveryAlertModalProps> = ({ 
  visible, 
  onClose, 
  trip,
  deliveryPersonId 
}) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [timeLeft, setTimeLeft] = useState(30);
  const [progressAnim] = useState(new Animated.Value(1));
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    if (visible) {
      setTimeLeft(30);
      
      // Animação do timer
      Animated.timing(progressAnim, {
        toValue: 0,
        duration: 30000,
        useNativeDriver: false,
      }).start();

      // Countdown timer
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleAutoDecline();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        clearInterval(timer);
        progressAnim.setValue(1);
      };
    }
  }, [visible]);

  const handleAcceptDelivery = async () => {
    if (accepting) return;

    try {
      setAccepting(true);
      
      // Buscar dados do entregador para pegar o nome
      const deliveryPerson = await getDeliveryPerson(deliveryPersonId);
      
      if (!deliveryPerson) {
        Alert.alert('Erro', 'Perfil de entregador não encontrado');
        return;
      }

      // Se a corrida ainda não foi atribuída, atribuir primeiro
      if (trip.status === 'pending') {
        await assignTrip(trip.id, deliveryPersonId, deliveryPerson.name);
      }

      // Aceitar a corrida
      await acceptTrip(trip.id);

      console.log('✅ Corrida aceita!', trip.id);
      
      onClose();
      
      // Navegar para tela de detalhes da corrida
      (navigation as any).navigate('DeliveryRoute', { tripId: trip.id });
      
    } catch (error) {
      console.error('❌ Erro ao aceitar corrida:', error);
      Alert.alert('Erro', 'Não foi possível aceitar a corrida. Tente novamente.');
    } finally {
      setAccepting(false);
    }
  };

  const handleDeclineDelivery = async () => {
    try {
      await rejectTrip(trip.id, 'Recusado pelo entregador');
      console.log('✅ Corrida recusada');
      onClose();
    } catch (error) {
      console.error('❌ Erro ao recusar corrida:', error);
      onClose();
    }
  };

  const handleAutoDecline = async () => {
    console.log('⏱️ Corrida recusada automaticamente (tempo esgotado)');
    try {
      await rejectTrip(trip.id, 'Tempo esgotado - sem resposta');
    } catch (error) {
      console.error('Erro ao auto-recusar:', error);
    }
    onClose();
  };

  const formatCurrency = (value: number) => {
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
  };

  const formatDistance = (distance: number) => {
    return `${distance.toFixed(1)} km`;
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => {}} // Impossível de ignorar - não permite fechar com botão voltar
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Timer de Aceitação */}
          <View style={styles.timerContainer}>
            <View style={styles.progressBarBackground}>
              <Animated.View 
                style={[
                  styles.progressBar,
                  {
                    width: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    }),
                  }
                ]} 
              />
            </View>
            <Text style={styles.timerText}>
              Aceitar em {timeLeft}s
            </Text>
          </View>

          {/* Cabeçalho */}
          <View style={styles.header}>
            <View style={styles.alertIcon}>
              <Ionicons name="bicycle" size={32} color="white" />
            </View>
            <Text style={styles.title}>Nova Entrega Disponível!</Text>
          </View>

          {/* Informações da Entrega */}
          <View style={styles.infoContainer}>
            <View style={styles.earningsCard}>
              <Text style={styles.earningsLabel}>Ganhos Estimados</Text>
              <Text style={styles.earningsValue}>
                {formatCurrency(trip.deliveryFee)}
              </Text>
            </View>

            <View style={styles.distanceInfo}>
              <View style={styles.distanceItem}>
                <Ionicons name="location" size={20} color="#EA1D2C" />
                <View style={styles.distanceText}>
                  <Text style={styles.distanceLabel}>Retirar em</Text>
                  <Text style={styles.distanceValue}>
                    {trip.pickupAddress.neighborhood}
                  </Text>
                </View>
              </View>

              <View style={styles.distanceItem}>
                <Ionicons name="map" size={20} color="#4CAF50" />
                <View style={styles.distanceText}>
                  <Text style={styles.distanceLabel}>Entregar em</Text>
                  <Text style={styles.distanceValue}>
                    {trip.deliveryAddress.neighborhood}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Mapa Simplificado */}
          <View style={styles.mapContainer}>
            <Text style={styles.mapTitle}>Rota da Entrega</Text>
            <View style={styles.mapPlaceholder}>
              <View style={styles.routePoints}>
                <View style={styles.pointContainer}>
                  <View style={[styles.point, styles.delivererPoint]} />
                  <Text style={styles.pointLabel}>Você</Text>
                </View>
                
                <View style={styles.routeLine} />
                
                <View style={styles.pointContainer}>
                  <View style={[styles.point, styles.restaurantPoint]} />
                  <Text style={styles.pointLabel}>Restaurante</Text>
                </View>
                
                <View style={styles.routeLine} />
                
                <View style={styles.pointContainer}>
                  <View style={[styles.point, styles.customerPoint]} />
                  <Text style={styles.pointLabel}>Cliente</Text>
                </View>
              </View>
              
              <View style={styles.addressInfo}>
                <Text style={styles.restaurantName}>{trip.storeName}</Text>
                <Text style={styles.customerAddress}>
                  {trip.deliveryAddress.street}, {trip.deliveryAddress.number}
                </Text>
              </View>
            </View>
          </View>

          {/* Botões de Ação */}
          <View style={styles.buttonsContainer}>
            <TouchableOpacity 
              style={styles.declineButton} 
              onPress={handleDeclineDelivery}
            >
              <Text style={styles.declineButtonText}>Recusar</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.acceptButton, accepting && styles.acceptButtonDisabled]} 
              onPress={handleAcceptDelivery}
              disabled={accepting}
            >
              <Text style={styles.acceptButtonText}>
                {accepting ? 'Aceitando...' : 'Aceitar'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: SCREEN_WIDTH - 40,
    maxHeight: '90%',
    overflow: 'hidden',
  },
  timerContainer: {
    backgroundColor: '#EA1D2C',
    padding: 16,
    alignItems: 'center',
  },
  progressBarBackground: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 2,
  },
  timerText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
  },
  alertIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  infoContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  earningsCard: {
    backgroundColor: '#F0F8F0',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  earningsLabel: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
    marginBottom: 4,
  },
  earningsValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  distanceInfo: {
    gap: 12,
  },
  distanceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
  },
  distanceText: {
    marginLeft: 12,
    flex: 1,
  },
  distanceLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  distanceValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  mapContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  mapTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  mapPlaceholder: {
    height: 120,
    backgroundColor: '#F0F8F0',
    borderRadius: 12,
    padding: 16,
    justifyContent: 'space-between',
  },
  routePoints: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pointContainer: {
    alignItems: 'center',
  },
  point: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 4,
  },
  delivererPoint: {
    backgroundColor: '#2196F3',
  },
  restaurantPoint: {
    backgroundColor: '#EA1D2C',
  },
  customerPoint: {
    backgroundColor: '#4CAF50',
  },
  pointLabel: {
    fontSize: 10,
    color: '#666',
    fontWeight: '500',
  },
  routeLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#DDD',
    marginHorizontal: 8,
  },
  addressInfo: {
    alignItems: 'center',
  },
  restaurantName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  customerAddress: {
    fontSize: 12,
    color: '#666',
  },
  buttonsContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  declineButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#EA1D2C',
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  declineButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EA1D2C',
  },
  acceptButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
  },
  acceptButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  acceptButtonDisabled: {
    backgroundColor: '#9E9E9E',
  },
});

export default DeliveryAlertModal;