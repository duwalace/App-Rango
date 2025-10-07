import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PaymentMethodCardProps {
  method: {
    id: string;
    name: string;
    icon: keyof typeof Ionicons.glyphMap;
    description: string;
    available: boolean;
  };
  isSelected: boolean;
  onPress: () => void;
}

const PaymentMethodCard: React.FC<PaymentMethodCardProps> = ({
  method,
  isSelected,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.card,
        isSelected && styles.cardSelected,
        !method.available && styles.cardDisabled,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!method.available}
    >
      <View style={styles.cardContent}>
        {/* Ícone do método */}
        <View style={[styles.iconContainer, isSelected && styles.iconContainerSelected]}>
          <Ionicons
            name={method.icon}
            size={28}
            color={isSelected ? '#EA1D2C' : method.available ? '#666' : '#CCC'}
          />
        </View>

        {/* Informações do método */}
        <View style={styles.methodInfo}>
          <View style={styles.nameRow}>
            <Text
              style={[
                styles.name,
                isSelected && styles.nameSelected,
                !method.available && styles.nameDisabled,
              ]}
            >
              {method.name}
            </Text>
            {!method.available && (
              <View style={styles.comingSoonBadge}>
                <Text style={styles.comingSoonText}>Em breve</Text>
              </View>
            )}
          </View>
          <Text style={styles.description}>{method.description}</Text>
        </View>

        {/* Indicador de seleção */}
        <View style={styles.checkContainer}>
          {isSelected ? (
            <View style={styles.checkCircleSelected}>
              <Ionicons name="checkmark" size={18} color="#FFF" />
            </View>
          ) : (
            <View
              style={[
                styles.checkCircle,
                !method.available && styles.checkCircleDisabled,
              ]}
            />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardSelected: {
    borderColor: '#EA1D2C',
    backgroundColor: '#FFF8F8',
  },
  cardDisabled: {
    opacity: 0.6,
    backgroundColor: '#F9F9F9',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconContainerSelected: {
    backgroundColor: '#FFE5E5',
  },
  methodInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  nameSelected: {
    color: '#EA1D2C',
  },
  nameDisabled: {
    color: '#999',
  },
  comingSoonBadge: {
    backgroundColor: '#FFB800',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  comingSoonText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  description: {
    fontSize: 13,
    color: '#666',
  },
  checkContainer: {
    marginLeft: 8,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#CCC',
  },
  checkCircleDisabled: {
    borderColor: '#E0E0E0',
  },
  checkCircleSelected: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EA1D2C',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PaymentMethodCard;

