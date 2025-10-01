import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet } from 'react-native';

interface SubCategory {
  id: string;
  name: string;
  image: string;
}

interface SubCategoryCarouselProps {
  data: SubCategory[];
  onSubCategoryPress?: (subCategory: SubCategory) => void;
}

const SubCategoryCarousel: React.FC<SubCategoryCarouselProps> = ({
  data,
  onSubCategoryPress,
}) => {
  const renderSubCategory = ({ item }: { item: SubCategory }) => (
    <TouchableOpacity
      style={styles.subCategoryItem}
      onPress={() => onSubCategoryPress?.(item)}
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.image }} style={styles.subCategoryImage} />
      </View>
      <Text style={styles.subCategoryName}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        renderItem={renderSubCategory}
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
    paddingVertical: 16,
  },
  listContainer: {
    paddingHorizontal: 16,
  },
  subCategoryItem: {
    alignItems: 'center',
    marginRight: 20,
    width: 70,
  },
  imageContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  subCategoryImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  subCategoryName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default SubCategoryCarousel;