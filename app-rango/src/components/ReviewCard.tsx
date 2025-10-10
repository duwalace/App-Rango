import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import RatingStars from './RatingStars';
import { Review } from '../services/reviewService';

interface ReviewCardProps {
  review: Review;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
  const formatDate = (date: Date | any) => {
    // Converter Timestamp do Firebase para Date se necessário
    const d = date?.toDate ? date.toDate() : (date instanceof Date ? date : new Date(date));
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={16} color="#666" />
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{review.customerName}</Text>
            <Text style={styles.date}>{formatDate(review.createdAt)}</Text>
          </View>
        </View>
        <RatingStars rating={review.rating} size={14} />
      </View>

      {/* Comentário */}
      <Text style={styles.comment} numberOfLines={3}>
        {review.comment}
      </Text>

      {/* Resposta do Restaurante */}
      {review.response && (
        <View style={styles.responseContainer}>
          <View style={styles.responseHeader}>
            <Ionicons name="storefront" size={14} color="#EA1D2C" />
            <Text style={styles.responseTitle}>Resposta do restaurante</Text>
          </View>
          <Text style={styles.responseText} numberOfLines={2}>
            {review.response}
          </Text>
        </View>
      )}

      {/* Útil */}
      {review.helpful > 0 && (
        <View style={styles.helpfulContainer}>
          <Ionicons name="thumbs-up" size={12} color="#666" />
          <Text style={styles.helpfulText}>
            {review.helpful} {review.helpful === 1 ? 'pessoa achou' : 'pessoas acharam'} útil
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginRight: 12,
    width: 280,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  date: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
  comment: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    marginBottom: 8,
  },
  responseContainer: {
    backgroundColor: '#FFF8F8',
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
    borderLeftWidth: 2,
    borderLeftColor: '#EA1D2C',
  },
  responseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  responseTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#EA1D2C',
  },
  responseText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  helpfulContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  helpfulText: {
    fontSize: 11,
    color: '#666',
  },
});

export default ReviewCard;

