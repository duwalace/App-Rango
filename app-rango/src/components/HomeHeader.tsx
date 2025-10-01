import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface HomeHeaderProps {
  address: string;
  onAddressPress: () => void;
}

const HomeHeader: React.FC<HomeHeaderProps> = ({ address, onAddressPress }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.addressContainer} onPress={onAddressPress}>
        <Text style={styles.addressText} numberOfLines={1}>
          {address}
        </Text>
        <Ionicons name="chevron-down" size={16} color="#333" style={styles.arrowIcon} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: '80%',
  },
  addressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginRight: 4,
  },
  arrowIcon: {
    marginLeft: 4,
  },
});

export default HomeHeader;