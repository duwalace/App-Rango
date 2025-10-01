import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Filter {
  id: string;
  label: string;
  hasIcon?: boolean;
}

interface FilterBarProps {
  filters: Filter[];
  onFilterPress: (filter: Filter) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ filters, onFilterPress }) => {
  const renderFilter = ({ item }: { item: Filter }) => (
    <TouchableOpacity 
      style={styles.filterChip} 
      onPress={() => onFilterPress(item)}
    >
      <Text style={styles.filterText}>{item.label}</Text>
      {item.hasIcon && (
        <Ionicons name="chevron-down" size={14} color="#666" style={styles.filterIcon} />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={filters}
        renderItem={renderFilter}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    paddingVertical: 12,
  },
  listContainer: {
    paddingHorizontal: 16,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  filterText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  filterIcon: {
    marginLeft: 4,
  },
});

export default FilterBar;