import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import { signIn } from '../services/authService';
import { useAuth } from '../contexts/AuthContext';

import AuthHeader from '../components/AuthHeader';
import FormInput from '../components/FormInput';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryLink from '../components/SecondaryLink';

const DeliveryLoginScreen: React.FC = () => {
  const navigation = useNavigation();
  const { login } = useAuth();

  // Estados do formulário
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Estados para loading e erro
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isFormValid = email.trim() !== '' && password.trim() !== '';

  const handleLogin = async () => {
    if (!isFormValid) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('🔐 Tentando fazer login com:', email);
      
      const { user, role } = await signIn(email, password);
      
      console.log('✅ Login realizado com sucesso!');
      console.log('👤 Usuário:', user.email);
      console.log('🎭 Role:', role);
      
      // Verificar se o usuário é realmente um entregador
      if (role !== 'entregador') {
        setError('Esta conta não é de entregador. Use o login de cliente.');
        setLoading(false);
        return;
      }
      
      console.log('✅ Usuário é entregador, fazendo login...');
      
      // Avisar o AuthContext que o usuário entrou
      login(user, role);
      
      console.log('🚀 Login concluído! O sistema vai redirecionar automaticamente...');
      
      // Não fazer navegação manual - deixar o RootNavigator detectar a mudança
      // de userRole e redirecionar automaticamente para a interface do entregador
      
    } catch (error: any) {
      console.error('❌ Erro no login:', error);
      
      let errorMessage = 'Erro ao fazer login. Tente novamente.';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'Usuário não encontrado. Verifique o e-mail.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Senha incorreta. Tente novamente.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'E-mail inválido. Verifique o formato.';
      } else if (error.code === 'auth/invalid-credential') {
        errorMessage = 'Credenciais inválidas. Verifique e-mail e senha.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoToSignup = () => {
    navigation.navigate('DeliverySignup' as never);
  };

  const handleForgotPassword = () => {
    Alert.alert(
      'Recuperar senha',
      'Funcionalidade em desenvolvimento. Entre em contato com o suporte.',
      [{ text: 'OK' }]
    );
  };

  // Função para preencher dados de teste
  const fillTestData = () => {
    setEmail('carlos.entregador@teste.com');
    setPassword('teste123');
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
              <Text style={styles.title}>Entrar como Entregador</Text>
              <Text style={styles.subtitle}>
                Acesse sua conta de entregador e comece a trabalhar
              </Text>
            </View>
            
            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}
            
            <View style={styles.form}>
              <FormInput
                placeholder="Digite seu e-mail"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              
              <FormInput
                placeholder="Digite sua senha"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={true}
              />
            </View>
            
            <View style={styles.buttonContainer}>
              <PrimaryButton
                title={loading ? "Entrando..." : "Entrar"}
                onPress={handleLogin}
                disabled={!isFormValid || loading}
              />
              
              <SecondaryLink
                text="Esqueci minha senha"
                onPress={handleForgotPassword}
                align="center"
              />
              
              <SecondaryLink
                text="Não tem conta? Cadastre-se aqui"
                onPress={handleGoToSignup}
                align="center"
              />
              
              {/* Botão de teste - remover em produção */}
              <SecondaryLink
                text="🧪 Preencher dados de teste"
                onPress={fillTestData}
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

export default DeliveryLoginScreen;