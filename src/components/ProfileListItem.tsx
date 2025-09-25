import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ProfileListItemProps {
  iconName: keyof typeof Ionicons.glyphMap;
  text: string;
  onPress: () => void;
}

const ProfileListItem: React.FC<ProfileListItemProps> = ({
  iconName,
  text,
  onPress,
}) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.leftContent}>
        <Ionicons name={iconName} size={24} color="#666" style={styles.icon} />
        <Text style={styles.text}>{text}</Text>
      </View>
      
      <Ionicons name="chevron-forward" size={20} color="#999" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: 'white',
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    marginRight: 16,
  },
  text: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
});

export default ProfileListItem;