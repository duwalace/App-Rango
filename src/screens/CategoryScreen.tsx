import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView } from 'react-native';
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
  const [screenData, setScreenData] = useState<ShelfItem[]>(getCategoryScreenData(categoryId));

  const handleCategoryPress = useCallback((newCategoryId: string) => {
    setActiveCategory(newCategoryId);
    setScreenData(getCategoryScreenData(newCategoryId));
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

  return (
    <SafeAreaView style={styles.container}>
      <CategoryHeader 
        categoryName={categoryName}
        onSearchChange={(text) => console.log('Search:', text)}
      />
      <FlatList
        data={screenData}
        renderItem={renderScreenItem}
        keyExtractor={(item, index) => `${item.type}-${index}`}
        ListHeaderComponent={renderHeader}
        showsVerticalScrollIndicator={false}
        style={styles.flatList}
      />
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