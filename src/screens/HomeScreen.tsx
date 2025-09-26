import React from 'react';
import { View, ScrollView, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { HomeStackParamList } from '../types/navigation';
import HomeHeader from '../components/HomeHeader';
import CategoriesCarousel from '../components/CategoriesCarousel';
import RestaurantCarousel from '../components/RestaurantCarousel';
import FilterBar from '../components/FilterBar';
import RestaurantListItem from '../components/RestaurantListItem';
import { 
  mockCategories, 
  mockRestaurants, 
  mockPizzaRestaurants,
  mockFilters,
  mockRestaurantsList
} from '../data/mockData';

type HomeScreenNavigationProp = StackNavigationProp<HomeStackParamList>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  const handleAddressChange = () => {
    navigation.navigate('Address');
  };

  const handleCategoryPress = (category: any) => {
    console.log('Categoria selecionada:', category.name);
    navigation.navigate('Category', {
      categoryId: category.id,
      categoryName: category.name,
    });
  };

  const handleRestaurantPress = (restaurant: any) => {
    console.log('Restaurante selecionado:', restaurant.name);
    navigation.navigate('Store', {
      storeId: restaurant.id,
    });
  };

  const handleFavoritePress = (restaurant: any) => {
    console.log('Favoritar restaurante:', restaurant.name);
  };

  const handleSeeMorePress = () => {
    console.log('Ver mais restaurantes');
  };

  const handleFilterPress = (filter: any) => {
    console.log('Filtro selecionado:', filter.label);
  };

  const handlePressRestaurant = (restaurant: any) => {
    console.log('Restaurante da lista selecionado:', restaurant.name);
    navigation.navigate('Store', {
      storeId: restaurant.id,
    });
  };

  const handleToggleFavorite = (restaurant: any) => {
    console.log('Toggle favorito:', restaurant.name);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <HomeHeader 
        address="R. Dr. José Gabriel Monteiro Neto, 271"
        onAddressPress={handleAddressChange}
      />
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Carrossel de Categorias */}
        <CategoriesCarousel 
          categories={mockCategories}
          onCategoryPress={handleCategoryPress}
        />
        
        {/* Placeholder de Banners */}
        <View style={styles.bannersPlaceholder}>
          <Text style={styles.placeholderText}>Banners Promocionais</Text>
        </View>
        
        {/* Carrossel de Marmitas */}
        <RestaurantCarousel
          title="Marmita"
          data={mockRestaurants}
          onSeeMorePress={handleSeeMorePress}
          onRestaurantPress={handleRestaurantPress}
          onFavoritePress={handleFavoritePress}
        />
        
        {/* Carrossel de Pizzas */}
        <RestaurantCarousel
          title="Pizza"
          data={mockPizzaRestaurants}
          onSeeMorePress={handleSeeMorePress}
          onRestaurantPress={handleRestaurantPress}
          onFavoritePress={handleFavoritePress}
        />
        
        {/* Barra de Filtros */}
        <FilterBar
          filters={mockFilters}
          onFilterPress={handleFilterPress}
        />
        
        {/* Título da Seção de Lojas */}
        <View style={styles.storesSection}>
          <Text style={styles.storesTitle}>Lojas</Text>
        </View>
        
        {/* Lista Vertical de Restaurantes */}
        <View style={styles.restaurantsList}>
          {mockRestaurantsList.map((restaurant) => (
            <RestaurantListItem
              key={restaurant.id}
              restaurant={restaurant}
              onPressRestaurant={handlePressRestaurant}
              onToggleFavorite={handleToggleFavorite}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  bannersPlaceholder: {
    height: 120,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 16,
    marginVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  storesSection: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
  },
  storesTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  restaurantsList: {
    backgroundColor: 'white',
  },
});

export default HomeScreen;