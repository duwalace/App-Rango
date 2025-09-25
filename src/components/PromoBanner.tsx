import React from 'react';
import { TouchableOpacity, View, Text, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PromoBannerProps {
  title: string;
  subtitle: string;
  imageSource: string;
  onPress: () => void;
}

const PromoBanner: React.FC<PromoBannerProps> = ({
  title,
  subtitle,
  imageSource,
  onPress,
}) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Image 
        source={{ uri: imageSource }}
        style={styles.image}
        resizeMode="contain"
      />
      
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      
      <Ionicons name="chevron-forward" size={20} color="#999" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F7F7',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 16,
  },
  image: {
    width: 40,
    height: 40,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
});

export default PromoBanner;