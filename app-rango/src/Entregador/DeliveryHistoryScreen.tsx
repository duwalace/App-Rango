/**
 * DeliveryHistoryScreen.tsx
 * Histórico de corridas do entregador
 * Lista todas as corridas (entregues, canceladas) com filtros
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { getDeliveryPersonTrips, Trip } from '../services/tripService';
import { useAuth } from '../contexts/AuthContext';

type DeliveryStackParamList = {
  DeliveryDashboard: undefined;
  DeliveryRouteScreen: { tripId: string };
  DeliveryHistory: undefined;
  DeliveryWallet: undefined;
  DeliveryProfile: undefined;
};

type NavigationProp = StackNavigationProp<DeliveryStackParamList, 'DeliveryHistory'>;

type FilterType = 'all' | 'delivered' | 'canceled';

const DeliveryHistoryScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { usuarioLogado } = useAuth();

  const [trips, setTrips] = useState<Trip[]>([]);
  const [filteredTrips, setFilteredTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');

  useEffect(() => {
    loadTrips();
  }, []);

  useEffect(() => {
    filterTrips();
  }, [trips, filter]);

  const loadTrips = async () => {
    if (!usuarioLogado?.uid) return;

    try {
      const data = await getDeliveryPersonTrips(usuarioLogado.uid);
      // Filtrar apenas corridas finalizadas (entregues ou canceladas)
      const finishedTrips = data.filter(
        trip => trip.status === 'delivered' || trip.status === 'canceled'
      );
      setTrips(finishedTrips);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterTrips = () => {
    if (filter === 'all') {
      setFilteredTrips(trips);
    } else {
      setFilteredTrips(trips.filter(trip => trip.status === filter));
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadTrips();
  };

  const formatDate = (date: Date | any) => {
    if (!date) return '';
    const d = date instanceof Date ? date : date.toDate();
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    if (status === 'delivered') {
      return { label: 'Entregue', color: '#4CAF50', icon: 'check-circle' };
    }
    return { label: 'Cancelada', color: '#F44336', icon: 'close-circle' };
  };

  const calculateStats = () => {
    const delivered = trips.filter(t => t.status === 'delivered');
    const totalEarnings = delivered.reduce((sum, t) => sum + t.deliveryFee, 0);
    const totalDeliveries = delivered.length;
    const totalCanceled = trips.filter(t => t.status === 'canceled').length;

    return { totalEarnings, totalDeliveries, totalCanceled };
  };

  const stats = calculateStats();

  const renderTripItem = ({ item }: { item: Trip }) => {
    const badge = getStatusBadge(item.status);

    return (
      <TouchableOpacity
        style={styles.tripCard}
        onPress={() => {
          // Poderia navegar para uma tela de detalhes da corrida
          // navigation.navigate('TripDetails', { tripId: item.id });
        }}
      >
        <View style={styles.tripHeader}>
          <View style={styles.tripHeaderLeft}>
            <Icon name="store" size={20} color="#666" />
            <Text style={styles.storeName} numberOfLines={1}>{item.storeName}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: badge.color }]}>
            <Icon name={badge.icon} size={14} color="#fff" />
            <Text style={styles.statusBadgeText}>{badge.label}</Text>
          </View>
        </View>

        <View style={styles.tripDivider} />

        <View style={styles.tripDetails}>
          <View style={styles.tripDetailRow}>
            <Icon name="calendar" size={16} color="#999" />
            <Text style={styles.tripDetailText}>
              {formatDate(item.deliveredAt || item.canceledAt || item.createdAt)}
            </Text>
          </View>

          <View style={styles.tripDetailRow}>
            <Icon name="map-marker" size={16} color="#999" />
            <Text style={styles.tripDetailText} numberOfLines={1}>
              {item.deliveryAddress.neighborhood}, {item.deliveryAddress.city}
            </Text>
          </View>

          {item.distance && (
            <View style={styles.tripDetailRow}>
              <Icon name="map-marker-distance" size={16} color="#999" />
              <Text style={styles.tripDetailText}>{item.distance.toFixed(1)} km</Text>
            </View>
          )}
        </View>

        <View style={styles.tripFooter}>
          <View style={styles.earningsBox}>
            <Icon name="cash" size={20} color="#4CAF50" />
            <Text style={styles.earningsValue}>R$ {item.deliveryFee.toFixed(2)}</Text>
          </View>
          <Icon name="chevron-right" size={20} color="#ccc" />
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
        <Text style={styles.loadingText}>Carregando histórico...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header com estatísticas */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Icon name="package-variant" size={24} color="#4CAF50" />
          <Text style={styles.statValue}>{stats.totalDeliveries}</Text>
          <Text style={styles.statLabel}>Entregas</Text>
        </View>

        <View style={styles.statCard}>
          <Icon name="cash-multiple" size={24} color="#2196F3" />
          <Text style={styles.statValue}>R$ {stats.totalEarnings.toFixed(2)}</Text>
          <Text style={styles.statLabel}>Ganhos</Text>
        </View>

        <View style={styles.statCard}>
          <Icon name="close-circle" size={24} color="#F44336" />
          <Text style={styles.statValue}>{stats.totalCanceled}</Text>
          <Text style={styles.statLabel}>Canceladas</Text>
        </View>
      </View>

      {/* Filtros */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterButtonText, filter === 'all' && styles.filterButtonTextActive]}>
            Todas ({trips.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterButton, filter === 'delivered' && styles.filterButtonActive]}
          onPress={() => setFilter('delivered')}
        >
          <Text style={[styles.filterButtonText, filter === 'delivered' && styles.filterButtonTextActive]}>
            Entregues ({stats.totalDeliveries})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterButton, filter === 'canceled' && styles.filterButtonActive]}
          onPress={() => setFilter('canceled')}
        >
          <Text style={[styles.filterButtonText, filter === 'canceled' && styles.filterButtonTextActive]}>
            Canceladas ({stats.totalCanceled})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Lista de corridas */}
      <FlatList
        data={filteredTrips}
        renderItem={renderTripItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FF6B35']} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="history" size={64} color="#ccc" />
            <Text style={styles.emptyText}>Nenhuma corrida encontrada</Text>
            <Text style={styles.emptySubtext}>
              {filter === 'all'
                ? 'Suas corridas finalizadas aparecerão aqui'
                : filter === 'delivered'
                ? 'Você ainda não tem entregas concluídas'
                : 'Você não tem corridas canceladas'}
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  statCard: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#FF6B35',
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  listContainer: {
    padding: 16,
    gap: 12,
  },
  tripCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tripHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  storeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  tripDivider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 12,
  },
  tripDetails: {
    gap: 8,
  },
  tripDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tripDetailText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  tripFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  earningsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  earningsValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#bbb',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default DeliveryHistoryScreen;
