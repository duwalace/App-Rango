import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface DiscountedDish {
  id: string;
  name: string;
  image: string;
  discountedPrice: string;
  originalPrice: string;
  discountPercentage: string;
  storeName: string;
  storeRating: number;
  deliveryTime: string;
}

interface DiscountedDishCardProps {
  dish: DiscountedDish;
  onPress?: (dish: DiscountedDish) => void;
}

const DiscountedDishCard: React.FC<DiscountedDishCardProps> = ({
  dish,
  onPress,
}) => {
  return (
    <TouchableOpacity style={styles.container} onPress={() => onPress?.(dish)}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: dish.image }} style={styles.dishImage} />
        
        {/* Badge de Desconto */}
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>{dish.discountPercentage}</Text>
        </View>
      </View>
      
      <View style={styles.infoContainer}>
        {/* Nome do Prato */}
        <Text style={styles.dishName} numberOfLines={2}>
          {dish.name}
        </Text>
        
        {/* Preços */}
        <View style={styles.priceContainer}>
          <Text style={styles.discountedPrice}>{dish.discountedPrice}</Text>
          <Text style={styles.originalPrice}>{dish.originalPrice}</Text>
        </View>
        
        {/* Informações da Loja */}
        <View style={styles.storeInfo}>
          <Text style={styles.storeName} numberOfLines={1}>
            {dish.storeName}
          </Text>
          <View style={styles.storeDetails}>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={12} color="#FFD700" />
              <Text style={styles.ratingText}>{dish.storeRating}</Text>
            </View>
            <Text style={styles.deliveryTime}>{dish.deliveryTime}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 180,
    marginRight: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
  },
  dishImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#EA1D2C',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  discountText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },
  infoContainer: {
    padding: 12,
  },
  dishName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    lineHeight: 18,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  discountedPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#EA1D2C',
    marginRight: 8,
  },
  originalPrice: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  storeInfo: {
    marginTop: 4,
  },
  storeName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
    marginBottom: 4,
  },
  storeDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 11,
    color: '#666',
    marginLeft: 2,
  },
  deliveryTime: {
    fontSize: 11,
    color: '#666',
  },
});

export default DiscountedDishCard;