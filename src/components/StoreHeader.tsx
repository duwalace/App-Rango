import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HEADER_HEIGHT = 300;
const CARD_HEIGHT = 120;

interface Store {
  id: string;
  name: string;
  image: string;
  logo: string;
  rating: number;
  reviewCount: number;
  distance: string;
  deliveryTime: string;
  deliveryFee: string;
  category: string;
  isFavorite?: boolean;
}

interface StoreHeaderProps {
  store: Store;
  animatedValue: Animated.Value;
  onFavoritePress?: () => void;
  onSearchPress?: () => void;
}

const StoreHeader: React.FC<StoreHeaderProps> = ({
  store,
  animatedValue,
  onFavoritePress,
  onSearchPress,
}) => {
  const navigation = useNavigation();

  // Animação da imagem de fundo (parallax)
  const imageTranslateY = animatedValue.interpolate({
    inputRange: [0, HEADER_HEIGHT],
    outputRange: [0, -HEADER_HEIGHT / 2],
    extrapolate: 'clamp',
  });

  // Animação de opacidade da imagem
  const imageOpacity = animatedValue.interpolate({
    inputRange: [0, HEADER_HEIGHT / 2, HEADER_HEIGHT],
    outputRange: [1, 0.8, 0],
    extrapolate: 'clamp',
  });

  // Animação do card de informações
  const cardTranslateY = animatedValue.interpolate({
    inputRange: [0, HEADER_HEIGHT - CARD_HEIGHT],
    outputRange: [0, -(HEADER_HEIGHT - CARD_HEIGHT)],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      {/* Imagem de Fundo Animada */}
      <Animated.View
        style={[
          styles.imageContainer,
          {
            transform: [{ translateY: imageTranslateY }],
            opacity: imageOpacity,
          },
        ]}
      >
        <Image source={{ uri: store.image }} style={styles.backgroundImage} />
        
        {/* Overlay escuro */}
        <View style={styles.overlay} />
        
        {/* Botões Flutuantes */}
        <View style={styles.floatingButtons}>
          <TouchableOpacity 
            style={styles.floatingButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          
          <View style={styles.rightButtons}>
            <TouchableOpacity 
              style={styles.floatingButton}
              onPress={onSearchPress}
            >
              <Ionicons name="search" size={24} color="white" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.floatingButton, styles.favoriteButton]}
              onPress={onFavoritePress}
            >
              <Ionicons 
                name={store.isFavorite ? "heart" : "heart-outline"} 
                size={24} 
                color={store.isFavorite ? "#EA1D2C" : "white"} 
              />
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>

      {/* Card de Informações Flutuante */}
      <Animated.View
        style={[
          styles.infoCard,
          {
            transform: [{ translateY: cardTranslateY }],
          },
        ]}
      >
        {/* Logo Circular */}
        <View style={styles.logoContainer}>
          <Image source={{ uri: store.logo }} style={styles.logo} />
        </View>
        
        {/* Informações da Loja */}
        <View style={styles.storeInfo}>
          <Text style={styles.storeName}>{store.name}</Text>
          <Text style={styles.storeCategory}>{store.category}</Text>
          
          {/* Linha de Avaliação */}
          <View style={styles.ratingRow}>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={styles.ratingText}>{store.rating}</Text>
              <Text style={styles.reviewText}>({store.reviewCount}+)</Text>
            </View>
            <Text style={styles.distance}>{store.distance}</Text>
          </View>
          
          {/* Linha de Entrega */}
          <View style={styles.deliveryRow}>
            <View style={styles.deliveryInfo}>
              <Ionicons name="time-outline" size={16} color="#666" />
              <Text style={styles.deliveryText}>{store.deliveryTime}</Text>
            </View>
            <View style={styles.deliveryInfo}>
              <Ionicons name="bicycle-outline" size={16} color="#666" />
              <Text style={styles.deliveryText}>{store.deliveryFee}</Text>
            </View>
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: HEADER_HEIGHT + CARD_HEIGHT / 2,
    position: 'relative',
  },
  imageContainer: {
    height: HEADER_HEIGHT,
    width: SCREEN_WIDTH,
    position: 'absolute',
    top: 0,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  floatingButtons: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rightButtons: {
    flexDirection: 'row',
  },
  floatingButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  favoriteButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  infoCard: {
    position: 'absolute',
    bottom: 0,
    left: 16,
    right: 16,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  logoContainer: {
    position: 'absolute',
    top: -30,
    left: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  storeInfo: {
    marginTop: 10,
    marginLeft: 80,
  },
  storeName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  storeCategory: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginLeft: 4,
  },
  reviewText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  distance: {
    fontSize: 14,
    color: '#666',
  },
  deliveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deliveryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  deliveryText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
});

export default StoreHeader;