import React, { useState, useEffect } from 'react';
import { View, ScrollView, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { HomeStackParamList } from '../types/navigation';
import HomeHeader from '../components/HomeHeader';
import CategoriesCarousel from '../components/CategoriesCarousel';
import RestaurantCarousel from '../components/RestaurantCarousel';
import ProductCarousel from '../components/ProductCarousel';
import FilterBar from '../components/FilterBar';
import RestaurantListItem from '../components/RestaurantListItem';
import { 
  mockCategories, 
  mockFilters
} from '../data/mockData';
import { subscribeToActiveStores } from '../services/storeService';
import { getProductsByTag } from '../services/menuService';

type HomeScreenNavigationProp = StackNavigationProp<HomeStackParamList>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  
  // Estados para dados reais do Firebase
  const [stores, setStores] = useState<any[]>([]);
  const [pizzaProducts, setPizzaProducts] = useState<any[]>([]);
  const [marmitaProducts, setMarmitaProducts] = useState<any[]>([]);
  const [popularProducts, setPopularProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);

  // Carregar lojas ativas do Firebase
  useEffect(() => {
    console.log('🔵 HomeScreen: Carregando lojas ativas do Firebase...');
    
    const unsubscribe = subscribeToActiveStores((storesData) => {
      console.log('✅ HomeScreen: Lojas recebidas:', storesData.length);
      
      // Converter dados do Firebase para formato do componente
      const formattedStores = storesData.map(store => {
        // Log para debug de imagens
        if (!store.coverImage || !store.logo) {
          console.warn(`⚠️ Loja "${store.name}" sem imagens:`, {
            coverImage: store.coverImage || 'AUSENTE',
            logo: store.logo || 'AUSENTE'
          });
        }
        
        // Log para debug de categoria
        console.log(`📊 Loja: ${store.name} | Categoria: ${store.category || 'SEM CATEGORIA'}`);
        
        return {
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
        };
      });
      
      setStores(formattedStores);
      setLoading(false);
    });

    return () => {
      console.log('🔴 HomeScreen: Cancelando inscrição de lojas');
      unsubscribe();
    };
  }, []);

  // Carregar produtos por categoria
  useEffect(() => {
    const loadProducts = async () => {
      console.log('🔵 HomeScreen: Carregando produtos por categoria...');
      setProductsLoading(true);
      
      try {
        // Buscar produtos de cada categoria em paralelo
        const [pizzas, marmitas] = await Promise.all([
          getProductsByTag('pizza', 10),
          getProductsByTag('marmita', 10),
        ]);
        
        console.log('✅ Produtos carregados - Pizzas:', pizzas.length, 'Marmitas:', marmitas.length);
        
        // Formatar produtos para exibição
        const formatProduct = (item: any, storeName: string = '') => ({
          id: item.id,
          name: item.name,
          description: item.description || item.shortDescription,
          basePrice: item.basePrice || item.price || 0,
          image: item.images && item.images.length > 0 
            ? item.images[0].url 
            : item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
          storeId: item.storeId,
          storeName: storeName,
          rating: item.rating || 0,
          isPopular: item.isPopular || false,
          isFavorite: false,
        });
        
        setPizzaProducts(pizzas.map((p: any) => formatProduct(p)));
        setMarmitaProducts(marmitas.map((m: any) => formatProduct(m)));
        
      } catch (error) {
        console.error('❌ Erro ao carregar produtos:', error);
      } finally {
        setProductsLoading(false);
      }
    };
    
    loadProducts();
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

  const handleProductPress = (product: any) => {
    console.log('Produto selecionado:', product.name);
    // Navegar para a loja do produto
    navigation.navigate('Store', {
      storeId: product.storeId,
    });
  };

  const handleFavoritePress = (restaurant: any) => {
    console.log('Favoritar restaurante:', restaurant.name);
  };

  const handleFavoriteProductPress = (product: any) => {
    console.log('Favoritar produto:', product.name);
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

  // Separar lojas por categoria (para seção "Restaurantes")
  const restaurantStores = stores.filter(store => {
    const category = store.category?.toLowerCase() || '';
    return category.includes('restaurante') || category.includes('comida');
  });

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
        
        {productsLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Carregando produtos...</Text>
          </View>
        ) : (
          <>
            {/* Carrossel de Pizzas - PRODUTOS */}
            {pizzaProducts.length > 0 && (
              <ProductCarousel
                title="Pizza"
                data={pizzaProducts}
                onSeeMorePress={handleSeeMorePress}
                onProductPress={handleProductPress}
                onFavoritePress={handleFavoriteProductPress}
              />
            )}
            
            {/* Carrossel de Marmitas - PRODUTOS */}
            {marmitaProducts.length > 0 && (
              <ProductCarousel
                title="Marmita"
                data={marmitaProducts}
                onSeeMorePress={handleSeeMorePress}
                onProductPress={handleProductPress}
                onFavoritePress={handleFavoriteProductPress}
              />
            )}
            
            {/* Carrossel de Restaurantes - LOJAS */}
            {restaurantStores.length > 0 && (
              <RestaurantCarousel
                title="Restaurantes"
                data={restaurantStores}
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