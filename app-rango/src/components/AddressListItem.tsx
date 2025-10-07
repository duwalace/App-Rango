import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Address } from '../types/profile';

interface AddressListItemProps {
  address: Address;
  onPress: (address: Address) => void;
  onOptionsPress: (address: Address) => void;
}

const AddressListItem: React.FC<AddressListItemProps> = ({
  address,
  onPress,
  onOptionsPress,
}) => {
  // Mapear label para ícone
  const getIcon = (label: string): keyof typeof Ionicons.glyphMap => {
    switch (label) {
      case 'home':
        return 'home';
      case 'work':
        return 'briefcase';
      default:
        return 'location';
    }
  };

  // Mapear label para nome
  const getLabelName = (label: string): string => {
    switch (label) {
      case 'home':
        return 'Casa';
      case 'work':
        return 'Trabalho';
      default:
        return 'Outro';
    }
  };

  // Formatar endereço completo
  const formatFullAddress = (addr: Address): string => {
    const parts = [
      addr.street,
      addr.number,
      addr.complement,
      addr.neighborhood,
      addr.city,
      addr.state,
    ].filter(Boolean); // Remove valores vazios/undefined
    
    return parts.join(', ');
  };

  const icon = getIcon(address.label);
  const labelName = getLabelName(address.label);
  const fullAddress = formatFullAddress(address);
  const isSelected = address.isDefault;

  return (
    <TouchableOpacity 
      style={[styles.container, isSelected && styles.selectedContainer]} 
      onPress={() => onPress(address)}
    >
      <View style={styles.leftContent}>
        <Ionicons 
          name={icon} 
          size={24} 
          color={isSelected ? "#EA1D2C" : "#666"} 
          style={styles.addressIcon} 
        />
        <View style={styles.textContainer}>
          <Text style={[styles.addressName, isSelected && styles.selectedText]}>
            {labelName}
          </Text>
          <Text style={styles.fullAddress} numberOfLines={2}>
            {fullAddress}
          </Text>
        </View>
      </View>
      
      <View style={styles.rightContent}>
        {isSelected && (
          <Ionicons name="checkmark" size={20} color="#EA1D2C" style={styles.checkIcon} />
        )}
        <TouchableOpacity 
          style={styles.optionsButton}
          onPress={() => onOptionsPress(address)}
        >
          <Ionicons name="ellipsis-vertical" size={20} color="#999" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  selectedContainer: {
    borderLeftWidth: 4,
    borderLeftColor: '#EA1D2C',
    backgroundColor: '#FFF5F5',
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  addressIcon: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  addressName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  selectedText: {
    color: '#EA1D2C',
  },
  fullAddress: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  rightContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkIcon: {
    marginRight: 8,
  },
  optionsButton: {
    padding: 4,
  },
});

export default AddressListItem;