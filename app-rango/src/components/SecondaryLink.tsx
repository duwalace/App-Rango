import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface SecondaryLinkProps {
  text: string;
  onPress: () => void;
  align?: 'left' | 'center' | 'right';
}

const SecondaryLink: React.FC<SecondaryLinkProps> = ({
  text,
  onPress,
  align = 'center',
}) => {
  return (
    <TouchableOpacity 
      style={[styles.container, { alignSelf: align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start' }]} 
      onPress={onPress}
    >
      <Text style={styles.linkText}>{text}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  linkText: {
    color: '#EA1D2C',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default SecondaryLink;