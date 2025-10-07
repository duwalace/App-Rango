import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useAuth } from '../contexts/AuthContext';
import { addAddress } from '../services/addressService';
import { Address } from '../types/profile';
import { buscarCEP } from '../services/cepService';

const AddAddressScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { usuarioLogado: user } = useAuth();

  // Dados pré-preenchidos (se vier da localização)
  const prefilledData = route.params?.prefilledData;

  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);

  // Dados do endereço
  const [street, setStreet] = useState(prefilledData?.street || '');
  const [number, setNumber] = useState(prefilledData?.number || '');
  const [complement, setComplement] = useState('');
  const [neighborhood, setNeighborhood] = useState(prefilledData?.neighborhood || '');
  const [city, setCity] = useState(prefilledData?.city || '');
  const [state, setState] = useState(prefilledData?.state || '');
  const [zipCode, setZipCode] = useState(prefilledData?.zipCode || '');
  const [reference, setReference] = useState('');
  const [label, setLabel] = useState<'home' | 'work' | 'other'>('home');

  const handleUseCurrentLocation = async () => {
    try {
      setGettingLocation(true);

      // Solicitar permissão de localização
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permissão Negada',
          'Precisamos de acesso à sua localização para buscar o endereço automaticamente.\n\nVocê pode preencher o endereço manualmente abaixo.'
        );
        return;
      }

      // Obter localização com configurações otimizadas para navegadores
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced, // Funciona melhor em navegadores
        timeInterval: 10000,
        distanceInterval: 0,
      });

      console.log('📍 Localização obtida:', location.coords);

      // Fazer geocodificação reversa
      const [address] = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      console.log('🏠 Endereço geocodificado COMPLETO:', JSON.stringify(address, null, 2));

      if (address) {
        // Mapear todos os campos possíveis
        const street = address.street || address.name || '';
        const number = address.streetNumber || '';
        
        // Para bairro: tentar district primeiro, depois subregion
        const neighborhood = address.district || address.subregion || '';
        
        // Para cidade: tentar city primeiro, depois outras alternativas
        const city = address.city || address.subregion || address.district || '';
        
        // Para estado: tentar region
        let state = address.region || address.isoCountryCode || '';
        
        // Converter nome completo do estado para sigla
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
          'Espírito Santo': 'ES',
          'Distrito Federal': 'DF',
          'Mato Grosso': 'MT',
          'Mato Grosso do Sul': 'MS',
          'Pará': 'PA',
          'Amazonas': 'AM',
          'Acre': 'AC',
          'Rondônia': 'RO',
          'Roraima': 'RR',
          'Amapá': 'AP',
          'Tocantins': 'TO',
          'Maranhão': 'MA',
          'Piauí': 'PI',
          'Rio Grande do Norte': 'RN',
          'Paraíba': 'PB',
          'Alagoas': 'AL',
          'Sergipe': 'SE',
        };
        
        if (stateMap[state]) {
          state = stateMap[state];
        }
        
        const postalCode = address.postalCode || '';

        console.log('📋 Dados mapeados:', {
          street,
          number,
          neighborhood,
          city,
          state,
          postalCode
        });

        // Preencher campos com os dados obtidos
        if (street) setStreet(street);
        if (number) setNumber(number);
        if (neighborhood) setNeighborhood(neighborhood);
        if (city) setCity(city);
        if (state) setState(state);
        if (postalCode) setZipCode(formatZipCode(postalCode));

        Alert.alert(
          'Sucesso! ✅', 
          'Localização obtida! Verifique e complete os dados se necessário.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Localização Parcial',
          `Coordenadas obtidas:\nLat: ${location.coords.latitude.toFixed(6)}\nLon: ${location.coords.longitude.toFixed(6)}\n\nNão conseguimos identificar o endereço completo. Por favor, preencha manualmente.`,
          [{ text: 'OK' }]
        );
      }
    } catch (error: any) {
      console.error('Erro ao obter localização:', error);
      
      // Mensagens de erro mais específicas e úteis
      let errorMessage = 'Não foi possível obter sua localização.';
      let errorTitle = 'Erro de Localização';
      
      if (error?.code === 1) {
        // PERMISSION_DENIED
        errorTitle = 'Permissão Negada';
        errorMessage = 'Você negou o acesso à localização.\n\n💡 Dica: Habilite a localização nas configurações do navegador e tente novamente.';
      } else if (error?.code === 2) {
        // POSITION_UNAVAILABLE
        errorTitle = 'GPS Indisponível';
        errorMessage = '⚠️ Não foi possível obter sua localização.\n\n💡 Dica: Esta funcionalidade funciona melhor no aplicativo mobile.\n\nNo navegador web, utilize a busca por CEP ou preencha o endereço manualmente.';
      } else if (error?.code === 3) {
        // TIMEOUT
        errorTitle = 'Tempo Esgotado';
        errorMessage = 'A busca pela localização demorou muito.\n\nTente novamente ou utilize a busca por CEP.';
      }
      
      Alert.alert(
        errorTitle,
        errorMessage,
        [{ text: 'OK' }]
      );
    } finally {
      setGettingLocation(false);
    }
  };

  const handleSearchAddress = async () => {
    if (!searchQuery.trim()) {
      Alert.alert('Atenção', 'Digite um endereço para buscar');
      return;
    }

    // Simular busca de endereço (no futuro, integrar com Google Places API)
    Alert.alert(
      'Busca de Endereço',
      'Funcionalidade de busca será integrada em breve. Por favor, preencha manualmente.',
    );
  };

  // Função para buscar CEP automaticamente
  const handleCepChange = async (text: string) => {
    const formattedCep = formatZipCode(text);
    setZipCode(formattedCep);

    // Remove formatação para verificar se tem 8 dígitos
    const cleanCep = formattedCep.replace(/\D/g, '');

    if (cleanCep.length === 8) {
      setLoadingCep(true);
      try {
        const data = await buscarCEP(cleanCep);
        
        if (data && !data.erro) {
          // Preenche os campos automaticamente
          setStreet(data.logradouro || '');
          setNeighborhood(data.bairro || '');
          setCity(data.localidade || '');
          setState(data.uf || '');
          if (data.complemento) {
            setComplement(data.complemento);
          }
          
          console.log('✅ Endereço preenchido automaticamente');
        } else {
          Alert.alert(
            'CEP não encontrado',
            'Não foi possível encontrar o endereço. Por favor, preencha manualmente.'
          );
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
        Alert.alert(
          'Erro',
          'Não foi possível buscar o CEP. Verifique sua conexão e tente novamente.'
        );
      } finally {
        setLoadingCep(false);
      }
    }
  };

  const handleSearchByCEP = async () => {
    if (zipCode.length < 8) {
      Alert.alert('Atenção', 'Digite um CEP válido');
      return;
    }

    try {
      setLoading(true);
      // Consultar API ViaCEP usando o serviço
      const cleanCep = zipCode.replace(/\D/g, '');
      const data = await buscarCEP(cleanCep);

      if (data && !data.erro) {
        // Preencher campos automaticamente
        setStreet(data.logradouro || '');
        setNeighborhood(data.bairro || '');
        setCity(data.localidade || '');
        setState(data.uf || '');
        if (data.complemento) {
          setComplement(data.complemento);
        }
      } else {
        Alert.alert('Erro', 'CEP não encontrado');
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível buscar o CEP');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAddress = async () => {
    // Validações
    if (!street || !number || !neighborhood || !city || !state || !zipCode) {
      Alert.alert('Atenção', 'Por favor, preencha todos os campos obrigatórios');
      return;
    }

    if (!user?.uid) {
      Alert.alert('Erro', 'Usuário não autenticado');
      return;
    }

    try {
      setLoading(true);

      const newAddress = {
        street,
        number,
        complement,
        neighborhood,
        city,
        state,
        zipCode: zipCode.replace(/\D/g, ''),
        reference,
        label,
        isDefault: false,
      };

      console.log('💾 Salvando endereço:', newAddress);
      
      await addAddress(user.uid, newAddress);
      
      console.log('✅ Endereço salvo com sucesso!');

      Alert.alert('Sucesso', 'Endereço adicionado com sucesso!', [
        {
          text: 'OK',
          onPress: () => {
            const returnTo = route.params?.returnTo;
            if (returnTo) {
              navigation.navigate(returnTo);
            } else {
              navigation.goBack();
            }
          },
        },
      ]);
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Não foi possível salvar o endereço');
    } finally {
      setLoading(false);
    }
  };

  const formatZipCode = (text: string) => {
    const numbers = text.replace(/\D/g, '');
    if (numbers.length <= 5) {
      return numbers;
    }
    return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Adicionar Endereço</Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Busca de Endereço */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Buscar Endereço</Text>
            <View style={styles.searchContainer}>
              <Ionicons
                name="search-outline"
                size={20}
                color="#999"
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Digite o endereço ou CEP"
                value={searchQuery}
                onChangeText={setSearchQuery}
                returnKeyType="search"
                onSubmitEditing={handleSearchAddress}
              />
              <TouchableOpacity
                style={styles.searchButton}
                onPress={handleSearchAddress}
              >
                <Text style={styles.searchButtonText}>Buscar</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Ou use sua localização */}
          <TouchableOpacity 
            style={styles.locationButton}
            onPress={handleUseCurrentLocation}
            disabled={gettingLocation}
          >
            {gettingLocation ? (
              <ActivityIndicator size="small" color="#EA1D2C" />
            ) : (
              <Ionicons name="locate" size={20} color="#EA1D2C" />
            )}
            <Text style={styles.locationButtonText}>
              {gettingLocation ? 'Buscando localização...' : 'Usar minha localização atual'}
            </Text>
          </TouchableOpacity>

          {/* Divisor */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ou preencha manualmente</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Formulário Manual */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dados do Endereço</Text>

            {/* CEP */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                CEP <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.cepContainer}>
                <TextInput
                  style={[styles.input, styles.cepInput, loadingCep && styles.inputDisabled]}
                  placeholder="00000-000"
                  value={zipCode}
                  onChangeText={handleCepChange}
                  keyboardType="numeric"
                  maxLength={9}
                  editable={!loadingCep}
                />
                {loadingCep ? (
                  <View style={styles.cepButton}>
                    <ActivityIndicator size="small" color="#FF6B35" />
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.cepButton}
                    onPress={handleSearchByCEP}
                    disabled={loading}
                  >
                    <Text style={styles.cepButtonText}>Buscar</Text>
                  </TouchableOpacity>
                )}
              </View>
              {loadingCep && (
                <Text style={styles.loadingText}>Buscando endereço...</Text>
              )}
            </View>

            {/* Rua */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Rua <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Nome da rua"
                value={street}
                onChangeText={setStreet}
              />
            </View>

            {/* Número e Complemento */}
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>
                  Número <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="123"
                  value={number}
                  onChangeText={setNumber}
                  keyboardType="numeric"
                />
              </View>

              <View style={[styles.inputGroup, { flex: 2 }]}>
                <Text style={styles.label}>Complemento</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Apto, Bloco, etc."
                  value={complement}
                  onChangeText={setComplement}
                />
              </View>
            </View>

            {/* Bairro */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Bairro <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Nome do bairro"
                value={neighborhood}
                onChangeText={setNeighborhood}
              />
            </View>

            {/* Cidade e Estado */}
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 2, marginRight: 8 }]}>
                <Text style={styles.label}>
                  Cidade <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nome da cidade"
                  value={city}
                  onChangeText={setCity}
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>
                  UF <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="SP"
                  value={state}
                  onChangeText={(text) => setState(text.toUpperCase())}
                  maxLength={2}
                  autoCapitalize="characters"
                />
              </View>
            </View>

            {/* Ponto de Referência */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Ponto de Referência</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Próximo ao supermercado"
                value={reference}
                onChangeText={setReference}
              />
            </View>

            {/* Tipo de Endereço */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tipo de Endereço</Text>
              <View style={styles.labelSelector}>
                <TouchableOpacity
                  style={[
                    styles.labelOption,
                    label === 'home' && styles.labelOptionActive,
                  ]}
                  onPress={() => setLabel('home')}
                >
                  <Ionicons
                    name="home"
                    size={20}
                    color={label === 'home' ? '#EA1D2C' : '#666'}
                  />
                  <Text
                    style={[
                      styles.labelOptionText,
                      label === 'home' && styles.labelOptionTextActive,
                    ]}
                  >
                    Casa
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.labelOption,
                    label === 'work' && styles.labelOptionActive,
                  ]}
                  onPress={() => setLabel('work')}
                >
                  <Ionicons
                    name="briefcase"
                    size={20}
                    color={label === 'work' ? '#EA1D2C' : '#666'}
                  />
                  <Text
                    style={[
                      styles.labelOptionText,
                      label === 'work' && styles.labelOptionTextActive,
                    ]}
                  >
                    Trabalho
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.labelOption,
                    label === 'other' && styles.labelOptionActive,
                  ]}
                  onPress={() => setLabel('other')}
                >
                  <Ionicons
                    name="location"
                    size={20}
                    color={label === 'other' ? '#EA1D2C' : '#666'}
                  />
                  <Text
                    style={[
                      styles.labelOptionText,
                      label === 'other' && styles.labelOptionTextActive,
                    ]}
                  >
                    Outro
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Footer com Botão Salvar */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSaveAddress}
            disabled={loading}
          >
            <Text style={styles.saveButtonText}>
              {loading ? 'Salvando...' : 'Salvar Endereço'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 4,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingLeft: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: '#333',
  },
  searchButton: {
    backgroundColor: '#EA1D2C',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EA1D2C',
  },
  locationButtonText: {
    color: '#EA1D2C',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 13,
    color: '#999',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  required: {
    color: '#EA1D2C',
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  row: {
    flexDirection: 'row',
  },
  cepContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  cepInput: {
    flex: 1,
  },
  cepButton: {
    backgroundColor: '#EA1D2C',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
  },
  cepButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingText: {
    fontSize: 12,
    color: '#FF6B35',
    marginTop: 4,
    fontStyle: 'italic',
  },
  inputDisabled: {
    backgroundColor: '#f5f5f5',
    opacity: 0.7,
  },
  labelSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  labelOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#F5F5F5',
  },
  labelOptionActive: {
    borderColor: '#EA1D2C',
    backgroundColor: '#FFF0F0',
  },
  labelOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginLeft: 8,
  },
  labelOptionTextActive: {
    color: '#EA1D2C',
    fontWeight: '600',
  },
  footer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  saveButton: {
    backgroundColor: '#EA1D2C',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default AddAddressScreen;

