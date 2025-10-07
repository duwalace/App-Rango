import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { getOrderById } from '../services/orderService';
import { createReview, getReviewByOrderId } from '../services/reviewService';
import { Order } from '../types/shared';
import RatingStars from '../components/RatingStars';

const ReviewScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { usuarioLogado: user } = useAuth();

  const { orderId } = route.params;

  const [order, setOrder] = useState<Order | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);

  useEffect(() => {
    loadOrderAndCheckReview();
  }, [orderId]);

  const loadOrderAndCheckReview = async () => {
    try {
      setLoading(true);

      // Carregar pedido
      const orderData = await getOrderById(orderId);
      if (!orderData) {
        Alert.alert('Erro', 'Pedido não encontrado');
        navigation.goBack();
        return;
      }
      setOrder(orderData);

      // Verificar se já foi avaliado
      const existingReview = await getReviewByOrderId(orderId);
      if (existingReview) {
        setAlreadyReviewed(true);
        setRating(existingReview.rating);
        setComment(existingReview.comment);
      }
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Não foi possível carregar o pedido');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Atenção', 'Por favor, selecione uma nota de 1 a 5 estrelas');
      return;
    }

    if (!comment || comment.trim().length < 10) {
      Alert.alert('Atenção', 'O comentário deve ter pelo menos 10 caracteres');
      return;
    }

    if (!user || !order) {
      Alert.alert('Erro', 'Dados inválidos');
      return;
    }

    try {
      setSubmitting(true);

      await createReview({
        orderId: order.id,
        storeId: order.storeId,
        customerId: user.uid,
        customerName: user.nome || 'Cliente',
        rating,
        comment: comment.trim(),
      });

      Alert.alert(
        'Obrigado!',
        'Sua avaliação foi enviada com sucesso',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Não foi possível enviar a avaliação');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Avaliar Pedido</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#EA1D2C" />
          <Text style={styles.loadingText}>Carregando...</Text>
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
        <Text style={styles.headerTitle}>Avaliar Pedido</Text>
      </View>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Informações do Pedido */}
        {order && (
          <View style={styles.section}>
            <View style={styles.orderCard}>
              <Text style={styles.storeName}>{order.storeName}</Text>
              <Text style={styles.orderInfo}>
                Pedido #{order.id.slice(-6).toUpperCase()}
              </Text>
            </View>
          </View>
        )}

        {/* Avaliação */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Como foi seu pedido?</Text>
          <Text style={styles.sectionSubtitle}>
            {alreadyReviewed
              ? 'Você já avaliou este pedido'
              : 'Toque nas estrelas para avaliar'}
          </Text>

          <View style={styles.ratingContainer}>
            <RatingStars
              rating={rating}
              size={40}
              editable={!alreadyReviewed}
              onRatingChange={setRating}
            />
          </View>

          {rating > 0 && (
            <Text style={styles.ratingLabel}>
              {rating === 1 && '⭐ Péssimo'}
              {rating === 2 && '⭐⭐ Ruim'}
              {rating === 3 && '⭐⭐⭐ Regular'}
              {rating === 4 && '⭐⭐⭐⭐ Bom'}
              {rating === 5 && '⭐⭐⭐⭐⭐ Excelente'}
            </Text>
          )}
        </View>

        {/* Comentário */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Conte como foi sua experiência</Text>
          <TextInput
            style={[
              styles.commentInput,
              alreadyReviewed && styles.commentInputDisabled,
            ]}
            placeholder="Compartilhe sua opinião sobre o pedido..."
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            maxLength={500}
            editable={!alreadyReviewed}
          />
          <Text style={styles.characterCount}>
            {comment.length}/500 caracteres
          </Text>
        </View>

        {/* Dicas */}
        <View style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>💡 Dicas para uma boa avaliação:</Text>
          <Text style={styles.tipText}>• Comente sobre a qualidade da comida</Text>
          <Text style={styles.tipText}>• Fale sobre o tempo de entrega</Text>
          <Text style={styles.tipText}>• Mencione o atendimento</Text>
          <Text style={styles.tipText}>• Seja honesto e construtivo</Text>
        </View>

        <View style={styles.spacer} />
      </ScrollView>

      {/* Botão de Enviar */}
      {!alreadyReviewed && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
            activeOpacity={0.8}
          >
            {submitting ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color="#FFF" />
                <Text style={styles.submitButtonText}>Enviar Avaliação</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
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
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  scrollContent: {
    flex: 1,
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  orderCard: {
    backgroundColor: '#F8F8F8',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  storeName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  orderInfo: {
    fontSize: 14,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  ratingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EA1D2C',
    textAlign: 'center',
    marginTop: 12,
  },
  commentInput: {
    backgroundColor: '#F8F8F8',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: '#333',
    minHeight: 150,
  },
  commentInputDisabled: {
    backgroundColor: '#F0F0F0',
    color: '#999',
  },
  characterCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 8,
  },
  tipsSection: {
    backgroundColor: '#FFF8E1',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
  },
  tipsTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 24,
  },
  spacer: {
    height: 100,
  },
  footer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  submitButton: {
    backgroundColor: '#EA1D2C',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#CCC',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
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
});

export default ReviewScreen;

