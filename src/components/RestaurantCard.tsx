import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Restaurant {
  id: string;
  name: string;
  image: string;
  logo: string;
  rating: number;
  deliveryTime: string;
  deliveryFee: string;
  isSponsored?: boolean;
  isFavorite?: boolean;
}

interface RestaurantCardProps {
  restaurant: Restaurant;
  onPress: (restaurant: Restaurant) => void;
  onFavoritePress: (restaurant: Restaurant) => void;
}

const RestaurantCard: React.FC<RestaurantCardProps> = ({ restaurant, onPress, onFavoritePress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={() => onPress(restaurant)}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: restaurant.image }} style={styles.restaurantImage} />
        
        {/* Badge de Avaliação */}
        <View style={styles.ratingBadge}>
          <Ionicons name="star" size={12} color="#FFD700" />
          <Text style={styles.ratingText}>{restaurant.rating}</Text>
        </View>
        
        {/* Ícone de Favorito */}
        <TouchableOpacity 
          style={styles.favoriteButton} 
          onPress={() => onFavoritePress(restaurant)}
        >
          <Ionicons 
            name={restaurant.isFavorite ? "heart" : "heart-outline"} 
            size={20} 
            color={restaurant.isFavorite ? "#EA1D2C" : "white"} 
          />
        </TouchableOpacity>
        
        {/* Tag Patrocinado */}
        {restaurant.isSponsored && (
          <View style={styles.sponsoredTag}>
            <Text style={styles.sponsoredText}>Patrocinado</Text>
          </View>
        )}
      </View>
      
      <View style={styles.infoContainer}>
        <View style={styles.headerInfo}>
          <Image source={{ uri: restaurant.logo }} style={styles.logo} />
          <View style={styles.textInfo}>
            <Text style={styles.restaurantName} numberOfLines={1}>{restaurant.name}</Text>
            <Text style={styles.deliveryInfo}>
              {restaurant.deliveryTime} • {restaurant.deliveryFee}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 280,
    marginRight: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
  },
  restaurantImage: {
    width: '100%',
    height: 160,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  ratingBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  ratingText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 2,
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
  sponsoredTag: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: '#EA1D2C',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  sponsoredText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  infoContainer: {
    padding: 12,
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  textInfo: {
    flex: 1,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  deliveryInfo: {
    fontSize: 14,
    color: '#666',
  },
});

export default RestaurantCard;