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
  activeFilters?: string[];
  currentSort?: string;
}

const FilterBar: React.FC<FilterBarProps> = ({ filters, onFilterPress, activeFilters = [], currentSort }) => {
  const renderFilter = ({ item }: { item: Filter }) => {
    const isActive = activeFilters.includes(item.id);
    const isOrderFilter = item.id === '1';
    
    // Label especial para o filtro de ordenação
    let displayLabel = item.label;
    if (isOrderFilter && currentSort && currentSort !== 'relevancia') {
      const sortLabels: Record<string, string> = {
        avaliacao: 'Melhor avaliação',
        tempo: 'Entrega rápida',
        preco: 'Menor preço',
        distancia: 'Distância'
      };
      displayLabel = sortLabels[currentSort] || item.label;
    }
    
    return (
      <TouchableOpacity 
        style={[
          styles.filterChip,
          isActive && styles.filterChipActive
        ]} 
        onPress={() => onFilterPress(item)}
      >
        <Text style={[
          styles.filterText,
          isActive && styles.filterTextActive
        ]}>
          {displayLabel}
        </Text>
        {item.hasIcon && (
          <Ionicons 
            name="chevron-down" 
            size={14} 
            color={isActive ? '#EA1D2C' : '#666'} 
            style={styles.filterIcon} 
          />
        )}
      </TouchableOpacity>
    );
  };

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
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterChipActive: {
    backgroundColor: '#FFEBEE',
    borderColor: '#EA1D2C',
  },
  filterText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#EA1D2C',
    fontWeight: '600',
  },
  filterIcon: {
    marginLeft: 4,
  },
});

export default FilterBar;