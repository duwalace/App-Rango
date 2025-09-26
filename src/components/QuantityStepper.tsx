import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface QuantityStepperProps {
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
  minQuantity?: number;
  maxQuantity?: number;
  size?: 'small' | 'medium' | 'large';
  showRemoveIcon?: boolean;
  onRemove?: () => void;
}

const QuantityStepper: React.FC<QuantityStepperProps> = ({
  quantity,
  onIncrease,
  onDecrease,
  minQuantity = 1,
  maxQuantity = 99,
  size = 'medium',
  showRemoveIcon = false,
  onRemove,
}) => {
  const isMinimum = quantity <= minQuantity;
  const isMaximum = quantity >= maxQuantity;

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          container: styles.containerSmall,
          button: styles.buttonSmall,
          text: styles.textSmall,
          icon: 16,
        };
      case 'large':
        return {
          container: styles.containerLarge,
          button: styles.buttonLarge,
          text: styles.textLarge,
          icon: 24,
        };
      default:
        return {
          container: styles.containerMedium,
          button: styles.buttonMedium,
          text: styles.textMedium,
          icon: 20,
        };
    }
  };

  const sizeStyles = getSizeStyles();

  const handleDecrease = () => {
    if (quantity === minQuantity && showRemoveIcon && onRemove) {
      onRemove();
    } else if (!isMinimum) {
      onDecrease();
    }
  };

  const renderLeftButton = () => {
    if (quantity === minQuantity && showRemoveIcon) {
      return (
        <TouchableOpacity
          style={[sizeStyles.button, styles.decreaseButton]}
          onPress={handleDecrease}
          activeOpacity={0.7}
        >
          <Ionicons name="trash-outline" size={sizeStyles.icon} color="#EA1D2C" />
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        style={[
          sizeStyles.button,
          styles.decreaseButton,
          isMinimum && styles.disabledButton,
        ]}
        onPress={handleDecrease}
        disabled={isMinimum}
        activeOpacity={0.7}
      >
        <Ionicons 
          name="remove" 
          size={sizeStyles.icon} 
          color={isMinimum ? '#CCC' : '#EA1D2C'} 
        />
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, sizeStyles.container]}>
      {renderLeftButton()}
      
      <View style={styles.quantityContainer}>
        <Text style={[styles.quantityText, sizeStyles.text]}>
          {quantity}
        </Text>
      </View>
      
      <TouchableOpacity
        style={[
          sizeStyles.button,
          styles.increaseButton,
          isMaximum && styles.disabledButton,
        ]}
        onPress={onIncrease}
        disabled={isMaximum}
        activeOpacity={0.7}
      >
        <Ionicons 
          name="add" 
          size={sizeStyles.icon} 
          color={isMaximum ? '#CCC' : '#EA1D2C'} 
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
  },
  containerSmall: {
    height: 32,
  },
  containerMedium: {
    height: 40,
  },
  containerLarge: {
    height: 48,
  },
  buttonSmall: {
    width: 32,
    height: 32,
  },
  buttonMedium: {
    width: 40,
    height: 40,
  },
  buttonLarge: {
    width: 48,
    height: 48,
  },
  decreaseButton: {
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  increaseButton: {
    justifyContent: 'center',
    alignItems: 'center',
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
  quantityContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  quantityText: {
    fontWeight: '600',
    color: '#333',
  },
  textSmall: {
    fontSize: 14,
  },
  textMedium: {
    fontSize: 16,
  },
  textLarge: {
    fontSize: 18,
  },
});

export default QuantityStepper;