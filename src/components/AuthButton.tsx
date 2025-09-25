import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface AuthButtonProps {
  title: string;
  variant: 'primary' | 'secondary';
  onPress: () => void;
}

const AuthButton: React.FC<AuthButtonProps> = ({ title, variant, onPress }) => {
  return (
    <TouchableOpacity 
      style={[
        styles.button, 
        variant === 'primary' ? styles.primaryButton : styles.secondaryButton
      ]} 
      onPress={onPress}
    >
      <Text 
        style={[
          styles.buttonText,
          variant === 'primary' ? styles.primaryText : styles.secondaryText
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#EA1D2C',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#EA1D2C',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryText: {
    color: 'white',
  },
  secondaryText: {
    color: '#EA1D2C',
  },
});

export default AuthButton;