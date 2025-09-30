import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { CommonActions } from '@react-navigation/native';

// Importe o serviço de autenticação
import { signUp } from '../services/authService';
import { useAuth } from '../contexts/AuthContext';

import AuthHeader from '../components/AuthHeader';
import FormInput from '../components/FormInput';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryLink from '../components/SecondaryLink';

const DeliverySignupScreen: React.FC = () => {
  const navigation = useNavigation();
  const { login } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [cpf, setCpf] = useState('');

  // Estados para loading e erro
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isFormValid = 
    fullName.trim() !== '' && 
    email.trim() !== '' && 
    password.trim() !== '' && 
    confirmPassword.trim() !== '' &&
    phone.trim() !== '' &&
    cpf.trim() !== '' &&
    password === confirmPassword;

  const handleSignup = async () => {
    setLoading(true);
    setError(''); // Limpa erros anteriores

    try {
      // Simular criação da conta (sem salvar no Firebase ainda)
      console.log('Dados do cadastro preparados:', { fullName, email, phone, cpf });
      
      // Navegar para tela de verificação com os dados
      navigation.navigate('DeliveryVerification' as never, {
        email: email,
        phone: phone,
        userData: {
          fullName,
          email,
          password,
          phone,
          cpf,
          role: 'entregador'
        }
      });
      
    } catch (error: any) {
      console.error('Erro no cadastro:', error);
      setError(error.message || 'Erro ao criar conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoToLogin = () => {
    navigation.navigate('DeliveryLogin' as never);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <AuthHeader />
          
          <View style={styles.content}>
            <View style={styles.headerSection}>
              <Text style={styles.title}>Seja um Entregador</Text>
              <Text style={styles.subtitle}>
                Cadastre-se e comece a ganhar dinheiro fazendo entregas
              </Text>
            </View>
            
            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}
            
            <View style={styles.form}>
              <FormInput
                placeholder="Digite seu nome completo"
                value={fullName}
                onChangeText={setFullName}
              />
              
              <FormInput
                placeholder="Digite seu e-mail"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              
              <FormInput
                placeholder="Digite seu telefone"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
              
              <FormInput
                placeholder="Digite seu CPF"
                value={cpf}
                onChangeText={setCpf}
                keyboardType="numeric"
              />
              
              <FormInput
                placeholder="Digite sua senha"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={true}
              />
              
              <FormInput
                placeholder="Confirme sua senha"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={true}
              />
            </View>
            
            <View style={styles.buttonContainer}>
              <PrimaryButton
                title={loading ? "Criando conta..." : "Criar conta de entregador"}
                onPress={handleSignup}
                disabled={!isFormValid || loading}
              />
              
              <SecondaryLink
                text="Já tem uma conta? Entre aqui"
                onPress={handleGoToLogin}
                align="center"
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    paddingTop: 40,
  },
  headerSection: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    textAlign: 'center',
  },
  form: {
    gap: 20,
    marginBottom: 32,
  },
  buttonContainer: {
    gap: 16,
  },
});

export default DeliverySignupScreen;