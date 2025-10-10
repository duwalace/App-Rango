import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { HomeStackParamList } from '../types/navigation';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../contexts/AuthContext';
import { getFavoriteStores, toggleFavorite } from '../services/favoriteService';
import { Store } from '../types/shared';
import RestaurantCard from '../components/RestaurantCard';

type FavoritesScreenNavigationProp = StackNavigationProp<HomeStackParamList>;

const FavoritesScreen: React.FC = () => {
  const navigation = useNavigation<FavoritesScreenNavigationProp>();
  const { usuarioLogado: user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<Store[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadFavorites();
  }, [user]);

  const loadFavorites = async () => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const stores = await getFavoriteStores(user.uid);
      setFavorites(stores);
    } catch (error) {
      console.error('Erro ao carregar favoritos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadFavorites();
    setRefreshing(false);
  };

  const handleStorePress = (store: Store) => {
    navigation.navigate('Store', { storeId: store.id });
  };

  const handleToggleFavorite = async (storeId: string) => {
    if (!user?.uid) return;

    try {
      await toggleFavorite(user.uid, storeId);
      // Atualizar lista local
      setFavorites((prev) => prev.filter((store) => store.id !== storeId));
    } catch (error) {
      console.error('Erro ao remover favorito:', error);
    }
  };

  const renderStore = ({ item }: { item: Store }) => (
    <RestaurantCard
      restaurant={{
        id: item.id,
        name: item.name,
        image: item.coverImage || item.logo,
        logo: item.logo,
        rating: item.rating || 0,
        deliveryTime: item.delivery?.deliveryTime || '30-40 min',
        deliveryFee: `R$ ${(item.delivery?.deliveryFee || 0).toFixed(2)}`,
        isFavorite: true, // Sempre true nesta tela
      }}
      onPress={() => handleStorePress(item)}
      onFavoritePress={() => handleToggleFavorite(item.id)}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="heart-outline" size={80} color="#CCC" />
      <Text style={styles.emptyTitle}>Nenhum favorito ainda</Text>
      <Text style={styles.emptySubtitle}>
        Adicione suas lojas favoritas para acessá-las rapidamente
      </Text>
      <TouchableOpacity
        style={styles.exploreButton}
        onPress={() => navigation.navigate('HomeMain')}
        activeOpacity={0.8}
      >
        <Text style={styles.exploreButtonText}>Explorar Lojas</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Favoritos</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#EA1D2C" />
          <Text style={styles.loadingText}>Carregando favoritos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Favoritos</Text>
        {favorites.length > 0 && (
          <Text style={styles.headerSubtitle}>
            {favorites.length} {favorites.length === 1 ? 'loja' : 'lojas'}
          </Text>
        )}
      </View>

      {/* Lista */}
      <FlatList
        data={favorites}
        renderItem={renderStore}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
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
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
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
    lineHeight: 20,
  },
  exploreButton: {
    backgroundColor: '#EA1D2C',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 24,
  },
  exploreButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FavoritesScreen;

