import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Address } from '../types/profile';

interface AddressSelectionCardProps {
  address: Address;
  isSelected: boolean;
  onPress: () => void;
}

const AddressSelectionCard: React.FC<AddressSelectionCardProps> = ({
  address,
  isSelected,
  onPress,
}) => {
  const getIconName = (label: string): keyof typeof Ionicons.glyphMap => {
    switch (label.toLowerCase()) {
      case 'home':
      case 'casa':
        return 'home';
      case 'work':
      case 'trabalho':
        return 'briefcase';
      default:
        return 'location';
    }
  };

  const getLabelName = (label: string): string => {
    switch (label.toLowerCase()) {
      case 'home':
      case 'casa':
        return 'Casa';
      case 'work':
      case 'trabalho':
        return 'Trabalho';
      default:
        return 'Outro';
    }
  };

  return (
    <TouchableOpacity
      style={[styles.card, isSelected && styles.cardSelected]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.cardContent}>
        {/* Ícone do tipo de endereço */}
        <View style={[styles.iconContainer, isSelected && styles.iconContainerSelected]}>
          <Ionicons
            name={getIconName(address.label)}
            size={24}
            color={isSelected ? '#EA1D2C' : '#666'}
          />
        </View>

        {/* Informações do endereço */}
        <View style={styles.addressInfo}>
          <View style={styles.labelRow}>
            <Text style={[styles.label, isSelected && styles.labelSelected]}>
              {getLabelName(address.label)}
            </Text>
            {address.isDefault && (
              <View style={styles.defaultBadge}>
                <Text style={styles.defaultBadgeText}>Padrão</Text>
              </View>
            )}
          </View>
          <Text style={styles.addressText}>
            {address.street}, {address.number}
            {address.complement ? ` - ${address.complement}` : ''}
          </Text>
          <Text style={styles.addressSecondary}>
            {address.neighborhood} - {address.city}/{address.state}
          </Text>
          <Text style={styles.addressCEP}>CEP: {address.zipCode}</Text>
        </View>

        {/* Indicador de seleção */}
        <View style={styles.checkContainer}>
          {isSelected ? (
            <View style={styles.checkCircleSelected}>
              <Ionicons name="checkmark" size={20} color="#FFF" />
            </View>
          ) : (
            <View style={styles.checkCircle} />
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
  cardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconContainerSelected: {
    backgroundColor: '#FFE5E5',
  },
  addressInfo: {
    flex: 1,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  labelSelected: {
    color: '#EA1D2C',
  },
  defaultBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  defaultBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  addressText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 2,
  },
  addressSecondary: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  addressCEP: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
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
  checkCircleSelected: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EA1D2C',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AddressSelectionCard;

