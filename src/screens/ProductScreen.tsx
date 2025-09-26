import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  Alert,
} from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../contexts/CartContext';
import QuantityStepper from '../components/QuantityStepper';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const IMAGE_HEIGHT = SCREEN_HEIGHT * 0.4;

type ProductScreenRouteProp = RouteProp<{
  Product: {
    productId: string;
    product: any;
    store: any;
  };
}, 'Product'>;

const ProductScreen: React.FC = () => {
  const route = useRoute<ProductScreenRouteProp>();
  const navigation = useNavigation();
  const { addItem, setStore } = useCart();
  
  const { product, store } = route.params;
  
  const [quantity, setQuantity] = useState(1);
  const [observations, setObservations] = useState('');
  
  const maxObservations = 140;
  const unitPrice = parseFloat(product.price.replace('R$ ', '').replace(',', '.'));
  const totalPrice = unitPrice * quantity;

  const handleIncreaseQuantity = useCallback(() => {
    setQuantity(prev => Math.min(prev + 1, 99));
  }, []);

  const handleDecreaseQuantity = useCallback(() => {
    setQuantity(prev => Math.max(prev - 1, 1));
  }, []);

  const handleAddToCart = useCallback(() => {
    // Configurar a loja no contexto se ainda não estiver definida
    setStore({
      id: store.id,
      name: store.name,
      logo: store.logo,
      deliveryTime: store.deliveryTime,
      deliveryFee: parseFloat(store.deliveryFee.replace('R$ ', '').replace(',', '.')),
    });

    // Adicionar item ao carrinho
    addItem({
      id: `${product.id}-${Date.now()}`, // ID único para permitir mesmo produto com observações diferentes
      name: product.name,
      description: product.description,
      price: unitPrice,
      image: product.image,
      observations: observations.trim(),
      storeId: store.id,
      storeName: store.name,
      quantity,
    });

    Alert.alert(
      'Adicionado à sacola!',
      `${quantity}x ${product.name} foi adicionado à sua sacola.`,
      [
        {
          text: 'Continuar comprando',
          style: 'cancel',
          onPress: () => navigation.goBack(),
        },
        {
          text: 'Ver sacola',
          onPress: () => navigation.navigate('Cart' as never),
        },
      ]
    );
  }, [product, store, quantity, observations, addItem, setStore, navigation]);

  const formatPrice = (price: number) => {
    return `R$ ${price.toFixed(2).replace('.', ',')}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Imagem Principal com Header Flutuante */}
      <View style={styles.imageSection}>
        <Image source={{ uri: product.image }} style={styles.productImage} />
        
        {/* Botão de Voltar */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        
        {/* Card de Informações do Restaurante */}
        <View style={styles.storeInfoCard}>
          <Image source={{ uri: store.logo }} style={styles.storeLogo} />
          <View style={styles.storeDetails}>
            <Text style={styles.storeName}>{store.name}</Text>
            <View style={styles.storeMetrics}>
              <View style={styles.storeMetric}>
                <Ionicons name="time-outline" size={14} color="#666" />
                <Text style={styles.storeMetricText}>{store.deliveryTime}</Text>
              </View>
              <View style={styles.storeMetric}>
                <Ionicons name="bicycle-outline" size={14} color="#666" />
                <Text style={styles.storeMetricText}>{store.deliveryFee}</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Conteúdo Rolável */}
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Informações do Produto */}
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productDescription}>{product.description}</Text>
          
          {/* Informação Adicional */}
          <Text style={styles.servingInfo}>Serve até 1 pessoa</Text>
          
          {/* Preço */}
          <Text style={styles.productPrice}>{product.price}</Text>
        </View>

        {/* Campo de Observações */}
        <View style={styles.observationsSection}>
          <Text style={styles.observationsTitle}>💬 Alguma observação?</Text>
          <View style={styles.observationsInputContainer}>
            <TextInput
              style={styles.observationsInput}
              placeholder="Ex: tirar a cebola..."
              placeholderTextColor="#999"
              multiline
              maxLength={maxObservations}
              value={observations}
              onChangeText={setObservations}
              textAlignVertical="top"
            />
            <Text style={styles.characterCounter}>
              {observations.length}/{maxObservations}
            </Text>
          </View>
        </View>

        {/* Espaço para o rodapé fixo */}
        <View style={styles.footerSpacer} />
      </ScrollView>

      {/* Rodapé de Ações Fixo */}
      <View style={styles.stickyFooter}>
        <View style={styles.footerContent}>
          {/* Seletor de Quantidade */}
          <View style={styles.quantitySection}>
            <QuantityStepper
              quantity={quantity}
              onIncrease={handleIncreaseQuantity}
              onDecrease={handleDecreaseQuantity}
              size="large"
            />
          </View>
          
          {/* Botão de Adicionar */}
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddToCart}
            activeOpacity={0.8}
          >
            <Text style={styles.addButtonText}>
              Adicionar • {formatPrice(totalPrice)}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  imageSection: {
    height: IMAGE_HEIGHT,
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  storeInfoCard: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  storeLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  storeDetails: {
    flex: 1,
  },
  storeName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  storeMetrics: {
    flexDirection: 'row',
  },
  storeMetric: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  storeMetricText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  scrollContent: {
    flex: 1,
  },
  productInfo: {
    padding: 20,
  },
  productName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  productDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 12,
  },
  servingInfo: {
    fontSize: 14,
    color: '#999',
    marginBottom: 16,
  },
  productPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: '#EA1D2C',
  },
  observationsSection: {
    padding: 20,
    paddingTop: 0,
  },
  observationsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  observationsInputContainer: {
    position: 'relative',
  },
  observationsInput: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    minHeight: 80,
    maxHeight: 120,
  },
  characterCounter: {
    position: 'absolute',
    bottom: 8,
    right: 12,
    fontSize: 12,
    color: '#999',
  },
  footerSpacer: {
    height: 100,
  },
  stickyFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  footerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 20,
  },
  quantitySection: {
    marginRight: 16,
  },
  addButton: {
    flex: 1,
    backgroundColor: '#EA1D2C',
    borderRadius: 8,
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default ProductScreen;