import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Linking,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { subscribeToOrder, cancelOrder } from '../services/orderService';
import { Order } from '../types/shared';
import OrderStatusTracker from '../components/OrderStatusTracker';
import DeliveryTracker from '../components/DeliveryTracker';
import { HomeStackParamList } from '../types/navigation';

const OrderDetailsScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const route = useRoute<any>();

  const { orderId } = route.params;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      Alert.alert('Erro', 'ID do pedido não fornecido');
      navigation.goBack();
      return;
    }

    // Subscrever ao pedido em tempo real
    const unsubscribe = subscribeToOrder(orderId, (fetchedOrder) => {
      setOrder(fetchedOrder);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [orderId]);

  const formatPrice = (price: number) => {
    return `R$ ${price.toFixed(2).replace('.', ',')}`;
  };

  const formatDate = (date: Date) => {
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPaymentMethod = (method: string) => {
    const methods: Record<string, string> = {
      cash: 'Dinheiro',
      pix: 'PIX',
      credit_card: 'Cartão de Crédito',
      debit_card: 'Cartão de Débito',
    };
    return methods[method] || method;
  };

  const handleCallStore = () => {
    if (order?.customerPhone) {
      Linking.openURL(`tel:${order.customerPhone}`);
    }
  };

  const handleCancelOrder = () => {
    if (!order) return;

    Alert.alert(
      'Cancelar Pedido',
      'Tem certeza que deseja cancelar este pedido?',
      [
        { text: 'Não', style: 'cancel' },
        {
          text: 'Sim, Cancelar',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelOrder(order.id, 'Cancelado pelo cliente');
              Alert.alert('Pedido Cancelado', 'Seu pedido foi cancelado com sucesso');
              navigation.goBack();
            } catch (error: any) {
              Alert.alert('Erro', error.message || 'Não foi possível cancelar o pedido');
            }
          },
        },
      ]
    );
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalhes do Pedido</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#EA1D2C" />
          <Text style={styles.loadingText}>Carregando pedido...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalhes do Pedido</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#CCC" />
          <Text style={styles.emptyText}>Pedido não encontrado</Text>
        </View>
      </SafeAreaView>
    );
  }

  const canCancel = order.status === 'pending' || order.status === 'confirmed';
  const isActive = ['pending', 'confirmed', 'preparing', 'ready', 'in_delivery'].includes(
    order.status
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          Pedido #{order.id.slice(-6).toUpperCase()}
        </Text>
      </View>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Status Tracker */}
        <View style={styles.section}>
          <OrderStatusTracker currentStatus={order.status} />
        </View>

        {/* Rastreamento de Entrega em Tempo Real */}
        {(order.status === 'out_for_delivery' || order.status === 'in_delivery') && (
          <DeliveryTracker orderId={order.id} />
        )}

        {/* Informações da Loja */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="restaurant" size={20} color="#EA1D2C" />
            <Text style={styles.sectionTitle}>Restaurante</Text>
          </View>
          <View style={styles.storeCard}>
            <Text style={styles.storeName}>{order.storeName}</Text>
            <TouchableOpacity style={styles.callButton} onPress={handleCallStore}>
              <Ionicons name="call-outline" size={16} color="#EA1D2C" />
              <Text style={styles.callButtonText}>Ligar para o restaurante</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Itens do Pedido */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="receipt-outline" size={20} color="#EA1D2C" />
            <Text style={styles.sectionTitle}>Itens do Pedido</Text>
          </View>
          <View style={styles.itemsCard}>
            {order.items.map((item, index) => (
              <View key={index} style={styles.itemRow}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemQuantity}>{item.quantity}x</Text>
                  <View style={styles.itemDetails}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    {item.observations && (
                      <Text style={styles.itemObservations}>Obs: {item.observations}</Text>
                    )}
                  </View>
                </View>
                <Text style={styles.itemPrice}>{formatPrice(item.subtotal)}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Endereço de Entrega */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="location" size={20} color="#EA1D2C" />
            <Text style={styles.sectionTitle}>Endereço de Entrega</Text>
          </View>
          <View style={styles.addressCard}>
            <Text style={styles.addressText}>
              {order.deliveryAddress.street}, {order.deliveryAddress.number}
              {order.deliveryAddress.complement
                ? ` - ${order.deliveryAddress.complement}`
                : ''}
            </Text>
            <Text style={styles.addressText}>
              {order.deliveryAddress.neighborhood} - {order.deliveryAddress.city}/
              {order.deliveryAddress.state}
            </Text>
            <Text style={styles.addressCEP}>CEP: {order.deliveryAddress.zipCode}</Text>
            {order.deliveryInstructions && (
              <View style={styles.instructionsBox}>
                <Ionicons name="chatbubble-outline" size={14} color="#666" />
                <Text style={styles.instructionsText}>{order.deliveryInstructions}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Resumo de Valores */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="calculator-outline" size={20} color="#EA1D2C" />
            <Text style={styles.sectionTitle}>Resumo de Valores</Text>
          </View>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>{formatPrice(order.subtotal)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Taxa de entrega</Text>
              <Text style={styles.summaryValue}>{formatPrice(order.deliveryFee)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Taxa de serviço</Text>
              <Text style={styles.summaryValue}>{formatPrice(order.serviceFee)}</Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{formatPrice(order.total)}</Text>
            </View>
            <View style={styles.paymentInfo}>
              <Ionicons name="card-outline" size={16} color="#666" />
              <Text style={styles.paymentText}>
                {formatPaymentMethod(order.paymentMethod)}
              </Text>
            </View>
          </View>
        </View>

        {/* Informações Adicionais */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle-outline" size={20} color="#EA1D2C" />
            <Text style={styles.sectionTitle}>Informações</Text>
          </View>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Data do pedido</Text>
              <Text style={styles.infoValue}>{formatDate(order.createdAt)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Previsão de entrega</Text>
              <Text style={styles.infoValue}>
                {formatDate(order.estimatedDeliveryTime)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.spacer} />
      </ScrollView>

      {/* Botões de Ação */}
      <View style={styles.footer}>
        {/* Botão Avaliar (se entregue e não cancelado) */}
        {order.status === 'delivered' && (
          <TouchableOpacity
            style={styles.reviewButton}
            onPress={() => navigation.navigate('Review', { orderId: order.id })}
            activeOpacity={0.8}
          >
            <Ionicons name="star-outline" size={20} color="#EA1D2C" />
            <Text style={styles.reviewButtonText}>Avaliar Pedido</Text>
          </TouchableOpacity>
        )}

        {/* Botão Cancelar */}
        {canCancel && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancelOrder}
            activeOpacity={0.8}
          >
            <Ionicons name="close-circle-outline" size={20} color="#FF3B30" />
            <Text style={styles.cancelButtonText}>Cancelar Pedido</Text>
          </TouchableOpacity>
        )}
      </View>
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
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 4,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  scrollContent: {
    flex: 1,
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  storeCard: {
    backgroundColor: '#F8F8F8',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  storeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  callButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EA1D2C',
  },
  itemsCard: {
    gap: 12,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemInfo: {
    flexDirection: 'row',
    flex: 1,
    marginRight: 8,
  },
  itemQuantity: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EA1D2C',
    marginRight: 8,
    minWidth: 24,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  itemObservations: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
    fontStyle: 'italic',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  addressCard: {
    backgroundColor: '#F8F8F8',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  addressText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  addressCEP: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  instructionsBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
    padding: 8,
    backgroundColor: '#FFF8E1',
    borderRadius: 6,
    gap: 6,
  },
  instructionsText: {
    flex: 1,
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  summaryCard: {
    gap: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    marginTop: 8,
    paddingTop: 12,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#EA1D2C',
  },
  paymentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  paymentText: {
    fontSize: 14,
    color: '#666',
  },
  infoCard: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  spacer: {
    height: 100,
  },
  footer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
    gap: 12,
  },
  reviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 8,
    backgroundColor: '#EA1D2C',
    gap: 8,
  },
  reviewButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF3B30',
    gap: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
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
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
});

export default OrderDetailsScreen;

