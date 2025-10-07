import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface RatingStarsProps {
  rating: number;
  size?: number;
  editable?: boolean;
  onRatingChange?: (rating: number) => void;
}

const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  size = 20,
  editable = false,
  onRatingChange,
}) => {
  const handleStarPress = (starRating: number) => {
    if (editable && onRatingChange) {
      onRatingChange(starRating);
    }
  };

  const renderStar = (index: number) => {
    const starRating = index + 1;
    const isFilled = starRating <= rating;
    const isHalfFilled = !isFilled && starRating - 0.5 <= rating;

    const StarComponent = editable ? TouchableOpacity : View;

    return (
      <StarComponent
        key={index}
        onPress={() => handleStarPress(starRating)}
        disabled={!editable}
        style={styles.star}
      >
        <Ionicons
          name={isFilled ? 'star' : isHalfFilled ? 'star-half' : 'star-outline'}
          size={size}
          color={isFilled || isHalfFilled ? '#FFB800' : '#CCC'}
        />
      </StarComponent>
    );
  };

  return (
    <View style={styles.container}>
      {[0, 1, 2, 3, 4].map((index) => renderStar(index))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    marginHorizontal: 2,
  },
});

export default RatingStars;

