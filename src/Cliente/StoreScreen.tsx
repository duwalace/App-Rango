import React, { useRef, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Animated, SafeAreaView } from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { HomeStackParamList } from '../types/navigation';

// Componentes
import StoreHeader from '../components/StoreHeader';
import HighlightDishCard from '../components/HighlightDishCard';
import MenuSectionHeader from '../components/MenuSectionHeader';
import MenuItemCard from '../components/MenuItemCard';

// Dados
import { mockStore, mockHighlightDishes, mockMenuSections } from '../data/storeData';

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
  const { storeId } = route.params || { storeId: '1' };
  
  // Animated Value para controlar as animações
  const scrollY = useRef(new Animated.Value(0)).current;
  
  // Estado da loja (normalmente viria de uma API)
  const [store, setStore] = useState(mockStore);
  const [highlightDishes] = useState(mockHighlightDishes);
  const [menuSections] = useState(mockMenuSections);

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
});

export default StoreScreen;