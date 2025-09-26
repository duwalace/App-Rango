import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

interface PromoBanner {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  backgroundColor?: string;
}

interface PromoBannerCardProps {
  banner: PromoBanner;
  onPress?: (banner: PromoBanner) => void;
}

const PromoBannerCard: React.FC<PromoBannerCardProps> = ({
  banner,
  onPress,
}) => {
  return (
    <TouchableOpacity 
      style={[
        styles.container, 
        { backgroundColor: banner.backgroundColor || '#EA1D2C' }
      ]} 
      onPress={() => onPress?.(banner)}
    >
      <View style={styles.textContainer}>
        <Text style={styles.title}>{banner.title}</Text>
        {banner.subtitle && (
          <Text style={styles.subtitle}>{banner.subtitle}</Text>
        )}
      </View>
      
      <Image 
        source={{ uri: banner.image }} 
        style={styles.bannerImage}
        resizeMode="contain"
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 300,
    height: 120,
    borderRadius: 12,
    padding: 16,
    marginRight: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    overflow: 'hidden',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
  },
  bannerImage: {
    width: 80,
    height: 80,
  },
});

export default PromoBannerCard;