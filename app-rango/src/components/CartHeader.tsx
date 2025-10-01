import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CartHeaderProps {
  onDismiss: () => void;
  onClear: () => void;
  itemCount: number;
}

const CartHeader: React.FC<CartHeaderProps> = ({
  onDismiss,
  onClear,
  itemCount,
}) => {
  return (
    <View style={styles.container}>
      {/* Botão de Dispensar */}
      <TouchableOpacity
        style={styles.dismissButton}
        onPress={onDismiss}
        activeOpacity={0.7}
      >
        <Ionicons name="chevron-down" size={24} color="#333" />
      </TouchableOpacity>
      
      {/* Título */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>SACOLA</Text>
        {itemCount > 0 && (
          <View style={styles.itemCountBadge}>
            <Text style={styles.itemCountText}>{itemCount}</Text>
          </View>
        )}
      </View>
      
      {/* Botão Limpar */}
      <TouchableOpacity
        style={styles.clearButton}
        onPress={onClear}
        activeOpacity={0.7}
        disabled={itemCount === 0}
      >
        <Text style={[
          styles.clearText,
          itemCount === 0 && styles.clearTextDisabled
        ]}>
          Limpar
        </Text>
      </TouchableOpacity>
    </View>
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
    borderBottomColor: '#E5E5E5',
  },
  dismissButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    letterSpacing: 1,
  },
  itemCountBadge: {
    backgroundColor: '#EA1D2C',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
    minWidth: 20,
    alignItems: 'center',
  },
  itemCountText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  clearButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearText: {
    fontSize: 14,
    color: '#EA1D2C',
    fontWeight: '600',
  },
  clearTextDisabled: {
    color: '#CCC',
  },
});

export default CartHeader;