import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { shadowPresets } from '../utils/shadowUtils';

interface Product {
  id: string;
  name: string;
  description?: string;
  basePrice: number;
  image: string; // URL da primeira imagem
  storeName?: string;
  storeId: string;
  rating?: number;
  isPopular?: boolean;
  isFavorite?: boolean;
}

interface ProductCardProps {
  product: Product;
  onPress: (product: Product) => void;
  onFavoritePress?: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onPress, onFavoritePress }) => {
  const formatPrice = (price: number) => {
    return `R$ ${price.toFixed(2).replace('.', ',')}`;
  };

  return (
    <TouchableOpacity style={styles.container} onPress={() => onPress(product)}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: product.image }} style={styles.productImage} />
        
        {/* Badge de Avaliação */}
        {product.rating && product.rating > 0 && (
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={12} color="#FFD700" />
            <Text style={styles.ratingText}>{product.rating.toFixed(1)}</Text>
          </View>
        )}
        
        {/* Ícone de Favorito */}
        {onFavoritePress && (
          <TouchableOpacity 
            style={styles.favoriteButton} 
            onPress={() => onFavoritePress(product)}
          >
            <Ionicons 
              name={product.isFavorite ? "heart" : "heart-outline"} 
              size={20} 
              color={product.isFavorite ? "#EA1D2C" : "white"} 
            />
          </TouchableOpacity>
        )}
        
        {/* Badge Mais Vendido */}
        {product.isPopular && (
          <View style={styles.popularBadge}>
            <Ionicons name="flame" size={12} color="#fff" />
            <Text style={styles.popularText}>Mais Vendido</Text>
          </View>
        )}
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
        
        {product.description && (
          <Text style={styles.description} numberOfLines={2}>
            {product.description}
          </Text>
        )}
        
        <View style={styles.footer}>
          <Text style={styles.price}>{formatPrice(product.basePrice)}</Text>
          
          {product.storeName && (
            <Text style={styles.storeName} numberOfLines={1}>
              {product.storeName}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 200,
    marginRight: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    ...shadowPresets.card,
  },
  imageContainer: {
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: 160,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    backgroundColor: '#f0f0f0',
  },
  ratingBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  ratingText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 3,
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  popularBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: '#EA1D2C',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  popularText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  infoContainer: {
    padding: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
    lineHeight: 20,
  },
  description: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: '#EA1D2C',
  },
  storeName: {
    fontSize: 12,
    color: '#999',
    flex: 1,
    marginLeft: 8,
    textAlign: 'right',
  },
});

export default ProductCard;

