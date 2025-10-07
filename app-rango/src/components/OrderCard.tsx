import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Order, OrderStatus } from '../types/shared';

interface OrderCardProps {
  order: Order;
  onPress: () => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, onPress }) => {
  const formatPrice = (price: number) => {
    return `R$ ${price.toFixed(2).replace('.', ',')}`;
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const orderDate = date instanceof Date ? date : new Date(date);
    const diffMs = now.getTime() - orderDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'agora';
    if (diffMins < 60) return `há ${diffMins} min`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `há ${diffHours}h`;

    const diffDays = Math.floor(diffHours / 24);
    return `há ${diffDays}d`;
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return '#FFB800';
      case 'confirmed':
        return '#2196F3';
      case 'preparing':
        return '#FF9800';
      case 'ready':
        return '#9C27B0';
      case 'in_delivery':
        return '#00BCD4';
      case 'delivered':
        return '#4CAF50';
      case 'cancelled':
        return '#F44336';
      default:
        return '#999';
    }
  };

  const getStatusLabel = (status: OrderStatus) => {
    const labels: Record<OrderStatus, string> = {
      pending: 'Pendente',
      confirmed: 'Confirmado',
      preparing: 'Preparando',
      ready: 'Pronto',
      in_delivery: 'Em Entrega',
      delivered: 'Entregue',
      cancelled: 'Cancelado',
    };
    return labels[status] || status;
  };

  const getStatusIcon = (status: OrderStatus): keyof typeof Ionicons.glyphMap => {
    switch (status) {
      case 'pending':
        return 'time-outline';
      case 'confirmed':
        return 'checkmark-circle-outline';
      case 'preparing':
        return 'restaurant-outline';
      case 'ready':
        return 'checkmark-done-outline';
      case 'in_delivery':
        return 'bicycle-outline';
      case 'delivered':
        return 'checkmark-done-circle';
      case 'cancelled':
        return 'close-circle-outline';
      default:
        return 'ellipse-outline';
    }
  };

  const isActive = ['pending', 'confirmed', 'preparing', 'ready', 'in_delivery'].includes(
    order.status
  );

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Header do Card */}
      <View style={styles.header}>
        <View style={styles.orderInfo}>
          <Text style={styles.orderNumber}>
            Pedido #{order.id.slice(-6).toUpperCase()}
          </Text>
          <Text style={styles.orderTime}>{getTimeAgo(order.createdAt)}</Text>
        </View>

        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(order.status) },
          ]}
        >
          <Ionicons
            name={getStatusIcon(order.status)}
            size={14}
            color="#FFF"
          />
          <Text style={styles.statusText}>{getStatusLabel(order.status)}</Text>
        </View>
      </View>

      {/* Informações da Loja */}
      <View style={styles.storeSection}>
        <Ionicons name="restaurant" size={16} color="#666" />
        <Text style={styles.storeName}>{order.storeName}</Text>
      </View>

      {/* Itens do Pedido */}
      <View style={styles.itemsSection}>
        <Text style={styles.itemsLabel}>
          {order.items.length} {order.items.length === 1 ? 'item' : 'itens'}
        </Text>
        <Text style={styles.itemsList} numberOfLines={1}>
          {order.items.map((item) => `${item.quantity}x ${item.name}`).join(', ')}
        </Text>
      </View>

      {/* Footer com Total */}
      <View style={styles.footer}>
        <View style={styles.totalSection}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{formatPrice(order.total)}</Text>
        </View>

        {isActive && (
          <View style={styles.actionHint}>
            <Text style={styles.actionHintText}>Ver detalhes</Text>
            <Ionicons name="chevron-forward" size={16} color="#EA1D2C" />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderInfo: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 2,
  },
  orderTime: {
    fontSize: 12,
    color: '#999',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  storeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    gap: 6,
  },
  storeName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  itemsSection: {
    marginBottom: 12,
  },
  itemsLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  itemsList: {
    fontSize: 13,
    color: '#999',
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  totalLabel: {
    fontSize: 14,
    color: '#666',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#EA1D2C',
  },
  actionHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionHintText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#EA1D2C',
  },
});

export default OrderCard;

