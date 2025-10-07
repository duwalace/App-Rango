import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Image, View } from 'react-native';

interface CategoryGridCardProps {
  title: string;
  subtitle?: string | undefined;
  backgroundColor: string;
  image?: any;
  onPress: () => void;
}

const CategoryGridCard: React.FC<CategoryGridCardProps> = ({
  title,
  subtitle,
  backgroundColor,
  image,
  onPress,
}) => {
  const hasSubtitle = subtitle && subtitle.trim().length > 0;
  
  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        {hasSubtitle && (
          <Text style={styles.subtitle}>{subtitle}</Text>
        )}
      </View>
      {image && <Image source={image} style={styles.image} resizeMode="contain" />}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '48%',
    height: 80,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '500',
    color: '#FFFFFF',
    opacity: 0.9,
  },
  image: {
    width: 60,
    height: 60,
    marginLeft: 4,
  },
});

export default CategoryGridCard;

