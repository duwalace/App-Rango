import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface MenuSectionHeaderProps {
  title: string;
  itemCount?: number;
}

const MenuSectionHeader: React.FC<MenuSectionHeaderProps> = ({
  title,
  itemCount,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {itemCount && (
        <Text style={styles.itemCount}>
          {itemCount} {itemCount === 1 ? 'item' : 'itens'}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  itemCount: {
    fontSize: 14,
    color: '#666',
  },
});

export default MenuSectionHeader;