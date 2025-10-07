import React, { useState, useCallback, useEffect } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import * as Location from 'expo-location';
import { useAuth } from '../contexts/AuthContext';
import { getAddresses, setDefaultAddress, deleteAddress } from '../services/addressService';
import { Address } from '../types/profile';

import AddressHeader from '../components/AddressHeader';
import AddressSearchBar from '../components/AddressSearchBar';
import ActionItem from '../components/ActionItem';
import AddressListItem from '../components/AddressListItem';

const AddressScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { usuarioLogado: user } = useAuth();
  
  const [searchText, setSearchText] = useState('');
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [filteredAddresses, setFilteredAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

  // Recarregar endereços quando a tela ganhar foco
  useFocusEffect(
    useCallback(() => {
      loadAddresses();
    }, [user?.uid])
  );

  // Filtrar endereços quando o texto de busca mudar
  useEffect(() => {
    if (!searchText.trim()) {
      setFilteredAddresses(addresses);
      return;
    }

    const query = searchText.toLowerCase();
    const filtered = addresses.filter(addr => 
      addr.street.toLowerCase().includes(query) ||
      addr.neighborhood.toLowerCase().includes(query) ||
      addr.city.toLowerCase().includes(query) ||
      addr.number.toLowerCase().includes(query) ||
      (addr.complement && addr.complement.toLowerCase().includes(query))
    );
    setFilteredAddresses(filtered);
  }, [searchText, addresses]);

  const loadAddresses = async () => {
    if (!user?.uid) {
      console.log('❌ AddressScreen: Usuário não autenticado');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('📍 AddressScreen: Carregando endereços...');
      const data = await getAddresses(user.uid);
      console.log('✅ AddressScreen: Endereços carregados:', data.length);
      
      // Log detalhado dos endereços para debug
      data.forEach((addr, index) => {
        console.log(`📋 Endereço ${index + 1}:`, {
          id: addr.id,
          label: addr.label,
          street: addr.street,
          number: addr.number,
          neighborhood: addr.neighborhood,
          city: addr.city,
          state: addr.state,
          zipCode: addr.zipCode,
          isDefault: addr.isDefault,
        });
      });
      
      setAddresses(data);
      setFilteredAddresses(data);
    } catch (error: any) {
      console.error('❌ AddressScreen: Erro:', error);
      Alert.alert('Erro', 'Não foi possível carregar os endereços');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAddresses();
    setRefreshing(false);
  };

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const handleUseCurrentLocation = async () => {
    try {
      setGettingLocation(true);

      // Solicitar permissão
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permissão Negada',
          'Precisamos de acesso à sua localização para buscar o endereço automaticamente.\n\nVocê pode adicionar o endereço manualmente clicando no botão abaixo.'
        );
        return;
      }

      // Obter localização com timeout e menor precisão para navegadores
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced, // Balanced funciona melhor em navegadores
        timeInterval: 10000,
        distanceInterval: 0,
      });

      console.log('📍 Localização obtida:', location.coords);

      // Geocodificação reversa
      const [address] = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      console.log('🏠 Endereço geocodificado COMPLETO:', JSON.stringify(address, null, 2));

      if (address) {
        // Mapear todos os campos possíveis (a API às vezes coloca dados em campos diferentes)
        const street = address.street || address.name || '';
        const number = address.streetNumber || '';
        
        // Para bairro: tentar district primeiro, depois subregion
        const neighborhood = address.district || address.subregion || '';
        
        // Para cidade: tentar city primeiro, depois outras alternativas
        const city = address.city || address.subregion || address.district || '';
        
        // Para estado: tentar region (que pode vir como "São Paulo" ou "SP")
        let state = address.region || address.isoCountryCode || '';
        
        // Se o estado vier como nome completo, tentar converter para sigla
        const stateMap: { [key: string]: string } = {
          'São Paulo': 'SP',
          'Rio de Janeiro': 'RJ',
          'Minas Gerais': 'MG',
          'Bahia': 'BA',
          'Paraná': 'PR',
          'Rio Grande do Sul': 'RS',
          'Santa Catarina': 'SC',
          'Goiás': 'GO',
          'Pernambuco': 'PE',
          'Ceará': 'CE',
        };
        
        if (stateMap[state]) {
          state = stateMap[state];
        }
        
        const zipCode = address.postalCode || '';

        console.log('📋 Dados mapeados:', {
          street,
          number,
          neighborhood,
          city,
          state,
          zipCode
        });

        // Navegar para adicionar endereço com dados preenchidos
        navigation.navigate('AddAddress', {
          prefilledData: {
            street,
            number,
            neighborhood,
            city,
            state,
            zipCode,
          },
        });
      } else {
        // Se não conseguiu geocodificar, mostrar coordenadas e sugerir adicionar manualmente
        Alert.alert(
          'Endereço não encontrado',
          `Localização obtida:\nLat: ${location.coords.latitude.toFixed(6)}\nLon: ${location.coords.longitude.toFixed(6)}\n\nNão conseguimos identificar o endereço. Por favor, adicione manualmente.`,
          [
            { text: 'OK', onPress: () => navigation.navigate('AddAddress') }
          ]
        );
      }
    } catch (error: any) {
      console.error('Erro ao obter localização:', error);
      
      // Mensagens de erro mais específicas
      let errorMessage = 'Não foi possível obter sua localização.';
      let errorTitle = 'Erro de Localização';
      
      if (error?.code === 1) {
        // PERMISSION_DENIED
        errorTitle = 'Permissão Negada';
        errorMessage = 'Você negou o acesso à localização. Habilite nas configurações do navegador.';
      } else if (error?.code === 2) {
        // POSITION_UNAVAILABLE
        errorTitle = 'GPS Indisponível';
        errorMessage = 'Seu dispositivo não conseguiu obter a localização.\n\n💡 Dica: Esta funcionalidade funciona melhor no aplicativo mobile. No navegador, por favor adicione o endereço manualmente.';
      } else if (error?.code === 3) {
        // TIMEOUT
        errorTitle = 'Tempo Esgotado';
        errorMessage = 'A busca pela localização demorou muito. Tente novamente ou adicione manualmente.';
      }
      
      Alert.alert(
        errorTitle,
        errorMessage,
        [
          { text: 'Adicionar Manualmente', onPress: () => navigation.navigate('AddAddress') },
          { text: 'Tentar Novamente', onPress: handleUseCurrentLocation },
          { text: 'Cancelar', style: 'cancel' }
        ]
      );
    } finally {
      setGettingLocation(false);
    }
  };

  const handleAddressPress = async (selectedAddress: Address) => {
    if (!user?.uid) return;

    try {
      // Definir como endereço padrão
      await setDefaultAddress(user.uid, selectedAddress.id);
      Alert.alert('Sucesso', 'Endereço padrão atualizado!');
      await loadAddresses();
      
      // Voltar após 500ms
      setTimeout(() => {
        if (navigation.canGoBack()) {
          navigation.goBack();
        }
      }, 500);
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Não foi possível atualizar o endereço');
    }
  };

  const handleAddressOptions = (address: Address) => {
    Alert.alert(
      address.label === 'home' ? 'Casa' : address.label === 'work' ? 'Trabalho' : 'Outro',
      `${address.street}, ${address.number}`,
      [
        {
          text: 'Editar',
          onPress: () => {
            // TODO: Implementar edição
            Alert.alert('Em breve', 'Funcionalidade de edição será implementada');
          },
        },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => handleDeleteAddress(address),
        },
        {
          text: 'Cancelar',
          style: 'cancel',
        },
      ]
    );
  };

  const handleDeleteAddress = async (address: Address) => {
    if (!user?.uid) return;

    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir este endereço?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAddress(user.uid, address.id);
              Alert.alert('Sucesso', 'Endereço excluído!');
              await loadAddresses();
            } catch (error: any) {
              Alert.alert('Erro', error.message || 'Não foi possível excluir o endereço');
            }
          },
        },
      ]
    );
  };

  const renderAddressItem = ({ item }: { item: Address }) => (
    <AddressListItem
      address={item}
      onPress={handleAddressPress}
      onOptionsPress={handleAddressOptions}
    />
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <AddressHeader onBack={handleBack} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#EA1D2C" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AddressHeader onBack={handleBack} />
      
      <AddressSearchBar
        value={searchText}
        onChangeText={setSearchText}
        placeholder="Busque por rua, bairro ou número"
      />
      
      <ActionItem
        icon="locate"
        text={gettingLocation ? "Buscando localização..." : "Usar localização atual"}
        onPress={handleUseCurrentLocation}
      />
      
      <FlatList
        data={filteredAddresses}
        renderItem={renderAddressItem}
        keyExtractor={(item) => item.id}
        style={styles.addressList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#EA1D2C']}
            tintColor="#EA1D2C"
          />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addressList: {
    flex: 1,
    backgroundColor: 'white',
  },
});

export default AddressScreen;