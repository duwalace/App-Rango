import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CartItem as CartItemType } from '../contexts/CartContext';
import QuantityStepper from './QuantityStepper';

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
  onPress?: (item: CartItemType) => void;
}

const CartItem: React.FC<CartItemProps> = ({
  item,
  onUpdateQuantity,
  onRemove,
  onPress,
}) => {
  const formatPrice = (price: number) => {
    return `R$ ${price.toFixed(2).replace('.', ',')}`;
  };

  const totalPrice = item.price * item.quantity;

  const handleIncrease = () => {
    onUpdateQuantity(item.id, item.quantity + 1);
  };

  const handleDecrease = () => {
    if (item.quantity > 1) {
      onUpdateQuantity(item.id, item.quantity - 1);
    }
  };

  const handleRemove = () => {
    onRemove(item.id);
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress?.(item)}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        {/* Imagem do Produto */}
        <Image source={{ uri: item.image }} style={styles.productImage} />
        
        {/* Informações do Produto */}
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {item.name}
          </Text>
          
          {item.observations && (
            <Text style={styles.observations} numberOfLines={2}>
              Obs: {item.observations}
            </Text>
          )}
          
          <View style={styles.priceRow}>
            <Text style={styles.unitPrice}>
              {formatPrice(item.price)} cada
            </Text>
            <Text style={styles.totalPrice}>
              {formatPrice(totalPrice)}
            </Text>
          </View>
        </View>
        
        {/* Controles de Quantidade */}
        <View style={styles.quantityControls}>
          <QuantityStepper
            quantity={item.quantity}
            onIncrease={handleIncrease}
            onDecrease={handleDecrease}
            size="small"
            showRemoveIcon={true}
            onRemove={handleRemove}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  content: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'flex-start',
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
    marginRight: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
    lineHeight: 20,
  },
  observations: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 8,
    lineHeight: 16,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  unitPrice: {
    fontSize: 12,
    color: '#999',
  },
  totalPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#EA1D2C',
  },
  quantityControls: {
    justifyContent: 'center',
  },
});

export default CartItem;