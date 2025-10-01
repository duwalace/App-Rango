import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Category {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
}

interface CategoryFilterCarouselProps {
  categories: Category[];
  activeCategory: string;
  onCategoryPress: (categoryId: string) => void;
}

const CategoryFilterCarousel: React.FC<CategoryFilterCarouselProps> = ({
  categories,
  activeCategory,
  onCategoryPress,
}) => {
  const renderCategory = ({ item }: { item: Category }) => {
    const isActive = item.id === activeCategory;
    
    return (
      <TouchableOpacity
        style={[styles.categoryChip, isActive && styles.activeCategoryChip]}
        onPress={() => onCategoryPress(item.id)}
      >
        <Ionicons
          name={item.icon}
          size={16}
          color={isActive ? 'white' : '#666'}
          style={styles.categoryIcon}
        />
        <Text style={[styles.categoryText, isActive && styles.activeCategoryText]}>
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={categories}
        renderItem={renderCategory}
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
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  listContainer: {
    paddingHorizontal: 16,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  activeCategoryChip: {
    backgroundColor: '#EA1D2C',
    borderColor: '#EA1D2C',
  },
  categoryIcon: {
    marginRight: 6,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activeCategoryText: {
    color: 'white',
  },
});

export default CategoryFilterCarousel;