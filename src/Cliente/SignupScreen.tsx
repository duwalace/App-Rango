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

const SignupScreen: React.FC = () => {
  const navigation = useNavigation();
  const { login } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Estados para loading e erro
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isFormValid = 
    fullName.trim() !== '' && 
    email.trim() !== '' && 
    password.trim() !== '' && 
    confirmPassword.trim() !== '' &&
    password === confirmPassword;

  const handleSignup = async () => {
    setLoading(true);
    setError(''); // Limpa erros anteriores

    try {
      // Chama a função de cadastro do nosso serviço
      const { user, role } = await signUp(fullName, email, password, 'cliente');
      console.log('Cadastro bem-sucedido!', user.uid, 'Papel:', role);
      
      // Fazer login automático após cadastro
      login(user, role);
      
      // Fechar o modal de autenticação e voltar para a tela principal
      navigation.navigate('Main' as never);
      
    } catch (err: any) {
      // Trata os erros comuns de cadastro do Firebase
      if (err.code === 'auth/email-already-in-use') {
        setError('Este e-mail já está sendo usado por outra conta.');
      } else if (err.code === 'auth/weak-password') {
        setError('A senha deve ter pelo menos 6 caracteres.');
      } else if (err.code === 'auth/invalid-email') {
        setError('E-mail inválido.');
      } else {
        setError('Ocorreu um erro ao tentar criar a conta.');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoToLogin = () => {
    navigation.navigate('Login' as never);
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
            <Text style={styles.title}>Criar nova conta</Text>
            
            <View style={styles.form}>
              {/* Exibir erro se houver */}
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
              
              <FormInput
                placeholder="Nome completo"
                value={fullName}
                onChangeText={setFullName}
              />
              
              <FormInput
                placeholder="E-mail"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
              />
              
              <FormInput
                placeholder="Crie uma senha"
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
                title={loading ? "Criando conta..." : "Criar conta"}
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
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    marginBottom: 32,
  },
  form: {
    flex: 1,
  },
  buttonContainer: {
    paddingBottom: 20,
    marginBottom: 10,
    gap: 16,
  },
  errorText: {
    color: '#EA1D2C',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
    backgroundColor: '#FFF5F5',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
});

export default SignupScreen;