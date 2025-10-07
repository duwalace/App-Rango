import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CartItem } from '../contexts/CartContext';

interface OrderSummaryCardProps {
  items: CartItem[];
  storeName: string;
  subtotal: number;
  deliveryFee: number;
  serviceFee: number;
  total: number;
}

const OrderSummaryCard: React.FC<OrderSummaryCardProps> = ({
  items,
  storeName,
  subtotal,
  deliveryFee,
  serviceFee,
  total,
}) => {
  const formatPrice = (price: number) => {
    return `R$ ${price.toFixed(2).replace('.', ',')}`;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="receipt-outline" size={20} color="#EA1D2C" />
        <Text style={styles.title}>Resumo do Pedido</Text>
      </View>

      {/* Loja */}
      <View style={styles.storeSection}>
        <Ionicons name="restaurant-outline" size={16} color="#666" />
        <Text style={styles.storeName}>{storeName}</Text>
      </View>

      {/* Lista de Itens */}
      <View style={styles.itemsSection}>
        <Text style={styles.sectionTitle}>Itens ({items.length})</Text>
        {items.map((item, index) => (
          <View key={`${item.id}-${index}`} style={styles.itemRow}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemQuantity}>{item.quantity}x</Text>
              <View style={styles.itemDetails}>
                <Text style={styles.itemName}>{item.name}</Text>
                {item.observations && (
                  <Text style={styles.itemObservations}>Obs: {item.observations}</Text>
                )}
              </View>
            </View>
            <Text style={styles.itemPrice}>
              {formatPrice(item.price * item.quantity)}
            </Text>
          </View>
        ))}
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Resumo de Valores */}
      <View style={styles.valuesSection}>
        <View style={styles.valueRow}>
          <Text style={styles.valueLabel}>Subtotal</Text>
          <Text style={styles.valueAmount}>{formatPrice(subtotal)}</Text>
        </View>

        <View style={styles.valueRow}>
          <View style={styles.valueLabelWithIcon}>
            <Ionicons name="bicycle-outline" size={16} color="#666" />
            <Text style={styles.valueLabel}>Taxa de entrega</Text>
          </View>
          <Text style={styles.valueAmount}>{formatPrice(deliveryFee)}</Text>
        </View>

        <View style={styles.valueRow}>
          <Text style={styles.valueLabel}>Taxa de serviço</Text>
          <Text style={styles.valueAmount}>{formatPrice(serviceFee)}</Text>
        </View>
      </View>

      {/* Divider */}
      <View style={styles.dividerBold} />

      {/* Total */}
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalAmount}>{formatPrice(total)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  storeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    gap: 8,
  },
  storeName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  itemsSection: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
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
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 8,
  },
  dividerBold: {
    height: 2,
    backgroundColor: '#E0E0E0',
    marginVertical: 12,
  },
  valuesSection: {
    gap: 8,
  },
  valueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  valueLabelWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  valueLabel: {
    fontSize: 14,
    color: '#666',
  },
  valueAmount: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#EA1D2C',
  },
});

export default OrderSummaryCard;

