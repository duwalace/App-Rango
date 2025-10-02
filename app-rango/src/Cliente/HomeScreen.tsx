import React, { useState, useEffect } from 'react';
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
  mockFilters
} from '../data/mockData';
import { subscribeToActiveStores } from '../services/storeService';

type HomeScreenNavigationProp = StackNavigationProp<HomeStackParamList>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  
  // Estados para dados reais do Firebase
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar lojas ativas do Firebase
  useEffect(() => {
    console.log('🔵 HomeScreen: Carregando lojas ativas do Firebase...');
    
    const unsubscribe = subscribeToActiveStores((storesData) => {
      console.log('✅ HomeScreen: Lojas recebidas:', storesData.length);
      
      // Converter dados do Firebase para formato do componente
      const formattedStores = storesData.map(store => ({
        id: store.id,
        name: store.name,
        image: store.coverImage || 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=600&h=400&fit=crop',
        logo: store.logo || 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=100&h=100&fit=crop',
        rating: store.rating || 4.5,
        reviewCount: store.reviewCount || Math.floor(Math.random() * 1000) + 100,
        distance: '2.1 km', // TODO: Calcular distância real
        deliveryTime: store.delivery?.deliveryTime || '25-35 min',
        deliveryFee: `R$ ${store.delivery?.deliveryFee?.toFixed(2) || '3,99'}`,
        category: store.category || 'Restaurante',
        isFavorite: false,
        description: store.description,
        isActive: store.isActive,
      }));
      
      setStores(formattedStores);
      setLoading(false);
    });

    return () => {
      console.log('🔴 HomeScreen: Cancelando inscrição de lojas');
      unsubscribe();
    };
  }, []);

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

  // Separar lojas por categoria (se tiver dados suficientes)
  const restaurantStores = stores.filter(store => 
    store.category?.toLowerCase().includes('restaurante') || 
    store.category?.toLowerCase().includes('comida')
  );
  
  const pizzaStores = stores.filter(store => 
    store.category?.toLowerCase().includes('pizza')
  );

  const marmitaStores = stores.filter(store => 
    store.category?.toLowerCase().includes('marmita')
  );

  // Se não tiver lojas específicas, usa todas as lojas
  const displayRestaurants = restaurantStores.length > 0 ? restaurantStores : stores;
  const displayPizzas = pizzaStores.length > 0 ? pizzaStores : stores.slice(0, 3);
  const displayMarmitas = marmitaStores.length > 0 ? marmitaStores : stores.slice(0, 4);

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
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Carregando restaurantes...</Text>
          </View>
        ) : (
          <>
            {/* Carrossel de Marmitas */}
            {displayMarmitas.length > 0 && (
              <RestaurantCarousel
                title="Marmita"
                data={displayMarmitas}
                onSeeMorePress={handleSeeMorePress}
                onRestaurantPress={handleRestaurantPress}
                onFavoritePress={handleFavoritePress}
              />
            )}
            
            {/* Carrossel de Pizzas */}
            {displayPizzas.length > 0 && (
              <RestaurantCarousel
                title="Pizza"
                data={displayPizzas}
                onSeeMorePress={handleSeeMorePress}
                onRestaurantPress={handleRestaurantPress}
                onFavoritePress={handleFavoritePress}
              />
            )}
            
            {/* Carrossel de Restaurantes */}
            {displayRestaurants.length > 0 && (
              <RestaurantCarousel
                title="Restaurantes"
                data={displayRestaurants}
                onSeeMorePress={handleSeeMorePress}
                onRestaurantPress={handleRestaurantPress}
                onFavoritePress={handleFavoritePress}
              />
            )}
          </>
        )}
        
        {/* Filtros */}
        <FilterBar 
          filters={mockFilters}
          onFilterPress={handleFilterPress}
        />
        
        {/* Lista de Restaurantes */}
        <View style={styles.restaurantsList}>
          <Text style={styles.listTitle}>Todas as lojas</Text>
          
          {loading ? (
            <Text style={styles.loadingText}>Carregando...</Text>
          ) : stores.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>Nenhuma loja encontrada</Text>
              <Text style={styles.emptyText}>
                As lojas aparecerão aqui assim que forem criadas no dashboard
              </Text>
            </View>
          ) : (
            stores.map((restaurant, index) => (
              <RestaurantListItem
                key={restaurant.id}
                restaurant={restaurant}
                onPress={() => handlePressRestaurant(restaurant)}
                onToggleFavorite={() => handleToggleFavorite(restaurant)}
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  bannersPlaceholder: {
    height: 120,
    backgroundColor: '#F5F5F5',
    marginVertical: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 16,
    borderRadius: 12,
  },
  placeholderText: {
    fontSize: 16,
    color: '#999',
    fontWeight: '500',
  },
  restaurantsList: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});

export default HomeScreen;