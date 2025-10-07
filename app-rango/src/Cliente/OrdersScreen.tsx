import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { subscribeToCustomerOrders } from '../services/orderService';
import { Order } from '../types/shared';
import OrderCard from '../components/OrderCard';

type TabType = 'active' | 'history';

const OrdersScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { usuarioLogado: user } = useAuth();

  const [activeTab, setActiveTab] = useState<TabType>('active');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    // Subscrever aos pedidos do cliente em tempo real
    const unsubscribe = subscribeToCustomerOrders(user.uid, (fetchedOrders) => {
      setOrders(fetchedOrders);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [user?.uid]);

  const activeOrders = orders.filter((order) =>
    ['pending', 'confirmed', 'preparing', 'ready', 'in_delivery'].includes(order.status)
  );

  const pastOrders = orders.filter((order) =>
    ['delivered', 'cancelled'].includes(order.status)
  );

  const handleOrderPress = (order: Order) => {
    navigation.navigate('OrderDetails', { orderId: order.id });
  };

  const renderEmptyState = () => {
    const isActiveTab = activeTab === 'active';
    
    return (
      <View style={styles.emptyContainer}>
        <Ionicons
          name={isActiveTab ? 'receipt-outline' : 'time-outline'}
          size={64}
          color="#CCC"
        />
        <Text style={styles.emptyTitle}>
          {isActiveTab ? 'Nenhum pedido ativo' : 'Nenhum pedido anterior'}
        </Text>
        <Text style={styles.emptySubtitle}>
          {isActiveTab
            ? 'Seus pedidos em andamento aparecerão aqui'
            : 'Seu histórico de pedidos aparecerá aqui'}
        </Text>
      </View>
    );
  };

  const renderTabButton = (tab: TabType, label: string, count: number) => (
    <TouchableOpacity
      style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}
      onPress={() => setActiveTab(tab)}
      activeOpacity={0.7}
    >
      <Text
        style={[styles.tabButtonText, activeTab === tab && styles.tabButtonTextActive]}
      >
        {label}
      </Text>
      {count > 0 && (
        <View
          style={[
            styles.tabBadge,
            activeTab === tab && styles.tabBadgeActive,
          ]}
        >
          <Text
            style={[
              styles.tabBadgeText,
              activeTab === tab && styles.tabBadgeTextActive,
            ]}
          >
            {count}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Meus Pedidos</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#EA1D2C" />
          <Text style={styles.loadingText}>Carregando pedidos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const displayOrders = activeTab === 'active' ? activeOrders : pastOrders;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Meus Pedidos</Text>
        {orders.length > 0 && (
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>{orders.length}</Text>
          </View>
        )}
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {renderTabButton('active', 'Em Andamento', activeOrders.length)}
        {renderTabButton('history', 'Histórico', pastOrders.length)}
      </View>

      {/* Lista de Pedidos */}
      <FlatList
        data={displayOrders}
        renderItem={({ item }) => (
          <OrderCard order={item} onPress={() => handleOrderPress(item)} />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          displayOrders.length === 0 && styles.listContentEmpty,
        ]}
        ListEmptyComponent={renderEmptyState()}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  headerBadge: {
    backgroundColor: '#EA1D2C',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  headerBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    gap: 6,
  },
  tabButtonActive: {
    borderBottomColor: '#EA1D2C',
  },
  tabButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#999',
  },
  tabButtonTextActive: {
    color: '#EA1D2C',
  },
  tabBadge: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  tabBadgeActive: {
    backgroundColor: '#FFE5E5',
  },
  tabBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#999',
  },
  tabBadgeTextActive: {
    color: '#EA1D2C',
  },
  listContent: {
    padding: 16,
  },
  listContentEmpty: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default OrdersScreen;