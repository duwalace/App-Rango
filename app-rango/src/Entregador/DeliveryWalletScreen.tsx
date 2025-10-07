/**
 * DeliveryWalletScreen.tsx
 * Tela financeira do entregador
 * Mostra ganhos, histórico de pagamentos e opções de saque
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { getDeliveryPersonTrips, Trip } from '../services/tripService';
import { getDeliveryPerson, DeliveryPerson } from '../services/deliveryService';
import { useAuth } from '../contexts/AuthContext';

const DeliveryWalletScreen = () => {
  const { usuarioLogado } = useAuth();

  const [deliveryPerson, setDeliveryPerson] = useState<DeliveryPerson | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month' | 'all'>('today');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (!usuarioLogado?.uid) return;

    try {
      const [personData, tripsData] = await Promise.all([
        getDeliveryPerson(usuarioLogado.uid),
        getDeliveryPersonTrips(usuarioLogado.uid),
      ]);

      setDeliveryPerson(personData);
      setTrips(tripsData.filter(t => t.status === 'delivered'));
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const filterTripsByPeriod = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    return trips.filter((trip) => {
      const tripDate = trip.deliveredAt instanceof Date ? trip.deliveredAt : trip.deliveredAt?.toDate();
      if (!tripDate) return false;

      switch (selectedPeriod) {
        case 'today':
          return tripDate >= today;
        case 'week':
          return tripDate >= weekAgo;
        case 'month':
          return tripDate >= monthAgo;
        case 'all':
        default:
          return true;
      }
    });
  };

  const calculatePeriodEarnings = () => {
    const filteredTrips = filterTripsByPeriod();
    return filteredTrips.reduce((sum, trip) => sum + trip.deliveryFee, 0);
  };

  const handleWithdraw = () => {
    Alert.alert(
      'Solicitar Saque',
      'Funcionalidade em desenvolvimento.\nEm breve você poderá solicitar saques diretamente pelo app.',
      [{ text: 'OK' }]
    );
  };

  const formatDate = (date: Date | any) => {
    if (!date) return '';
    const d = date instanceof Date ? date : date.toDate();
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatTime = (date: Date | any) => {
    if (!date) return '';
    const d = date instanceof Date ? date : date.toDate();
    return d.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const periodEarnings = calculatePeriodEarnings();
  const periodTrips = filterTripsByPeriod();
  const averageEarning = periodTrips.length > 0 ? periodEarnings / periodTrips.length : 0;

  // Agrupar corridas por data
  const groupedTrips = periodTrips.reduce((groups: Record<string, Trip[]>, trip) => {
    const date = formatDate(trip.deliveredAt);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(trip);
    return groups;
  }, {});

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FF6B35']} />}
    >
      {/* Saldo principal */}
      <View style={styles.balanceCard}>
        <View style={styles.balanceHeader}>
          <Icon name="wallet" size={32} color="#fff" />
          <Text style={styles.balanceLabel}>Saldo Total</Text>
        </View>
        <Text style={styles.balanceValue}>
          R$ {deliveryPerson?.stats?.totalEarnings?.toFixed(2) || '0.00'}
        </Text>
        <TouchableOpacity style={styles.withdrawButton} onPress={handleWithdraw}>
          <Icon name="bank-transfer" size={20} color="#FF6B35" />
          <Text style={styles.withdrawButtonText}>Solicitar Saque</Text>
        </TouchableOpacity>
      </View>

      {/* Filtros de período */}
      <View style={styles.periodContainer}>
        <TouchableOpacity
          style={[styles.periodButton, selectedPeriod === 'today' && styles.periodButtonActive]}
          onPress={() => setSelectedPeriod('today')}
        >
          <Text style={[styles.periodButtonText, selectedPeriod === 'today' && styles.periodButtonTextActive]}>
            Hoje
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.periodButton, selectedPeriod === 'week' && styles.periodButtonActive]}
          onPress={() => setSelectedPeriod('week')}
        >
          <Text style={[styles.periodButtonText, selectedPeriod === 'week' && styles.periodButtonTextActive]}>
            7 dias
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.periodButton, selectedPeriod === 'month' && styles.periodButtonActive]}
          onPress={() => setSelectedPeriod('month')}
        >
          <Text style={[styles.periodButtonText, selectedPeriod === 'month' && styles.periodButtonTextActive]}>
            30 dias
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.periodButton, selectedPeriod === 'all' && styles.periodButtonActive]}
          onPress={() => setSelectedPeriod('all')}
        >
          <Text style={[styles.periodButtonText, selectedPeriod === 'all' && styles.periodButtonTextActive]}>
            Tudo
          </Text>
        </TouchableOpacity>
      </View>

      {/* Estatísticas do período */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Icon name="currency-usd" size={28} color="#4CAF50" />
          <Text style={styles.statValue}>R$ {periodEarnings.toFixed(2)}</Text>
          <Text style={styles.statLabel}>Ganhos no período</Text>
        </View>

        <View style={styles.statCard}>
          <Icon name="package-variant" size={28} color="#2196F3" />
          <Text style={styles.statValue}>{periodTrips.length}</Text>
          <Text style={styles.statLabel}>Entregas</Text>
        </View>

        <View style={styles.statCard}>
          <Icon name="chart-line" size={28} color="#FF9800" />
          <Text style={styles.statValue}>R$ {averageEarning.toFixed(2)}</Text>
          <Text style={styles.statLabel}>Média por entrega</Text>
        </View>
      </View>

      {/* Histórico de ganhos */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Histórico de Ganhos</Text>

        {Object.keys(groupedTrips).length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="calendar-blank" size={48} color="#ccc" />
            <Text style={styles.emptyText}>Nenhum ganho neste período</Text>
          </View>
        ) : (
          Object.entries(groupedTrips).map(([date, dateTrips]) => {
            const dayTotal = dateTrips.reduce((sum, trip) => sum + trip.deliveryFee, 0);

            return (
              <View key={date} style={styles.dayGroup}>
                <View style={styles.dayGroupHeader}>
                  <Text style={styles.dayGroupDate}>{date}</Text>
                  <View style={styles.dayGroupTotal}>
                    <Icon name="cash" size={16} color="#4CAF50" />
                    <Text style={styles.dayGroupTotalText}>R$ {dayTotal.toFixed(2)}</Text>
                  </View>
                </View>

                {dateTrips.map((trip) => (
                  <View key={trip.id} style={styles.transactionItem}>
                    <View style={styles.transactionIcon}>
                      <Icon name="plus" size={16} color="#4CAF50" />
                    </View>
                    <View style={styles.transactionInfo}>
                      <Text style={styles.transactionStore}>{trip.storeName}</Text>
                      <Text style={styles.transactionTime}>{formatTime(trip.deliveredAt)}</Text>
                    </View>
                    <Text style={styles.transactionValue}>+ R$ {trip.deliveryFee.toFixed(2)}</Text>
                  </View>
                ))}
              </View>
            );
          })
        )}
      </View>

      {/* Informações de saque */}
      <View style={styles.withdrawInfo}>
        <Icon name="information" size={20} color="#2196F3" />
        <View style={styles.withdrawInfoText}>
          <Text style={styles.withdrawInfoTitle}>Como funciona o saque?</Text>
          <Text style={styles.withdrawInfoDescription}>
            • Você pode solicitar saques a partir de R$ 20,00{'\n'}
            • O prazo para recebimento é de 1 a 2 dias úteis{'\n'}
            • Transferências gratuitas para conta bancária cadastrada
          </Text>
        </View>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  balanceCard: {
    backgroundColor: '#FF6B35',
    margin: 16,
    borderRadius: 16,
    padding: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  balanceLabel: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  balanceValue: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  withdrawButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },
  withdrawButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B35',
  },
  periodContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 16,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  periodButtonActive: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  periodButtonTextActive: {
    color: '#fff',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  dayGroup: {
    marginBottom: 16,
  },
  dayGroupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginBottom: 8,
  },
  dayGroupDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  dayGroupTotal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dayGroupTotalText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 12,
  },
  transactionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionStore: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  transactionTime: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  transactionValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    marginTop: 12,
  },
  withdrawInfo: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    gap: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  withdrawInfoText: {
    flex: 1,
  },
  withdrawInfoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1976D2',
    marginBottom: 6,
  },
  withdrawInfoDescription: {
    fontSize: 13,
    color: '#1565C0',
    lineHeight: 20,
  },
});

export default DeliveryWalletScreen;
