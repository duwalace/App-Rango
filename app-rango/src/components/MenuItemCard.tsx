import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { shadowPresets } from '../utils/shadowUtils';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: string | number;
  formattedPrice?: string;
  originalPrice?: string;
  image: string;
  isPromotion?: boolean;
  isVegetarian?: boolean;
  isSpicy?: boolean;
}

interface MenuItemCardProps {
  item: MenuItem;
  onPress?: (item: MenuItem) => void;
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({
  item,
  onPress,
}) => {
  const formatPrice = (price: string | number): string => {
    if (typeof price === 'string') return price;
    return `R$ ${price.toFixed(2).replace('.', ',')}`;
  };

  const displayPrice = item.formattedPrice || formatPrice(item.price);

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={() => onPress?.(item)}
      activeOpacity={0.8}
    >
      <View style={styles.contentContainer}>
        {/* Área de Texto */}
        <View style={styles.textContainer}>
          <View style={styles.titleRow}>
            <Text style={styles.itemName} numberOfLines={2}>
              {item.name}
            </Text>
            
            {/* Badges */}
            <View style={styles.badges}>
              {item.isVegetarian && (
                <View style={[styles.badge, styles.vegetarianBadge]}>
                  <Text style={styles.badgeText}>🌱</Text>
                </View>
              )}
              {item.isSpicy && (
                <View style={[styles.badge, styles.spicyBadge]}>
                  <Text style={styles.badgeText}>🌶️</Text>
                </View>
              )}
            </View>
          </View>
          
          <Text style={styles.description} numberOfLines={3}>
            {item.description}
          </Text>
          
          <View style={styles.priceContainer}>
            <Text style={styles.price}>{displayPrice}</Text>
            {item.originalPrice && (
              <Text style={styles.originalPrice}>{item.originalPrice}</Text>
            )}
            {item.isPromotion && (
              <View style={styles.promotionBadge}>
                <Text style={styles.promotionText}>OFERTA</Text>
              </View>
            )}
          </View>
        </View>
        
        {/* Imagem do Prato */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.image }} style={styles.itemImage} />
          
          {/* Botão de Adicionar */}
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => onPress?.(item)}
          >
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    ...shadowPresets.small,
  },
  contentContainer: {
    flexDirection: 'row',
    padding: 16,
  },
  textContainer: {
    flex: 1,
    marginRight: 16,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    lineHeight: 22,
  },
  badges: {
    flexDirection: 'row',
    marginLeft: 8,
  },
  badge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  vegetarianBadge: {
    backgroundColor: '#E8F5E8',
  },
  spicyBadge: {
    backgroundColor: '#FFE8E8',
  },
  badgeText: {
    fontSize: 10,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
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
    fontSize: 14,
    color: '#999',
    textDecorationLine: 'line-through',
    marginLeft: 8,
  },
  promotionBadge: {
    backgroundColor: '#EA1D2C',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  promotionText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '700',
  },
  imageContainer: {
    position: 'relative',
  },
  itemImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  addButton: {
    position: 'absolute',
    bottom: -8,
    right: -8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EA1D2C',
    justifyContent: 'center',
    alignItems: 'center',
    ...shadowPresets.button,
  },
  addButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
});

export default MenuItemCard;