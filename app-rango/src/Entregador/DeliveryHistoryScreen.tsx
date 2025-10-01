import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  FlatList,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

interface Trip {
  id: string;
  date: string;
  time: string;
  restaurantName: string;
  customerName: string;
  earnings: number;
  status: 'completed' | 'cancelled';
  distance: number;
}

const DeliveryHistoryScreen: React.FC = () => {
  const navigation = useNavigation();
  const [selectedFilter, setSelectedFilter] = useState<'today' | 'week' | 'month'>('today');

  // Dados simulados de corridas
  const [trips] = useState<Trip[]>([
    {
      id: '1',
      date: '30/09/2025',
      time: '14:30',
      restaurantName: 'Burger King',
      customerName: 'Maria Silva',
      earnings: 12.50,
      status: 'completed',
      distance: 4.2
    },
    {
      id: '2',
      date: '30/09/2025',
      time: '13:15',
      restaurantName: 'McDonald\'s',
      customerName: 'João Santos',
      earnings: 8.75,
      status: 'completed',
      distance: 2.8
    },
    {
      id: '3',
      date: '30/09/2025',
      time: '12:00',
      restaurantName: 'Pizza Hut',
      customerName: 'Ana Costa',
      earnings: 15.20,
      status: 'completed',
      distance: 6.1
    },
    {
      id: '4',
      date: '29/09/2025',
      time: '19:45',
      restaurantName: 'Subway',
      customerName: 'Carlos Lima',
      earnings: 9.30,
      status: 'completed',
      distance: 3.5
    },
    {
      id: '5',
      date: '29/09/2025',
      time: '18:20',
      restaurantName: 'KFC',
      customerName: 'Lucia Oliveira',
      earnings: 11.80,
      status: 'completed',
      distance: 4.7
    }
  ]);

  const getFilteredTrips = () => {
    const today = new Date();
    const todayStr = today.toLocaleDateString('pt-BR');
    
    switch (selectedFilter) {
      case 'today':
        return trips.filter(trip => trip.date === todayStr);
      case 'week':
        // Simular filtro da semana (últimos 7 dias)
        return trips;
      case 'month':
        // Simular filtro do mês
        return trips;
      default:
        return trips;
    }
  };

  const getTotalEarnings = () => {
    const filteredTrips = getFilteredTrips();
    return filteredTrips.reduce((total, trip) => total + trip.earnings, 0);
  };

  const getFilterLabel = () => {
    switch (selectedFilter) {
      case 'today': return 'Hoje';
      case 'week': return 'Esta Semana';
      case 'month': return 'Este Mês';
      default: return 'Hoje';
    }
  };

  const MapsToTripDetails = (trip: Trip) => {
    console.log('Navegar para detalhes da corrida:', trip.id);
    // Navegar para tela de detalhes específicos da corrida
    navigation.navigate('DeliveryTripHistory' as never, { tripId: trip.id, tripData: trip } as never);
  };

  const formatCurrency = (value: number) => {
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
  };

  const renderTripItem = ({ item }: { item: Trip }) => (
    <TouchableOpacity 
      style={styles.tripCard}
      onPress={() => MapsToTripDetails(item)}
    >
      <View style={styles.tripHeader}>
        <View style={styles.tripInfo}>
          <Text style={styles.tripDate}>{item.date} • {item.time}</Text>
          <Text style={styles.restaurantName}>{item.restaurantName}</Text>
          <Text style={styles.customerName}>Para: {item.customerName}</Text>
        </View>
        
        <View style={styles.tripEarnings}>
          <Text style={styles.earningsValue}>{formatCurrency(item.earnings)}</Text>
          <View style={[styles.statusBadge, { backgroundColor: item.status === 'completed' ? '#4CAF50' : '#FF5722' }]}>
            <Text style={styles.statusText}>
              {item.status === 'completed' ? 'Concluída' : 'Cancelada'}
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.tripFooter}>
        <View style={styles.distanceInfo}>
          <Ionicons name="location-outline" size={14} color="#666" />
          <Text style={styles.distanceText}>{item.distance.toFixed(1)} km</Text>
        </View>
        
        <Ionicons name="chevron-forward" size={16} color="#999" />
      </View>
    </TouchableOpacity>
  );

  const filteredTrips = getFilteredTrips();
  const totalEarnings = getTotalEarnings();

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
        <Text style={styles.headerTitle}>Histórico de Corridas</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Filtros */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[
            { key: 'today', label: 'Hoje' },
            { key: 'week', label: 'Semana' },
            { key: 'month', label: 'Mês' }
          ].map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterButton,
                selectedFilter === filter.key && styles.activeFilterButton
              ]}
              onPress={() => setSelectedFilter(filter.key as any)}
            >
              <Text style={[
                styles.filterButtonText,
                selectedFilter === filter.key && styles.activeFilterButtonText
              ]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Resumo de Ganhos */}
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryLabel}>Total ganho - {getFilterLabel()}</Text>
        <Text style={styles.summaryValue}>{formatCurrency(totalEarnings)}</Text>
        <Text style={styles.summarySubtext}>
          {filteredTrips.length} {filteredTrips.length === 1 ? 'corrida realizada' : 'corridas realizadas'}
        </Text>
      </View>

      {/* Lista de Corridas */}
      <View style={styles.listContainer}>
        <Text style={styles.listTitle}>Corridas Realizadas</Text>
        
        {filteredTrips.length > 0 ? (
          <FlatList
            data={filteredTrips}
            renderItem={renderTripItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="bicycle-outline" size={60} color="#CCCCCC" />
            <Text style={styles.emptyStateText}>Nenhuma corrida encontrada</Text>
            <Text style={styles.emptyStateSubtext}>
              Você ainda não realizou corridas {getFilterLabel().toLowerCase()}
            </Text>
          </View>
        )}
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
  filtersContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    marginRight: 10,
  },
  activeFilterButton: {
    backgroundColor: '#EA1D2C',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activeFilterButtonText: {
    color: '#FFFFFF',
  },
  summaryContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  summaryValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#4CAF50',
    marginBottom: 5,
  },
  summarySubtext: {
    fontSize: 14,
    color: '#999',
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 20,
    marginBottom: 15,
  },
  listContent: {
    paddingBottom: 20,
  },
  tripCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  tripInfo: {
    flex: 1,
  },
  tripDate: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  customerName: {
    fontSize: 14,
    color: '#666',
  },
  tripEarnings: {
    alignItems: 'flex-end',
  },
  earningsValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4CAF50',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  tripFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  distanceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distanceText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginTop: 15,
    marginBottom: 5,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#CCCCCC',
    textAlign: 'center',
  },
});

export default DeliveryHistoryScreen;