import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

interface HighlightDish {
  id: string;
  name: string;
  image: string;
  price: string | number;
  formattedPrice?: string;
  originalPrice?: string;
  isPopular?: boolean;
  isBestSeller?: boolean;
}

interface HighlightDishCardProps {
  dish: HighlightDish;
  onPress?: (dish: HighlightDish) => void;
}

const HighlightDishCard: React.FC<HighlightDishCardProps> = ({
  dish,
  onPress,
}) => {
  const getTagText = () => {
    if (dish.isBestSeller) return 'Mais pedido';
    if (dish.isPopular) return 'Popular';
    return null;
  };

  const formatPrice = (price: string | number): string => {
    if (typeof price === 'string') return price;
    return `R$ ${price.toFixed(2).replace('.', ',')}`;
  };

  const displayPrice = dish.formattedPrice || formatPrice(dish.price);
  const tagText = getTagText();

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={() => onPress?.(dish)}
      activeOpacity={0.8}
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: dish.image }} style={styles.dishImage} />
        
        {/* Tag de Destaque */}
        {tagText && (
          <View style={[
            styles.tag,
            dish.isBestSeller && styles.bestSellerTag,
            dish.isPopular && styles.popularTag,
          ]}>
            <Text style={styles.tagText}>{tagText}</Text>
          </View>
        )}
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={styles.dishName} numberOfLines={2}>
          {dish.name}
        </Text>
        
        <View style={styles.priceContainer}>
          <Text style={styles.price}>{displayPrice}</Text>
          {dish.originalPrice && (
            <Text style={styles.originalPrice}>{dish.originalPrice}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 160,
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
    resizeMode: 'cover',
  },
  tag: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  bestSellerTag: {
    backgroundColor: '#EA1D2C',
  },
  popularTag: {
    backgroundColor: '#FF6B35',
  },
  tagText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
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
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#EA1D2C',
  },
  originalPrice: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
    marginLeft: 8,
  },
});

export default HighlightDishCard;