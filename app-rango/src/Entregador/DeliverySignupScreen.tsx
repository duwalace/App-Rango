/**
 * DeliverySignupScreen.tsx
 * Tela de cadastro completo do entregador
 * Coleta todos os dados necessários para aprovação
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { createDeliveryPerson } from '../services/deliveryService';
import { useAuth } from '../contexts/AuthContext';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../services/firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import {
  formatCPF,
  formatPhone,
  formatCEP,
  formatPlate,
  formatDate,
  formatCNH,
  formatRG,
  isValidCPF,
  isValidPhone,
  isValidCEP,
  isValidCNH,
  isValidDate,
  isValidEmail,
  parseDate,
  onlyNumbers,
} from '../utils/validators';
import { buscarCEP } from '../services/cepService';

type AuthStackParamList = {
  AuthMain: undefined;
  Login: undefined;
  Signup: undefined;
  DeliverySignup: undefined;
};

type NavigationProp = StackNavigationProp<AuthStackParamList, 'DeliverySignup'>;

const DeliverySignupScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { usuarioLogado } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);

  // Dados pessoais
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [cpf, setCpf] = useState('');
  const [phone, setPhone] = useState('');

  // Endereço
  const [zipCode, setZipCode] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [complement, setComplement] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');

  // Documentos
  const [cnhNumber, setCnhNumber] = useState('');
  const [cnhCategory, setCnhCategory] = useState('');
  const [cnhExpiration, setCnhExpiration] = useState('');
  const [rgNumber, setRgNumber] = useState('');

  // Veículo
  const [vehicleType, setVehicleType] = useState<'bike' | 'motorcycle' | 'car'>('bike');
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [vehicleBrand, setVehicleBrand] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');

  // Dados bancários
  const [bankName, setBankName] = useState('');
  const [accountType, setAccountType] = useState<'checking' | 'savings'>('checking');
  const [agency, setAgency] = useState('');
  const [accountNumber, setAccountNumber] = useState('');

  // Função para buscar CEP
  const handleCepChange = async (cep: string) => {
    const formattedCep = formatCEP(cep);
    setZipCode(formattedCep);

    // Remove formatação para verificar se tem 8 dígitos
    const cleanCep = onlyNumbers(formattedCep);

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

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!name || !email || !password || !confirmPassword || !cpf || !phone) {
        Alert.alert('Atenção', 'Preencha todos os campos obrigatórios');
        return;
      }
      if (!isValidEmail(email)) {
        Alert.alert('Email Inválido', 'Por favor, informe um email válido');
        return;
      }
      if (password.length < 6) {
        Alert.alert('Senha Fraca', 'A senha deve ter pelo menos 6 caracteres');
        return;
      }
      if (password !== confirmPassword) {
        Alert.alert('Senhas Diferentes', 'As senhas não coincidem');
        return;
      }
      if (!isValidCPF(cpf)) {
        Alert.alert('CPF Inválido', 'Por favor, informe um CPF válido');
        return;
      }
      if (!isValidPhone(phone)) {
        Alert.alert('Telefone Inválido', 'Por favor, informe um telefone válido');
        return;
      }
    } else if (currentStep === 2) {
      if (!zipCode || !street || !number || !neighborhood || !city || !state) {
        Alert.alert('Atenção', 'Preencha todos os campos do endereço');
        return;
      }
      if (!isValidCEP(zipCode)) {
        Alert.alert('CEP Inválido', 'Por favor, informe um CEP válido');
        return;
      }
      if (state.length !== 2) {
        Alert.alert('UF Inválida', 'Informe a sigla do estado (ex: SP)');
        return;
      }
    } else if (currentStep === 3) {
      if (!cnhNumber || !cnhCategory || !rgNumber) {
        Alert.alert('Atenção', 'Preencha todos os documentos');
        return;
      }
      if (!isValidCNH(cnhNumber)) {
        Alert.alert('CNH Inválida', 'A CNH deve ter 11 dígitos');
        return;
      }
      if (cnhExpiration && !isValidDate(cnhExpiration)) {
        Alert.alert('Data Inválida', 'Informe uma data válida no formato DD/MM/AAAA');
        return;
      }
    } else if (currentStep === 4) {
      if (vehicleType !== 'bike' && !vehiclePlate) {
        Alert.alert('Atenção', 'Informe a placa do veículo');
        return;
      }
      if (vehiclePlate && vehiclePlate.replace(/[^A-Z0-9]/g, '').length < 7) {
        Alert.alert('Placa Inválida', 'Informe uma placa válida');
        return;
      }
    }

    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // 1. Criar conta no Firebase Auth
      console.log('📝 Criando conta no Firebase Auth...');
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('✅ Conta criada:', user.uid);

      // 2. Criar documento do usuário na collection 'users' com role 'entregador'
      console.log('📝 Criando documento de usuário...');
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        role: 'entregador',
        createdAt: new Date(),
      });
      console.log('✅ Documento de usuário criado');

      // 3. Criar perfil de entregador
      // Processar data de expiração da CNH
      let cnhExpirationDate = new Date();
      cnhExpirationDate.setFullYear(cnhExpirationDate.getFullYear() + 5); // Padrão: 5 anos
      
      if (cnhExpiration) {
        const parsedDate = parseDate(cnhExpiration);
        if (parsedDate) {
          cnhExpirationDate = parsedDate;
        }
      }

      // Limpar CPF (remover formatação)
      const cleanedCPF = onlyNumbers(cpf);
      const cleanedPhone = onlyNumbers(phone);
      const cleanedZipCode = onlyNumbers(zipCode);
      const cleanedCNH = onlyNumbers(cnhNumber);

      console.log('📝 Criando perfil de entregador...');
      await createDeliveryPerson({
        userId: user.uid,
        name,
        email: user.email!,
        phone: cleanedPhone,
        cpf: cleanedCPF,
        address: {
          street,
          number,
          complement,
          neighborhood,
          city,
          state: state.toUpperCase(),
          zipCode: cleanedZipCode,
        },
        documents: {
          cnh: {
            number: cleanedCNH,
            category: cnhCategory.toUpperCase(),
            expirationDate: cnhExpirationDate,
          },
          rg: {
            number: onlyNumbers(rgNumber),
          },
        },
        vehicle: {
          type: vehicleType,
          brand: vehicleBrand,
          model: vehicleModel,
          plate: vehiclePlate.toUpperCase(),
        },
        bankAccount: bankName ? {
          bankName,
          accountType,
          agency,
          accountNumber,
          cpf: cleanedCPF,
        } : undefined,
      });

      console.log('✅ Perfil de entregador criado');

      // Fazer logout para limpar a sessão
      await auth.signOut();

      Alert.alert(
        'Cadastro Enviado!',
        'Sua conta foi criada e seu cadastro está em análise. Você receberá uma notificação quando for aprovado.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Voltar para a tela inicial de autenticação
              if (navigation.canGoBack()) {
                navigation.goBack();
              }
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('❌ Erro ao cadastrar:', error);
      
      let errorMessage = 'Não foi possível enviar seu cadastro. Tente novamente.';
      
      // Tratar erros específicos do Firebase Auth
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Este email já está cadastrado. Use outro email ou faça login.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Email inválido.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'A senha é muito fraca. Use pelo menos 6 caracteres.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Erro de conexão. Verifique sua internet.';
      }
      
      Alert.alert('Erro', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      {[1, 2, 3, 4, 5].map((step) => (
        <View
          key={step}
          style={[
            styles.progressDot,
            currentStep >= step && styles.progressDotActive,
          ]}
        />
      ))}
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Dados Pessoais</Text>
      <Text style={styles.stepSubtitle}>Crie sua conta de entregador</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Nome Completo *</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Seu nome completo"
          autoCapitalize="words"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Email *</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="seu@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Senha *</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="Mínimo 6 caracteres"
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Confirmar Senha *</Text>
        <TextInput
          style={styles.input}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Digite a senha novamente"
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>CPF *</Text>
        <TextInput
          style={styles.input}
          value={cpf}
          onChangeText={(text) => setCpf(formatCPF(text))}
          placeholder="000.000.000-00"
          keyboardType="numeric"
          maxLength={14}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Telefone *</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={(text) => setPhone(formatPhone(text))}
          placeholder="(00) 00000-0000"
          keyboardType="phone-pad"
          maxLength={15}
        />
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Endereço</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>CEP *</Text>
        <View style={styles.cepInputContainer}>
          <TextInput
            style={[styles.input, loadingCep && styles.inputDisabled]}
            value={zipCode}
            onChangeText={handleCepChange}
            placeholder="00000-000"
            keyboardType="numeric"
            maxLength={9}
            editable={!loadingCep}
          />
          {loadingCep && (
            <ActivityIndicator 
              size="small" 
              color="#FF6B35" 
              style={styles.cepLoader}
            />
          )}
        </View>
        {loadingCep && (
          <Text style={styles.loadingText}>Buscando endereço...</Text>
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Rua *</Text>
        <TextInput
          style={styles.input}
          value={street}
          onChangeText={setStreet}
          placeholder="Nome da rua"
        />
      </View>

      <View style={styles.inputRow}>
        <View style={[styles.inputGroup, { flex: 1 }]}>
          <Text style={styles.label}>Número *</Text>
          <TextInput
            style={styles.input}
            value={number}
            onChangeText={setNumber}
            placeholder="123"
            keyboardType="numeric"
          />
        </View>

        <View style={[styles.inputGroup, { flex: 2, marginLeft: 12 }]}>
          <Text style={styles.label}>Complemento</Text>
          <TextInput
            style={styles.input}
            value={complement}
            onChangeText={setComplement}
            placeholder="Apto, bloco..."
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Bairro *</Text>
        <TextInput
          style={styles.input}
          value={neighborhood}
          onChangeText={setNeighborhood}
          placeholder="Nome do bairro"
        />
      </View>

      <View style={styles.inputRow}>
        <View style={[styles.inputGroup, { flex: 3 }]}>
          <Text style={styles.label}>Cidade *</Text>
          <TextInput
            style={styles.input}
            value={city}
            onChangeText={setCity}
            placeholder="Cidade"
          />
        </View>

        <View style={[styles.inputGroup, { flex: 1, marginLeft: 12 }]}>
          <Text style={styles.label}>UF *</Text>
          <TextInput
            style={styles.input}
            value={state}
            onChangeText={setState}
            placeholder="SP"
            autoCapitalize="characters"
            maxLength={2}
          />
        </View>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Documentos</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Número da CNH *</Text>
        <TextInput
          style={styles.input}
          value={cnhNumber}
          onChangeText={(text) => setCnhNumber(formatCNH(text))}
          placeholder="00000000000"
          keyboardType="numeric"
          maxLength={11}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Categoria da CNH *</Text>
        <TextInput
          style={styles.input}
          value={cnhCategory}
          onChangeText={(text) => setCnhCategory(text.toUpperCase())}
          placeholder="A, B, AB..."
          autoCapitalize="characters"
          maxLength={3}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Validade da CNH</Text>
        <TextInput
          style={styles.input}
          value={cnhExpiration}
          onChangeText={(text) => setCnhExpiration(formatDate(text))}
          placeholder="DD/MM/AAAA"
          keyboardType="numeric"
          maxLength={10}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Número do RG *</Text>
        <TextInput
          style={styles.input}
          value={rgNumber}
          onChangeText={(text) => setRgNumber(formatRG(text))}
          placeholder="00.000.000-0"
          keyboardType="numeric"
          maxLength={12}
        />
      </View>

      <View style={styles.infoBox}>
        <Icon name="information" size={20} color="#2196F3" />
        <Text style={styles.infoText}>
          Você poderá enviar fotos dos documentos após a aprovação inicial
        </Text>
      </View>
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Veículo</Text>

      <Text style={styles.label}>Tipo de Veículo *</Text>
      <View style={styles.vehicleTypes}>
        <TouchableOpacity
          style={[styles.vehicleTypeButton, vehicleType === 'bike' && styles.vehicleTypeButtonActive]}
          onPress={() => setVehicleType('bike')}
        >
          <Icon
            name="bike"
            size={32}
            color={vehicleType === 'bike' ? '#fff' : '#666'}
          />
          <Text style={[styles.vehicleTypeText, vehicleType === 'bike' && styles.vehicleTypeTextActive]}>
            Bicicleta
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.vehicleTypeButton, vehicleType === 'motorcycle' && styles.vehicleTypeButtonActive]}
          onPress={() => setVehicleType('motorcycle')}
        >
          <Icon
            name="motorbike"
            size={32}
            color={vehicleType === 'motorcycle' ? '#fff' : '#666'}
          />
          <Text style={[styles.vehicleTypeText, vehicleType === 'motorcycle' && styles.vehicleTypeTextActive]}>
            Moto
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.vehicleTypeButton, vehicleType === 'car' && styles.vehicleTypeButtonActive]}
          onPress={() => setVehicleType('car')}
        >
          <Icon
            name="car"
            size={32}
            color={vehicleType === 'car' ? '#fff' : '#666'}
          />
          <Text style={[styles.vehicleTypeText, vehicleType === 'car' && styles.vehicleTypeTextActive]}>
            Carro
          </Text>
        </TouchableOpacity>
      </View>

      {vehicleType !== 'bike' && (
        <>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Placa *</Text>
            <TextInput
              style={styles.input}
              value={vehiclePlate}
              onChangeText={(text) => setVehiclePlate(formatPlate(text))}
              placeholder="ABC-1234"
              autoCapitalize="characters"
              maxLength={8}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Marca</Text>
            <TextInput
              style={styles.input}
              value={vehicleBrand}
              onChangeText={setVehicleBrand}
              placeholder="Honda, Yamaha..."
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Modelo</Text>
            <TextInput
              style={styles.input}
              value={vehicleModel}
              onChangeText={setVehicleModel}
              placeholder="CG 160, PCX..."
            />
          </View>
        </>
      )}
    </View>
  );

  const renderStep5 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Dados Bancários</Text>
      <Text style={styles.stepSubtitle}>Para receber seus pagamentos</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Banco</Text>
        <TextInput
          style={styles.input}
          value={bankName}
          onChangeText={setBankName}
          placeholder="Nome do banco"
        />
      </View>

      <Text style={styles.label}>Tipo de Conta</Text>
      <View style={styles.accountTypes}>
        <TouchableOpacity
          style={[styles.accountTypeButton, accountType === 'checking' && styles.accountTypeButtonActive]}
          onPress={() => setAccountType('checking')}
        >
          <Text style={[styles.accountTypeText, accountType === 'checking' && styles.accountTypeTextActive]}>
            Conta Corrente
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.accountTypeButton, accountType === 'savings' && styles.accountTypeButtonActive]}
          onPress={() => setAccountType('savings')}
        >
          <Text style={[styles.accountTypeText, accountType === 'savings' && styles.accountTypeTextActive]}>
            Conta Poupança
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inputRow}>
        <View style={[styles.inputGroup, { flex: 1 }]}>
          <Text style={styles.label}>Agência</Text>
          <TextInput
            style={styles.input}
            value={agency}
            onChangeText={setAgency}
            placeholder="0000"
            keyboardType="numeric"
          />
        </View>

        <View style={[styles.inputGroup, { flex: 2, marginLeft: 12 }]}>
          <Text style={styles.label}>Conta</Text>
          <TextInput
            style={styles.input}
            value={accountNumber}
            onChangeText={setAccountNumber}
            placeholder="00000-0"
            keyboardType="numeric"
          />
        </View>
      </View>

      <View style={styles.infoBox}>
        <Icon name="shield-check" size={20} color="#4CAF50" />
        <Text style={styles.infoText}>
          Seus dados bancários são criptografados e seguros
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cadastro de Entregador</Text>
        <View style={{ width: 24 }} />
      </View>

      {renderProgressBar()}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}
        {currentStep === 5 && renderStep5()}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Footer com botões */}
      <View style={styles.footer}>
        {currentStep > 1 && (
          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary]}
            onPress={handlePreviousStep}
          >
            <Text style={styles.buttonSecondaryText}>Voltar</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.button, styles.buttonPrimary, loading && styles.buttonDisabled]}
          onPress={handleNextStep}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buttonPrimaryText}>
              {currentStep === 5 ? 'Enviar Cadastro' : 'Próximo'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#e0e0e0',
  },
  progressDotActive: {
    backgroundColor: '#FF6B35',
  },
  content: {
    flex: 1,
  },
  stepContainer: {
    paddingHorizontal: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  cepInputContainer: {
    position: 'relative',
  },
  cepLoader: {
    position: 'absolute',
    right: 16,
    top: 12,
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
  vehicleTypes: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
    marginTop: 12,
  },
  vehicleTypeButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingVertical: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#f5f5f5',
  },
  vehicleTypeButtonActive: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  vehicleTypeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginTop: 8,
  },
  vehicleTypeTextActive: {
    color: '#fff',
  },
  accountTypes: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
    marginTop: 8,
  },
  accountTypeButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  accountTypeButtonActive: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  accountTypeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  accountTypeTextActive: {
    color: '#fff',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    padding: 12,
    gap: 10,
    marginTop: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#1565C0',
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonPrimary: {
    backgroundColor: '#FF6B35',
  },
  buttonPrimaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  buttonSecondary: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  buttonSecondaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});

export default DeliverySignupScreen;
