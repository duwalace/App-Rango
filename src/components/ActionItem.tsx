import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ActionItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
  onPress: () => void;
}

const ActionItem: React.FC<ActionItemProps> = ({ icon, text, onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Ionicons name={icon} size={24} color="#EA1D2C" style={styles.icon} />
      <Text style={styles.text}>{text}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  icon: {
    marginRight: 12,
  },
  text: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
});

export default ActionItem;