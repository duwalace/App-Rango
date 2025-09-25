import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';

interface ProfileHeaderProps {
  onLoginPress: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ onLoginPress }) => {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.mainText}>Falta pouco para{'\n'}matar sua fome!</Text>
        <Image 
          source={{ uri: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=80&h=80&fit=crop' }}
          style={styles.bagImage}
          resizeMode="contain"
        />
      </View>
      
      <TouchableOpacity style={styles.loginButton} onPress={onLoginPress}>
        <Text style={styles.loginButtonText}>Entrar ou cadastrar-se</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  mainText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    flex: 1,
    lineHeight: 26,
  },
  bagImage: {
    width: 60,
    height: 60,
    marginLeft: 16,
  },
  loginButton: {
    borderWidth: 2,
    borderColor: '#EA1D2C',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  loginButtonText: {
    color: '#EA1D2C',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProfileHeader;