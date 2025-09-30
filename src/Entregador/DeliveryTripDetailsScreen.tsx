import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  ScrollView,
  Alert,
  Clipboard
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

interface TripDetailsScreenProps {
  route?: {
    params?: {
      tripData?: any;
    };
  };
}

const DeliveryTripDetailsScreen: React.FC<TripDetailsScreenProps> = ({ route }) => {
  const navigation = useNavigation();
  
  // Dados simulados da corrida (normalmente viriam dos parâmetros da rota)
  const [tripData] = useState({
    orderId: '#54321',
    restaurant: {
      name: 'Burger King',
      address: 'Av. Paulista, 1000 - Bela Vista, São Paulo - SP',
      coordinates: { latitude: -23.5613, longitude: -46.6565 }
    },
    customer: {
      name: 'Maria Silva',
      address: 'Rua das Flores, 123 - Vila Madalena, São Paulo - SP',
      observations: 'Deixar na portaria, apartamento 45',
      coordinates: { latitude: -23.5505, longitude: -46.6890 }
    },
    items: [
      { name: 'Whopper Duplo', quantity: 2 },
      { name: 'Coca-Cola 500ml', quantity: 1 },
      { name: 'Batata Frita Grande', quantity: 1 }
    ],
    earnings: 12.50,
    status: 'accepted' // accepted, picking_up, delivering, completed
  });

  const handleCopyAddress = (address: string, type: string) => {
    Clipboard.setString(address);
    Alert.alert('Endereço Copiado', `Endereço ${type} copiado para a área de transferência!`);
  };

  const MapsToRoute = (coordinates: { latitude: number; longitude: number }) => {
    console.log('Iniciando rota para:', coordinates);
    // Navegar para tela de rota/navegação
    navigation.navigate('DeliveryRoute' as never, { 
      destination: coordinates,
      tripData: tripData 
    } as never);
  };

  const handleStartRoute = () => {
    MapsToRoute(tripData.restaurant.coordinates);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalhes da Corrida</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Card "Coletar em" */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="restaurant" size={24} color="#EA1D2C" />
            <Text style={styles.cardTitle}>Coletar em</Text>
          </View>
          
          <Text style={styles.restaurantName}>{tripData.restaurant.name}</Text>
          <Text style={styles.address}>{tripData.restaurant.address}</Text>
          
          <TouchableOpacity 
            style={styles.copyButton}
            onPress={() => handleCopyAddress(tripData.restaurant.address, 'do restaurante')}
          >
            <Ionicons name="copy-outline" size={16} color="#EA1D2C" />
            <Text style={styles.copyButtonText}>Copiar Endereço</Text>
          </TouchableOpacity>
        </View>

        {/* Card "Detalhes do Pedido" */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="receipt" size={24} color="#EA1D2C" />
            <Text style={styles.cardTitle}>Detalhes do Pedido</Text>
          </View>
          
          <Text style={styles.orderId}>Pedido {tripData.orderId}</Text>
          
          <View style={styles.itemsList}>
            <Text style={styles.itemsTitle}>Itens a coletar:</Text>
            {tripData.items.map((item, index) => (
              <View key={index} style={styles.itemRow}>
                <Text style={styles.itemQuantity}>{item.quantity}x</Text>
                <Text style={styles.itemName}>{item.name}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Card "Entregar para" */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="person" size={24} color="#EA1D2C" />
            <Text style={styles.cardTitle}>Entregar para</Text>
          </View>
          
          <Text style={styles.customerName}>{tripData.customer.name}</Text>
          <Text style={styles.address}>{tripData.customer.address}</Text>
          
          {tripData.customer.observations && (
            <View style={styles.observationsContainer}>
              <Text style={styles.observationsLabel}>Observações:</Text>
              <Text style={styles.observations}>{tripData.customer.observations}</Text>
            </View>
          )}
          
          <TouchableOpacity 
            style={styles.copyButton}
            onPress={() => handleCopyAddress(tripData.customer.address, 'do cliente')}
          >
            <Ionicons name="copy-outline" size={16} color="#EA1D2C" />
            <Text style={styles.copyButtonText}>Copiar Endereço</Text>
          </TouchableOpacity>
        </View>

        {/* Ganhos */}
        <View style={styles.earningsCard}>
          <Text style={styles.earningsLabel}>Ganhos desta corrida</Text>
          <Text style={styles.earningsValue}>R$ {tripData.earnings.toFixed(2).replace('.', ',')}</Text>
        </View>
      </ScrollView>

      {/* Botão de Ação Principal */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.startRouteButton} onPress={handleStartRoute}>
          <Ionicons name="navigate" size={24} color="#FFFFFF" />
          <Text style={styles.startRouteButtonText}>INICIAR ROTA PARA COLETA</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 34,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 10,
  },
  restaurantName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  customerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  address: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
    marginBottom: 15,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FFF5F5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EA1D2C',
  },
  copyButtonText: {
    fontSize: 14,
    color: '#EA1D2C',
    fontWeight: '500',
    marginLeft: 5,
  },
  orderId: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  itemsList: {
    marginTop: 10,
  },
  itemsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
  },
  itemQuantity: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EA1D2C',
    width: 30,
  },
  itemName: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  observationsContainer: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  observationsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 5,
  },
  observations: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  earningsCard: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
    alignItems: 'center',
  },
  earningsLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 5,
  },
  earningsValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  bottomContainer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  startRouteButton: {
    backgroundColor: '#EA1D2C',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  startRouteButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});

export default DeliveryTripDetailsScreen;