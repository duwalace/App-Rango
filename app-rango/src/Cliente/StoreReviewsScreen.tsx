import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getStoreReviews, getReviewStats, Review } from '../services/reviewService';
import RatingStars from '../components/RatingStars';

const StoreReviewsScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();

  const { storeId, storeName } = route.params;

  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReviews();
  }, [storeId]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const [reviewsData, statsData] = await Promise.all([
        getStoreReviews(storeId),
        getReviewStats(storeId),
      ]);

      setReviews(reviewsData);
      setStats(statsData);
    } catch (error) {
      console.error('Erro ao carregar avaliações:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const renderReviewCard = ({ item }: { item: Review }) => (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View style={styles.reviewerInfo}>
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person" size={20} color="#666" />
          </View>
          <View style={styles.reviewerDetails}>
            <Text style={styles.reviewerName}>{item.customerName}</Text>
            <Text style={styles.reviewDate}>{formatDate(item.createdAt)}</Text>
          </View>
        </View>
        <RatingStars rating={item.rating} size={16} />
      </View>

      <Text style={styles.reviewComment}>{item.comment}</Text>

      {item.response && (
        <View style={styles.responseContainer}>
          <View style={styles.responseHeader}>
            <Ionicons name="storefront" size={16} color="#EA1D2C" />
            <Text style={styles.responseTitle}>Resposta do restaurante</Text>
          </View>
          <Text style={styles.responseText}>{item.response}</Text>
        </View>
      )}

      {item.helpful > 0 && (
        <View style={styles.helpfulContainer}>
          <Ionicons name="thumbs-up" size={14} color="#666" />
          <Text style={styles.helpfulText}>
            {item.helpful} {item.helpful === 1 ? 'pessoa achou' : 'pessoas acharam'} útil
          </Text>
        </View>
      )}
    </View>
  );

  const renderDistributionBar = (stars: number, count: number, total: number) => {
    const percentage = total > 0 ? (count / total) * 100 : 0;

    return (
      <View key={stars} style={styles.distributionRow}>
        <Text style={styles.distributionStars}>{stars}★</Text>
        <View style={styles.distributionBarContainer}>
          <View style={[styles.distributionBarFill, { width: `${percentage}%` }]} />
        </View>
        <Text style={styles.distributionCount}>{count}</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Avaliações</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#EA1D2C" />
          <Text style={styles.loadingText}>Carregando avaliações...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {storeName}
        </Text>
      </View>

      <FlatList
        data={reviews}
        renderItem={renderReviewCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            {/* Resumo de Avaliações */}
            {stats && stats.count > 0 && (
              <View style={styles.summaryCard}>
                <View style={styles.summaryMain}>
                  <Text style={styles.averageRating}>{stats.average.toFixed(1)}</Text>
                  <RatingStars rating={stats.average} size={20} />
                  <Text style={styles.reviewCount}>
                    Baseado em {stats.count}{' '}
                    {stats.count === 1 ? 'avaliação' : 'avaliações'}
                  </Text>
                </View>

                <View style={styles.distributionContainer}>
                  {[5, 4, 3, 2, 1].map((stars) =>
                    renderDistributionBar(
                      stars,
                      stats.distribution[stars],
                      stats.count
                    )
                  )}
                </View>
              </View>
            )}

            {/* Título da Lista */}
            {reviews.length > 0 && (
              <Text style={styles.listTitle}>
                Todas as Avaliações ({reviews.length})
              </Text>
            )}
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="star-outline" size={64} color="#CCC" />
            <Text style={styles.emptyTitle}>Nenhuma avaliação ainda</Text>
            <Text style={styles.emptySubtitle}>
              Seja o primeiro a avaliar este restaurante
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 4,
    marginRight: 12,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  listContent: {
    paddingBottom: 20,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 8,
  },
  summaryMain: {
    alignItems: 'center',
    marginBottom: 24,
  },
  averageRating: {
    fontSize: 48,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  reviewCount: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  distributionContainer: {
    gap: 8,
  },
  distributionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  distributionStars: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    width: 30,
  },
  distributionBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  distributionBarFill: {
    height: '100%',
    backgroundColor: '#FFB800',
    borderRadius: 4,
  },
  distributionCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    width: 30,
    textAlign: 'right',
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
  },
  reviewCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 8,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  reviewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  reviewerDetails: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  reviewDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  reviewComment: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  responseContainer: {
    backgroundColor: '#FFF8F8',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#EA1D2C',
  },
  responseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  responseTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#EA1D2C',
  },
  responseText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  helpfulContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  helpfulText: {
    fontSize: 12,
    color: '#666',
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
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default StoreReviewsScreen;

