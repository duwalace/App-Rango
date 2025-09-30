import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { HomeStackParamList } from '../types/navigation';

import SearchBar from '../components/SearchBar';
import CategoryCard from '../components/CategoryCard';
import FullWidthCategoryCard from '../components/FullWidthCategoryCard';
import { searchSections } from '../data/searchData';

interface Category {
  id: string;
  name: string;
  image: string;
  color: string;
  type?: string;
  subtitle?: string;
}

interface Section {
  title: string;
  data: Category[];
}

type SearchScreenNavigationProp = StackNavigationProp<HomeStackParamList>;

const SearchScreen: React.FC = () => {
  const navigation = useNavigation<SearchScreenNavigationProp>();
  const [searchText, setSearchText] = useState('');

  const handleCategoryPress = (category: Category) => {
    console.log('Categoria selecionada:', category.name);
    navigation.navigate('Category', {
      categoryId: category.id,
      categoryName: category.name,
    });
  };

  const renderCategoryItem = ({ item }: { item: Category }) => {
    if (item.type === 'full-width') {
      return (
        <FullWidthCategoryCard
          title={item.name}
          subtitle={item.subtitle}
          imageSource={item.image}
          backgroundColor={item.color}
          onPress={() => handleCategoryPress(item)}
        />
      );
    }

    return (
      <CategoryCard
        title={item.name}
        subtitle={item.subtitle}
        imageSource={item.image}
        backgroundColor={item.color}
        onPress={() => handleCategoryPress(item)}
      />
    );
  };

  const renderSection = ({ item }: { item: Section }) => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>{item.title}</Text>
      <FlatList
        data={item.data}
        renderItem={renderCategoryItem}
        keyExtractor={(category) => category.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <SearchBar
        value={searchText}
        onChangeText={setSearchText}
        placeholder="O que vai pedir hoje?"
      />
      
      <FlatList
        data={searchSections}
        renderItem={renderSection}
        keyExtractor={(section) => section.title}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  row: {
    justifyContent: 'space-between',
  },
});

export default SearchScreen;