import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface RestaurantListData {
  id: string;
  name: string;
  logo: string;
  rating: number;
  category: string;
  distance: string;
  deliveryTime: string;
  deliveryFee: string;
  isSponsored?: boolean;
  isFreeDelivery?: boolean;
  isFavorite?: boolean;
}

interface RestaurantListItemProps {
  restaurant: RestaurantListData;
  onPressRestaurant: (restaurant: RestaurantListData) => void;
  onToggleFavorite: (restaurant: RestaurantListData) => void;
}

const RestaurantListItem: React.FC<RestaurantListItemProps> = ({
  restaurant,
  onPressRestaurant,
  onToggleFavorite,
}) => {
  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={() => onPressRestaurant(restaurant)}
    >
      {/* Logo do Restaurante */}
      <Image source={{ uri: restaurant.logo }} style={styles.logo} />
      
      {/* Área de Informações */}
      <View style={styles.infoContainer}>
        {/* Tag Patrocinado */}
        {restaurant.isSponsored && (
          <Text style={styles.sponsoredText}>Patrocinado</Text>
        )}
        
        {/* Nome do Restaurante */}
        <Text style={styles.restaurantName} numberOfLines={1}>
          {restaurant.name}
        </Text>
        
        {/* Linha de Avaliação, Categoria e Distância */}
        <View style={styles.detailsRow}>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={12} color="#FFD700" />
            <Text style={styles.ratingText}>{restaurant.rating}</Text>
          </View>
          <Text style={styles.separator}>•</Text>
          <Text style={styles.categoryText}>{restaurant.category}</Text>
          <Text style={styles.separator}>•</Text>
          <Text style={styles.distanceText}>{restaurant.distance}</Text>
        </View>
        
        {/* Linha de Tempo e Taxa de Entrega */}
        <View style={styles.deliveryRow}>
          <Text style={styles.deliveryTime}>{restaurant.deliveryTime}</Text>
          <Text style={styles.separator}>•</Text>
          {restaurant.isFreeDelivery ? (
            <Text style={styles.freeDeliveryText}>Grátis</Text>
          ) : (
            <Text style={styles.deliveryFee}>{restaurant.deliveryFee}</Text>
          )}
        </View>
      </View>
      
      {/* Ícone de Favorito */}
      <TouchableOpacity 
        style={styles.favoriteButton}
        onPress={() => onToggleFavorite(restaurant)}
      >
        <Ionicons 
          name={restaurant.isFavorite ? "heart" : "heart-outline"} 
          size={20} 
          color={restaurant.isFavorite ? "#EA1D2C" : "#999"} 
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  sponsoredText: {
    fontSize: 10,
    color: '#999',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    color: '#333',
    marginLeft: 2,
    fontWeight: '500',
  },
  separator: {
    fontSize: 12,
    color: '#999',
    marginHorizontal: 6,
  },
  categoryText: {
    fontSize: 12,
    color: '#666',
  },
  distanceText: {
    fontSize: 12,
    color: '#666',
  },
  deliveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deliveryTime: {
    fontSize: 12,
    color: '#666',
  },
  deliveryFee: {
    fontSize: 12,
    color: '#666',
  },
  freeDeliveryText: {
    fontSize: 12,
    color: '#00A651',
    fontWeight: '600',
  },
  favoriteButton: {
    padding: 8,
    marginLeft: 8,
  },
});

export default RestaurantListItem;