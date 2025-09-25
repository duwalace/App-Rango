import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import AuthHeader from '../components/AuthHeader';
import FormInput from '../components/FormInput';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryLink from '../components/SecondaryLink';

const SignupScreen: React.FC = () => {
  const navigation = useNavigation();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const isFormValid = 
    fullName.trim() !== '' && 
    email.trim() !== '' && 
    password.trim() !== '' && 
    confirmPassword.trim() !== '' &&
    password === confirmPassword;

  const handleSignup = () => {
    console.log('Cadastro:', { fullName, email, password });
    // Implementar lógica de cadastro
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
                title="Criar conta"
                onPress={handleSignup}
                disabled={!isFormValid}
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
});

export default SignupScreen;