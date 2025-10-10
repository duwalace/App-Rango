/**
 * DeliveryLoginScreen.tsx
 * Tela de login exclusiva para entregadores
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../services/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { getDeliveryPerson } from '../services/deliveryService';

const DeliveryLoginScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Atenção', 'Preencha todos os campos');
      return;
    }

    setLoading(true);
    try {
      // 1. Fazer login no Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Verificar se o usuário tem perfil de entregador
      const deliveryPerson = await getDeliveryPerson(user.uid);

      if (!deliveryPerson) {
        // Usuário não é entregador
        await auth.signOut();
        Alert.alert(
          'Acesso Negado',
          'Este email não está cadastrado como entregador. Por favor, complete o cadastro primeiro.'
        );
        return;
      }

      // 3. Verificar status do cadastro
      if (deliveryPerson.status === 'pending') {
        Alert.alert(
          'Cadastro em Análise',
          'Seu cadastro está sendo analisado. Você será notificado quando for aprovado.'
        );
        await auth.signOut();
        return;
      }

      if (deliveryPerson.status === 'rejected') {
        Alert.alert(
          'Cadastro Rejeitado',
          deliveryPerson.rejectionReason || 'Seu cadastro foi rejeitado. Entre em contato com o suporte para mais informações.'
        );
        await auth.signOut();
        return;
      }

      if (deliveryPerson.status === 'suspended') {
        Alert.alert(
          'Conta Suspensa',
          'Sua conta foi suspensa. Entre em contato com o suporte.'
        );
        await auth.signOut();
        return;
      }

      // 4. Login bem-sucedido - navegar para o dashboard
      console.log('✅ Login de entregador bem-sucedido:', deliveryPerson.name);
      Alert.alert(
        'Bem-vindo!',
        `Olá ${deliveryPerson.name}, você está pronto para começar!`,
        [
          {
            text: 'OK',
            onPress: () => {
              // Navegar para o dashboard do entregador
              navigation.reset({
                index: 0,
                routes: [{ name: 'DeliveryDashboard' as never }],
              });
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('Erro no login:', error);
      
      let errorMessage = 'Não foi possível fazer login. Tente novamente.';
      
      if (error.code === 'auth/invalid-email') {
        errorMessage = 'Email inválido.';
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = 'Usuário não encontrado.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Senha incorreta.';
      } else if (error.code === 'auth/invalid-credential') {
        errorMessage = 'Email ou senha incorretos.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Muitas tentativas. Tente novamente mais tarde.';
      }
      
      Alert.alert('Erro', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    Alert.alert(
      'Recuperar Senha',
      'Entre em contato com o suporte para recuperar sua senha.',
      [{ text: 'OK' }]
    );
  };

  const handleSignup = () => {
    navigation.navigate('DeliverySignup' as never);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Icon name="arrow-left" size={24} color="#333" />
            </TouchableOpacity>
          </View>

        {/* Logo e Título */}
        <View style={styles.logoSection}>
          <Icon name="bike-fast" size={64} color="#FF6B35" />
          <Text style={styles.title}>Área do Entregador</Text>
          <Text style={styles.subtitle}>Entre com sua conta</Text>
        </View>

        {/* Formulário */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputContainer}>
              <Icon name="email-outline" size={20} color="#666" style={styles.inputIcon} />
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
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Senha</Text>
            <View style={styles.inputContainer}>
              <Icon name="lock-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, styles.inputPassword]}
                value={password}
                onChangeText={setPassword}
                placeholder="Sua senha"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Icon
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color="#666"
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity onPress={handleForgotPassword}>
            <Text style={styles.forgotPassword}>Esqueceu a senha?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>Entrar</Text>
            )}
          </TouchableOpacity>

          {/* Link para cadastro */}
          <View style={styles.signupSection}>
            <Text style={styles.signupText}>Não tem conta? </Text>
            <TouchableOpacity onPress={handleSignup}>
              <Text style={styles.signupLink}>Cadastre-se</Text>
            </TouchableOpacity>
          </View>

          {/* Info sobre aprovação */}
          <View style={styles.infoBox}>
            <Icon name="information" size={20} color="#2196F3" />
            <Text style={styles.infoText}>
              Novos entregadores passam por análise antes de serem aprovados.
            </Text>
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
    backgroundColor: '#fff',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  logoSection: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
  form: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    backgroundColor: '#f8f8f8',
  },
  inputIcon: {
    paddingLeft: 16,
  },
  input: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 16,
    fontSize: 16,
    color: '#333',
  },
  inputPassword: {
    paddingRight: 50,
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    padding: 8,
  },
  forgotPassword: {
    fontSize: 14,
    color: '#FF6B35',
    textAlign: 'right',
    marginTop: -8,
    marginBottom: 24,
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  signupSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  signupText: {
    fontSize: 14,
    color: '#666',
  },
  signupLink: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: '600',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    marginTop: 32,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#1565C0',
    lineHeight: 18,
  },
});

export default DeliveryLoginScreen;
