import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ProfileHeader from '../components/ProfileHeader';
import PromoBanner from '../components/PromoBanner';
import ProfileListItem from '../components/ProfileListItem';
import { mainMenuItems, supportMenuItems, promoBannerData } from '../data/profileData';

const ProfileScreen: React.FC = () => {
  const handleLoginPress = () => {
    console.log('Navegar para tela de login/cadastro');
    // Implementar navegação para tela de login
  };

  const handlePromoBannerPress = () => {
    console.log('Navegar para Comunidade iFood');
    // Implementar navegação para comunidade
  };

  const handleMenuItemPress = (screen: string) => {
    console.log('Navegar para:', screen);
    // Implementar navegação usando react-navigation
    // navigation.navigate(screen);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.mainContainer}>
          {/* Header do Perfil */}
          <ProfileHeader onLoginPress={handleLoginPress} />
          
          {/* Banner Promocional */}
          <PromoBanner
            title={promoBannerData.title}
            subtitle={promoBannerData.subtitle}
            imageSource={promoBannerData.imageSource}
            onPress={handlePromoBannerPress}
          />
          
          {/* Lista Principal de Itens */}
          <View style={styles.menuSection}>
            {mainMenuItems.map((item, index) => (
              <ProfileListItem
                key={item.screen}
                iconName={item.icon}
                text={item.text}
                onPress={() => handleMenuItemPress(item.screen)}
              />
            ))}
          </View>
          
          {/* Espaçador entre seções */}
          <View style={styles.sectionSpacer} />
          
          {/* Lista de Suporte e Configurações */}
          <View style={styles.menuSection}>
            {supportMenuItems.map((item, index) => (
              <ProfileListItem
                key={item.screen}
                iconName={item.icon}
                text={item.text}
                onPress={() => handleMenuItemPress(item.screen)}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  mainContainer: {
    flex: 1,
  },
  menuSection: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    overflow: 'hidden',
  },
  sectionSpacer: {
    height: 16,
  },
});

export default ProfileScreen;