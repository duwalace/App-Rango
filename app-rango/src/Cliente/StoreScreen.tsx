import React, { useRef, useState, useCallback, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Animated, SafeAreaView, ActivityIndicator } from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { HomeStackParamList } from '../types/navigation';

// Componentes
import StoreHeader from '../components/StoreHeader';
import HighlightDishCard from '../components/HighlightDishCard';
import MenuSectionHeader from '../components/MenuSectionHeader';
import MenuItemCard from '../components/MenuItemCard';

// Serviços
import { 
  subscribeToStoreCategories, 
  subscribeToStoreMenuItems, 
  getPopularItems,
  formatPrice,
  MenuCategory,
  MenuItem 
} from '../services/menuService';

// Dados mock para fallback
import { mockStore } from '../data/storeData';

type StoreScreenRouteProp = RouteProp<{
  Store: { storeId: string };
}, 'Store'>;

interface MenuSection {
  title: string;
  data: any[];
}

type StoreScreenNavigationProp = StackNavigationProp<HomeStackParamList>;

const StoreScreen: React.FC = () => {
  const route = useRoute<StoreScreenRouteProp>();
  const navigation = useNavigation<StoreScreenNavigationProp>();
  const { storeId } = route.params || { storeId: 'loja-pizzaria-do-joao' }; // ID padrão da pizzaria
  
  // Animated Value para controlar as animações
  const scrollY = useRef(new Animated.Value(0)).current;
  
  // Estados
  const [store, setStore] = useState(mockStore);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [highlightDishes, setHighlightDishes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [menuSections, setMenuSections] = useState<MenuSection[]>([]);

  // Carregar dados do Firestore
  useEffect(() => {
    console.log('🔵 StoreScreen: Carregando dados da loja:', storeId);
    setLoading(true);

    // Inscrever-se nas categorias
    const unsubscribeCategories = subscribeToStoreCategories(storeId, (categoriesData) => {
      console.log('✅ StoreScreen: Categorias recebidas:', categoriesData.length);
      setCategories(categoriesData);
    });

    // Inscrever-se nos itens do menu
    const unsubscribeItems = subscribeToStoreMenuItems(storeId, (itemsData) => {
      console.log('✅ StoreScreen: Itens recebidos:', itemsData.length);
      setMenuItems(itemsData);
      setLoading(false);
    });

    // Buscar itens populares para destaques
    getPopularItems(storeId).then((popularItems) => {
      console.log('✅ StoreScreen: Itens populares:', popularItems.length);
      // Converter para formato do HighlightDishCard
      const highlights = popularItems.map(item => ({
        id: item.id,
        name: item.name,
        image: item.image,
        price: formatPrice(item.price),
        isBestSeller: item.isPopular,
      }));
      setHighlightDishes(highlights);
    }).catch(error => {
      console.error('❌ Erro ao buscar itens populares:', error);
    });

    return () => {
      console.log('🔴 StoreScreen: Cancelando inscrições');
      unsubscribeCategories();
      unsubscribeItems();
    };
  }, [storeId]);

  // Organizar itens por categoria
  useEffect(() => {
    if (categories.length > 0 && menuItems.length > 0) {
      console.log('🔵 Organizando menu por categorias...');
      
      const sections: MenuSection[] = categories.map(category => {
        const categoryItems = menuItems
          .filter(item => item.categoryId === category.id)
          .map(item => ({
            id: item.id,
            name: item.name,
            description: item.description,
            price: formatPrice(item.price),
            image: item.image,
            isPromotion: false,
            isSpicy: false,
            isVegetarian: false,
          }));

        return {
          title: category.name,
          data: categoryItems,
        };
      }).filter(section => section.data.length > 0); // Remover categorias vazias

      console.log('✅ Seções organizadas:', sections.length);
      setMenuSections(sections);
    }
  }, [categories, menuItems]);

  // Handlers
  const handleFavoritePress = useCallback(() => {
    setStore(prev => ({ ...prev, isFavorite: !prev.isFavorite }));
  }, []);

  const handleSearchPress = useCallback(() => {
    console.log('Search pressed');
    // Implementar busca na loja
  }, []);

  const handleHighlightDishPress = useCallback((dish: any) => {
    console.log('Highlight dish pressed:', dish);
    // Navegar para detalhes do prato
  }, []);

  const handleMenuItemPress = useCallback((item: any) => {
    console.log('Menu item pressed:', item);
    // Navegar para detalhes do prato
    navigation.navigate('Product', {
      productId: item.id,
      product: item,
      store: store,
    });
  }, [navigation, store]);

  // Componente do carrossel de destaques
  const renderHighlightsSection = () => (
    <View style={styles.highlightsSection}>
      <Text style={styles.sectionTitle}>Destaques</Text>
      <FlatList
        data={highlightDishes}
        renderItem={({ item }) => (
          <HighlightDishCard 
            dish={item} 
            onPress={handleHighlightDishPress}
          />
        )}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.highlightsContainer}
      />
    </View>
  );

  // Header da lista (tudo que vem antes do cardápio)
  const renderListHeader = () => (
    <View>
      <StoreHeader
        store={store}
        animatedValue={scrollY}
        onFavoritePress={handleFavoritePress}
        onSearchPress={handleSearchPress}
      />
      {renderHighlightsSection()}
    </View>
  );

  // Renderizar item do cardápio
  const renderMenuItem = ({ item }: { item: any }) => (
    <MenuItemCard 
      item={item} 
      onPress={handleMenuItemPress}
    />
  );

  // Renderizar cabeçalho de seção
  const renderSectionHeader = ({ section }: { section: MenuSection }) => (
    <MenuSectionHeader 
      title={section.title}
      itemCount={section.data.length}
    />
  );

  // Mostrar loading enquanto carrega
  if (loading && menuSections.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#EA1D2C" />
          <Text style={styles.loadingText}>Carregando cardápio...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Mostrar mensagem se não houver itens
  if (!loading && menuSections.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <StoreHeader
          store={store}
          animatedValue={scrollY}
          onFavoritePress={handleFavoritePress}
          onSearchPress={handleSearchPress}
        />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Nenhum item no cardápio ainda.</Text>
          <Text style={styles.emptySubtext}>O restaurante ainda está adicionando produtos.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Animated.SectionList
        sections={menuSections}
        renderItem={renderMenuItem}
        renderSectionHeader={renderSectionHeader}
        ListHeaderComponent={renderListHeader}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={true}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        style={styles.sectionList}
        contentContainerStyle={styles.contentContainer}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  sectionList: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  highlightsSection: {
    backgroundColor: 'white',
    paddingVertical: 20,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  highlightsContainer: {
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    paddingHorizontal: 40,
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
});

export default StoreScreen;