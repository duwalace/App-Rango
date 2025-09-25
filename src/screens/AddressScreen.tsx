import React, { useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import AddressHeader from '../components/AddressHeader';
import AddressSearchBar from '../components/AddressSearchBar';
import ActionItem from '../components/ActionItem';
import AddressListItem from '../components/AddressListItem';
import { mockAddresses } from '../data/mockData';

const AddressScreen: React.FC = () => {
  const navigation = useNavigation();
  const [searchText, setSearchText] = useState('');
  const [addresses, setAddresses] = useState(mockAddresses);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleUseCurrentLocation = () => {
    console.log('Usar localização atual');
    // Implementar lógica de geolocalização
  };

  const handleAddressPress = (selectedAddress: any) => {
    // Atualizar endereço selecionado
    const updatedAddresses = addresses.map(addr => ({
      ...addr,
      isSelected: addr.id === selectedAddress.id
    }));
    setAddresses(updatedAddresses);
    
    // Voltar para a tela anterior após selecionar
    setTimeout(() => {
      navigation.goBack();
    }, 300);
  };

  const handleAddressOptions = (address: any) => {
    console.log('Opções para endereço:', address.name);
    // Implementar menu de opções (editar/remover)
  };

  const renderAddressItem = ({ item }: { item: any }) => (
    <AddressListItem
      address={item}
      onPress={handleAddressPress}
      onOptionsPress={handleAddressOptions}
    />
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AddressHeader onBack={handleBack} />
      
      <AddressSearchBar
        value={searchText}
        onChangeText={setSearchText}
        placeholder="Endereço e número"
      />
      
      <ActionItem
        icon="locate"
        text="Usar localização atual"
        onPress={handleUseCurrentLocation}
      />
      
      <FlatList
        data={addresses}
        renderItem={renderAddressItem}
        keyExtractor={(item) => item.id}
        style={styles.addressList}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  addressList: {
    flex: 1,
    backgroundColor: 'white',
  },
});

export default AddressScreen;