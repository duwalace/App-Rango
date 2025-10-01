import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';

interface ContentCarouselProps<T = any> {
  title: string;
  data: T[];
  renderCard: (item: T) => React.ReactElement;
  onSeeMorePress?: () => void;
  showSeeMore?: boolean;
}

function ContentCarousel<T = any>({
  title,
  data,
  renderCard,
  onSeeMorePress,
  showSeeMore = true,
}: ContentCarouselProps<T>) {
  const renderItem = ({ item }: { item: T }) => renderCard(item);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {showSeeMore && onSeeMorePress && (
          <TouchableOpacity onPress={onSeeMorePress}>
            <Text style={styles.seeMoreText}>Ver mais</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item, index) => item?.id?.toString() || index.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    paddingVertical: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  seeMoreText: {
    fontSize: 14,
    color: '#EA1D2C',
    fontWeight: '600',
  },
  listContainer: {
    paddingHorizontal: 16,
  },
});

export default ContentCarousel;