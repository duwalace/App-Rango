import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { subscribeToDeliveryPerson, DeliveryPerson } from '../services/deliveryService';

const DeliveryStatementScreen: React.FC = () => {
  const { usuarioLogado } = useAuth();
  const [deliveryPerson, setDeliveryPerson] = useState<DeliveryPerson | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month'>('day');

  useEffect(() => {
    if (!usuarioLogado?.uid) {
      setLoading(false);
      return;
    }

    const unsubscribe = subscribeToDeliveryPerson(
      usuarioLogado.uid,
      (person) => {
        setDeliveryPerson(person);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [usuarioLogado]);

  const formatCurrency = (value: number) => {
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
  };

  const totalEarnings = deliveryPerson?.stats?.totalEarnings || 0;
  const completedDeliveries = deliveryPerson?.stats?.completedDeliveries || 0;

  // Mock data para transações
  const transactions = [
    { id: '1', date: 'Hoje, 14:30', description: 'Entrega #12345', value: 12.50, status: 'completed' },
    { id: '2', date: 'Hoje, 13:15', description: 'Entrega #12344', value: 8.00, status: 'completed' },
    { id: '3', date: 'Hoje, 12:00', description: 'Entrega #12343', value: 15.30, status: 'completed' },
    { id: '4', date: 'Ontem, 18:45', description: 'Entrega #12342', value: 10.00, status: 'completed' },
    { id: '5', date: 'Ontem, 17:30', description: 'Entrega #12341', value: 9.20, status: 'completed' },
  ];

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B35" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Extrato</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Resumo de Ganhos */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Saldo disponível</Text>
          <Text style={styles.summaryValue}>{formatCurrency(totalEarnings)}</Text>
          
          <TouchableOpacity style={styles.withdrawButton}>
            <Text style={styles.withdrawButtonText}>Sacar</Text>
          </TouchableOpacity>
        </View>

        {/* Filtro de Período */}
        <View style={styles.periodFilter}>
          <TouchableOpacity 
            style={[styles.periodButton, selectedPeriod === 'day' && styles.periodButtonActive]}
            onPress={() => setSelectedPeriod('day')}
          >
            <Text style={[styles.periodButtonText, selectedPeriod === 'day' && styles.periodButtonTextActive]}>
              Hoje
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.periodButton, selectedPeriod === 'week' && styles.periodButtonActive]}
            onPress={() => setSelectedPeriod('week')}
          >
            <Text style={[styles.periodButtonText, selectedPeriod === 'week' && styles.periodButtonTextActive]}>
              Semana
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.periodButton, selectedPeriod === 'month' && styles.periodButtonActive]}
            onPress={() => setSelectedPeriod('month')}
          >
            <Text style={[styles.periodButtonText, selectedPeriod === 'month' && styles.periodButtonTextActive]}>
              Mês
            </Text>
          </TouchableOpacity>
        </View>

        {/* Estatísticas */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="bicycle" size={24} color="#FF6B35" />
            <Text style={styles.statValue}>{completedDeliveries}</Text>
            <Text style={styles.statLabel}>Entregas</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="cash" size={24} color="#FF6B35" />
            <Text style={styles.statValue}>{formatCurrency(totalEarnings)}</Text>
            <Text style={styles.statLabel}>Ganhos</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="trending-up" size={24} color="#FF6B35" />
            <Text style={styles.statValue}>
              {completedDeliveries > 0 ? formatCurrency(totalEarnings / completedDeliveries) : 'R$ 0,00'}
            </Text>
            <Text style={styles.statLabel}>Média</Text>
          </View>
        </View>

        {/* Lista de Transações */}
        <View style={styles.transactionsSection}>
          <Text style={styles.sectionTitle}>Histórico</Text>
          
          {transactions.map((transaction) => (
            <View key={transaction.id} style={styles.transactionItem}>
              <View style={styles.transactionIcon}>
                <Ionicons name="checkmark-circle" size={24} color="#FF6B35" />
              </View>
              
              <View style={styles.transactionInfo}>
                <Text style={styles.transactionDescription}>{transaction.description}</Text>
                <Text style={styles.transactionDate}>{transaction.date}</Text>
              </View>
              
              <Text style={styles.transactionValue}>
                +{formatCurrency(transaction.value)}
              </Text>
            </View>
          ))}
        </View>

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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  summaryCard: {
    backgroundColor: '#FF6B35',
    margin: 16,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#FFF',
    opacity: 0.9,
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 20,
  },
  withdrawButton: {
    backgroundColor: '#FFF',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
  },
  withdrawButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B35',
  },
  periodFilter: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#FFF',
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: '#FF6B35',
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  periodButtonTextActive: {
    color: '#FFF',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  transactionsSection: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  transactionIcon: {
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: '#666',
  },
  transactionValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
});

export default DeliveryStatementScreen;

