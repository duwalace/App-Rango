import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import AuthHeader from '../components/AuthHeader';
import FormInput from '../components/FormInput';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryLink from '../components/SecondaryLink';

const LoginScreen: React.FC = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const isFormValid = email.trim() !== '' && password.trim() !== '';

  const handleLogin = () => {
    console.log('Login:', { email, password });
    // Implementar lógica de login
  };

  const handleForgotPassword = () => {
    console.log('Esqueci minha senha');
    // Implementar navegação para tela de recuperação de senha
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
            <Text style={styles.title}>Entrar na sua conta</Text>
            
            <View style={styles.form}>
              <FormInput
                placeholder="E-mail"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
              />
              
              <FormInput
                placeholder="Senha"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={true}
              />
              
              <SecondaryLink
                text="Esqueci minha senha"
                onPress={handleForgotPassword}
                align="right"
              />
            </View>
            
            <View style={styles.buttonContainer}>
              <PrimaryButton
                title="Entrar"
                onPress={handleLogin}
                disabled={!isFormValid}
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
  },
});

export default LoginScreen;