import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { HomeStackParamList } from '../types/navigation';

// Componentes
import CategoryHeader from '../components/CategoryHeader';
import CategoryFilterCarousel from '../components/CategoryFilterCarousel';
import SubCategoryCarousel from '../components/SubCategoryCarousel';
import ContentCarousel from '../components/ContentCarousel';
import RestaurantCard from '../components/RestaurantCard';
import DiscountedDishCard from '../components/DiscountedDishCard';
import PromoBannerCard from '../components/PromoBannerCard';
import RestaurantListItem from '../components/RestaurantListItem';

// Dados
import { mockCategories } from '../data/mockData';
import { getCategoryScreenData } from '../data/categoryData';

// Services
import { getStoresByCategorySlug } from '../services/storeService';
import { mapCategoryIdToSlug } from '../services/categoryService';

type CategoryScreenRouteProp = RouteProp<{
  Category: { categoryId: string; categoryName: string };
}, 'Category'>;

interface ShelfItem {
  type: string;
  title?: string;
  data?: any;
}

type CategoryScreenNavigationProp = StackNavigationProp<HomeStackParamList>;

const CategoryScreen: React.FC = () => {
  const route = useRoute<CategoryScreenRouteProp>();
  const navigation = useNavigation<CategoryScreenNavigationProp>();
  const { categoryId, categoryName } = route.params;
  
  const [activeCategory, setActiveCategory] = useState(categoryId);
  const [screenData, setScreenData] = useState<ShelfItem[]>([]);
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar lojas da categoria
  useEffect(() => {
    loadCategoryStores(activeCategory);
  }, [activeCategory]);

  const loadCategoryStores = async (categoryId: string) => {
    setLoading(true);
    try {
      const categorySlug = mapCategoryIdToSlug(categoryId);
      console.log(`🔵 Carregando lojas da categoria: ${categorySlug}`);
      
      const categoryStores = await getStoresByCategorySlug(categorySlug);
      
      // Formatar dados para o componente
      const formattedStores = categoryStores.map(store => ({
        id: store.id,
        name: store.name,
        image: store.coverImage || 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=600&h=400&fit=crop',
        logo: store.logo || 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=100&h=100&fit=crop',
        rating: store.rating || 4.5,
        reviewCount: store.reviewCount || 0,
        distance: '2.1 km', // TODO: Calcular distância real
        deliveryTime: store.delivery?.deliveryTime || '25-35 min',
        deliveryFee: `R$ ${store.delivery?.deliveryFee?.toFixed(2) || '3,99'}`,
        category: store.category || categoryName,
        isFavorite: false,
        isSponsored: false,
      }));

      setStores(formattedStores);

      // Montar estrutura de dados da tela
      const newScreenData: ShelfItem[] = [];

      // Se houver lojas patrocinadas (pode ser implementado depois)
      const sponsoredStores = formattedStores.filter(s => s.isSponsored);
      if (sponsoredStores.length > 0) {
        newScreenData.push({
          type: 'sponsored_stores_carousel',
          title: 'Lojas em Destaque',
          data: sponsoredStores,
        });
      }

      // Título da seção de todas as lojas
      newScreenData.push({
        type: 'section_title',
        title: `Todas as lojas de ${categoryName}`,
      });

      // Lista de lojas
      formattedStores.forEach(store => {
        newScreenData.push({
          type: 'store_list_item',
          data: store,
        });
      });

      setScreenData(newScreenData);
      console.log(`✅ ${formattedStores.length} lojas carregadas`);
    } catch (error) {
      console.error('❌ Erro ao carregar lojas:', error);
      // Em caso de erro, usar dados mockados como fallback
      setScreenData(getCategoryScreenData(categoryId));
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryPress = useCallback((newCategoryId: string) => {
    setActiveCategory(newCategoryId);
  }, []);

  const handleRestaurantPress = useCallback((restaurant: any) => {
    console.log('Restaurant pressed:', restaurant);
    // Navegar para a tela do restaurante
    navigation.navigate('Store', {
      storeId: restaurant.id,
    });
  }, [navigation]);

  const handleFavoritePress = useCallback((restaurant: any) => {
    console.log('Favorite pressed:', restaurant);
    // Aqui você pode implementar a lógica de favoritos
  }, []);

  const handleSubCategoryPress = useCallback((subCategory: any) => {
    console.log('SubCategory pressed:', subCategory);
    // Aqui você pode filtrar por subcategoria
  }, []);

  const handleDishPress = useCallback((dish: any) => {
    console.log('Dish pressed:', dish);
    // Aqui você pode navegar para a tela do prato
  }, []);

  const handleBannerPress = useCallback((banner: any) => {
    console.log('Banner pressed:', banner);
    // Aqui você pode navegar para a promoção
  }, []);

  const handleSeeMorePress = useCallback(() => {
    console.log('See more pressed');
    // Aqui você pode navegar para ver mais itens
  }, []);

  const renderScreenItem = ({ item }: { item: ShelfItem }) => {
    switch (item.type) {
      case 'sub_category_carousel':
        return (
          <SubCategoryCarousel 
            data={item.data} 
            onSubCategoryPress={handleSubCategoryPress}
          />
        );

      case 'promo_banner_carousel':
        return (
          <ContentCarousel
            title="Promoções"
            data={item.data}
            renderCard={(banner) => (
              <PromoBannerCard 
                banner={banner} 
                onPress={handleBannerPress}
              />
            )}
            onSeeMorePress={handleSeeMorePress}
            showSeeMore={false}
          />
        );

      case 'discounted_dishes_carousel':
        return (
          <ContentCarousel
            title={item.title || 'Pratos com Desconto'}
            data={item.data}
            renderCard={(dish) => (
              <DiscountedDishCard 
                dish={dish} 
                onPress={handleDishPress}
              />
            )}
            onSeeMorePress={handleSeeMorePress}
          />
        );

      case 'sponsored_stores_carousel':
        return (
          <ContentCarousel
            title={item.title || 'Lojas Patrocinadas'}
            data={item.data}
            renderCard={(restaurant) => (
              <RestaurantCard 
                restaurant={restaurant} 
                onPress={handleRestaurantPress}
                onFavoritePress={handleFavoritePress}
              />
            )}
            onSeeMorePress={handleSeeMorePress}
          />
        );

      case 'section_title':
        return (
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitle}>{item.title}</Text>
          </View>
        );

      case 'store_list_item':
        return (
          <RestaurantListItem
            restaurant={item.data}
            onPressRestaurant={handleRestaurantPress}
            onToggleFavorite={handleFavoritePress}
          />
        );

      default:
        return null;
    }
  };

  const renderHeader = () => (
    <CategoryFilterCarousel
      categories={mockCategories}
      activeCategory={activeCategory}
      onCategoryPress={handleCategoryPress}
    />
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <CategoryHeader 
          categoryName={categoryName}
          onSearchChange={(text) => console.log('Search:', text)}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#EA1D2C" />
          <Text style={styles.loadingText}>Carregando lojas...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <CategoryHeader 
        categoryName={categoryName}
        onSearchChange={(text) => console.log('Search:', text)}
      />
      {stores.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Nenhuma loja encontrada nesta categoria</Text>
          <Text style={styles.emptySubtext}>Tente outra categoria ou volte mais tarde</Text>
        </View>
      ) : (
        <FlatList
          data={screenData}
          renderItem={renderScreenItem}
          keyExtractor={(item, index) => `${item.type}-${index}`}
          ListHeaderComponent={renderHeader}
          showsVerticalScrollIndicator={false}
          style={styles.flatList}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  flatList: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  sectionTitleContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
});

export default CategoryScreen;