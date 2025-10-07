import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Store } from '../types/shared';

interface StoreListItemProps {
  store: Store;
  onPress: () => void;
}

const StoreListItem: React.FC<StoreListItemProps> = ({ store, onPress }) => {
  const formatPrice = (price: number) => {
    return `R$ ${price.toFixed(2).replace('.', ',')}`;
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      {/* Imagem da Loja */}
      <Image
        source={{ uri: store.logo || store.coverImage }}
        style={styles.image}
        resizeMode="cover"
      />

      {/* Informações */}
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          {store.name}
        </Text>
        
        <Text style={styles.description} numberOfLines={1}>
          {store.description || store.category}
        </Text>

        <View style={styles.details}>
          {/* Avaliação */}
          {store.rating && store.rating > 0 && (
            <View style={styles.detailItem}>
              <Ionicons name="star" size={14} color="#FFB800" />
              <Text style={styles.detailText}>
                {store.rating.toFixed(1)}
              </Text>
            </View>
          )}

          {/* Tempo de Entrega */}
          <View style={styles.detailItem}>
            <Ionicons name="time-outline" size={14} color="#666" />
            <Text style={styles.detailText}>
              {store.delivery?.deliveryTime || '30-40 min'}
            </Text>
          </View>

          {/* Taxa de Entrega */}
          <View style={styles.detailItem}>
            {store.delivery?.deliveryFee === 0 ? (
              <Text style={[styles.detailText, styles.freeDelivery]}>
                Entrega Grátis
              </Text>
            ) : (
              <>
                <Ionicons name="bicycle-outline" size={14} color="#666" />
                <Text style={styles.detailText}>
                  {formatPrice(store.delivery?.deliveryFee || 0)}
                </Text>
              </>
            )}
          </View>
        </View>

        {/* Categoria */}
        {store.category && (
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{store.category}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  image: {
    width: 100,
    height: 100,
    backgroundColor: '#F0F0F0',
  },
  content: {
    flex: 1,
    padding: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  details: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    color: '#666',
  },
  freeDelivery: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666',
  },
});

export default StoreListItem;

