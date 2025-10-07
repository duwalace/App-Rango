import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { HomeStackParamList } from '../types/navigation';
import { Ionicons } from '@expo/vector-icons';

import CategoryGridCard from '../components/CategoryGridCard';
import StoreListItem from '../components/StoreListItem';
import MenuItemListCard from '../components/MenuItemListCard';
import {
  searchAll,
  SearchFilters,
  SearchResults,
} from '../services/searchService';
import { Store, MenuItem } from '../types/shared';

type SearchScreenNavigationProp = StackNavigationProp<HomeStackParamList>;

interface CategoryItem {
  id: string;
  name: string;
  color: string;
  subtitle?: string;
}

// Categorias de Conveniência
const CONVENIENCE_CATEGORIES: CategoryItem[] = [
  { id: 'mercado', name: 'Mercado', color: '#0A5847' },
  { id: 'farmacia', name: 'Farmácia', color: '#FF9F24', subtitle: '⚡ receba rápido' },
  { id: 'bebidas', name: 'Bebidas', color: '#FF7B52' },
  { id: 'atacado', name: 'Atacado', color: '#E21B5A' },
  { id: 'ofertas', name: 'Ofertas', color: '#D81F3D', subtitle: 'MÊS DO CLIENTE' },
  { id: 'shopping', name: 'Shopping', color: '#F5A3D0' },
];

// Categorias de Restaurantes
const RESTAURANT_CATEGORIES: CategoryItem[] = [
  { id: 'super', name: 'Super Restaurantes', color: '#B91E3C', subtitle: '⭐' },
  { id: 'gourmet', name: 'Gourmet', color: '#1A1A1A' },
  { id: 'brasileira', name: 'Brasileira', color: '#E67E22' },
  { id: 'saudavel', name: 'Saudável', color: '#F5A3C7' },
  { id: 'marmita', name: 'Marmita', color: '#D68910' },
  { id: 'congelados', name: 'Congelados', color: '#F5A3D0' },
  { id: 'lanches', name: 'Lanches', color: '#FF8C52' },
  { id: 'chinesa', name: 'Chinesa', color: '#E21B5A' },
  { id: 'carnes', name: 'Carnes', color: '#FF7B52' },
  { id: 'crepes', name: 'Crepes e Panquecas', color: '#E21B5A' },
];

const SearchScreen: React.FC = () => {
  const navigation = useNavigation<SearchScreenNavigationProp>();

  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResults>({ stores: [], items: [] });
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();

  // Debounce para busca
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchText.trim().length >= 2) {
        performSearch();
      } else {
        setResults({ stores: [], items: [] });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchText]);

  const performSearch = async () => {
    try {
      setLoading(true);
      const searchResults = await searchAll(searchText, { category: selectedCategory });
      setResults(searchResults);
    } catch (error) {
      console.error('Erro na busca:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryPress = (categoryId: string) => {
    // Navegar para tela de categoria com os resultados filtrados
    navigation.navigate('Category', { categoryId, categoryName: categoryId });
  };

  const handleStorePress = (store: Store) => {
    navigation.navigate('Store', { storeId: store.id });
  };

  const handleMenuItemPress = (item: MenuItem) => {
    navigation.navigate('Product', {
      productId: item.id,
      product: item,
      store: { id: item.storeId },
    });
  };

  const renderSearchBar = () => (
    <View style={styles.searchBarContainer}>
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="O que vai pedir hoje?"
          placeholderTextColor="#999"
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>
    </View>
  );

  const renderSearchResults = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#EA1D2C" />
          <Text style={styles.loadingText}>Buscando...</Text>
        </View>
      );
    }

    const hasResults = results.stores.length > 0 || results.items.length > 0;

    if (searchText.trim().length >= 2 && !hasResults) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={64} color="#CCC" />
          <Text style={styles.emptyTitle}>Nenhum resultado encontrado</Text>
          <Text style={styles.emptySubtitle}>
            Tente buscar por outro termo
          </Text>
        </View>
      );
    }

    return (
      <ScrollView style={styles.resultsContainer} showsVerticalScrollIndicator={false}>
        {results.stores.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Restaurantes ({results.stores.length})
            </Text>
            {results.stores.map((store) => (
              <StoreListItem
                key={store.id}
                store={store}
                onPress={() => handleStorePress(store)}
              />
            ))}
          </View>
        )}

        {results.items.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pratos ({results.items.length})</Text>
            {results.items.map((item) => (
              <MenuItemListCard
                key={item.id}
                item={item}
                onPress={() => handleMenuItemPress(item)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    );
  };

  const renderCategoriesGrid = () => (
    <ScrollView 
      style={styles.contentContainer} 
      showsVerticalScrollIndicator={false}
    >
      {/* Seção Conveniência */}
      <View style={styles.categorySection}>
        <Text style={styles.sectionTitle}>Conveniência</Text>
        <View style={styles.gridContainer}>
          {CONVENIENCE_CATEGORIES.map((category) => (
            <CategoryGridCard
              key={category.id}
              title={category.name}
              subtitle={category.subtitle}
              backgroundColor={category.color}
              onPress={() => handleCategoryPress(category.id)}
            />
          ))}
        </View>
      </View>

      {/* Seção Restaurantes */}
      <View style={styles.categorySection}>
        <Text style={styles.sectionTitle}>Restaurantes</Text>
        <View style={styles.gridContainer}>
          {RESTAURANT_CATEGORIES.map((category) => (
            <CategoryGridCard
              key={category.id}
              title={category.name}
              subtitle={category.subtitle}
              backgroundColor={category.color}
              onPress={() => handleCategoryPress(category.id)}
            />
          ))}
        </View>
      </View>

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );

  const showResults = searchText.trim().length >= 2;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {renderSearchBar()}
      {showResults ? renderSearchResults() : renderCategoriesGrid()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  searchBarContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  categorySection: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  bottomSpacing: {
    height: 40,
  },
  resultsContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: '#F5F5F5',
  },
  section: {
    marginBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default SearchScreen;