import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AddressData {
  id: string;
  name: string;
  fullAddress: string;
  icon: keyof typeof Ionicons.glyphMap;
  isSelected?: boolean;
}

interface AddressListItemProps {
  address: AddressData;
  onPress: (address: AddressData) => void;
  onOptionsPress: (address: AddressData) => void;
}

const AddressListItem: React.FC<AddressListItemProps> = ({
  address,
  onPress,
  onOptionsPress,
}) => {
  return (
    <TouchableOpacity 
      style={[styles.container, address.isSelected && styles.selectedContainer]} 
      onPress={() => onPress(address)}
    >
      <View style={styles.leftContent}>
        <Ionicons 
          name={address.icon} 
          size={24} 
          color={address.isSelected ? "#EA1D2C" : "#666"} 
          style={styles.addressIcon} 
        />
        <View style={styles.textContainer}>
          <Text style={[styles.addressName, address.isSelected && styles.selectedText]}>
            {address.name}
          </Text>
          <Text style={styles.fullAddress} numberOfLines={2}>
            {address.fullAddress}
          </Text>
        </View>
      </View>
      
      <View style={styles.rightContent}>
        {address.isSelected && (
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