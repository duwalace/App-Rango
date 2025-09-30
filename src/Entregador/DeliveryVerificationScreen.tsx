import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView,
  Alert,
  TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';

import { signUp } from '../services/authService';
import { useAuth } from '../contexts/AuthContext';
import AuthHeader from '../components/AuthHeader';
import PrimaryButton from '../components/PrimaryButton';

interface RouteParams {
  email?: string;
  phone?: string;
  userData?: any;
}

const DeliveryVerificationScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { login } = useAuth();
  const { email, phone, userData } = (route.params as RouteParams) || {};
  
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  
  const inputRefs = useRef<(TextInput | null)[]>([]);

  // Timer para reenvio
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => {
        setResendTimer(resendTimer - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  const handleCodeChange = (value: string, index: number) => {
    // Permitir apenas números
    if (!/^\d*$/.test(value)) return;
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Focar no próximo campo automaticamente
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    // Voltar para o campo anterior ao pressionar backspace
    if (key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const isCodeComplete = code.every(digit => digit !== '');

  const handleVerifyCode = async () => {
    if (!isCodeComplete) return;

    setLoading(true);
    
    try {
      const verificationCode = code.join('');
      console.log('Verificando código:', verificationCode);
      
      // Aqui você implementaria a lógica de verificação do código
      // Por exemplo, chamada para API de verificação
      
      // Simulando verificação
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Se a verificação for bem-sucedida, navegar para upload de documentos
      if (userData) {
        console.log('Código verificado com sucesso! Navegando para documentos...');
        
        // Navegar para tela de documentos
        navigation.navigate('DeliveryDocuments' as never, {
          userData: userData
        });
      }
      
    } catch (error) {
      console.error('Erro na verificação:', error);
      Alert.alert(
        'Erro na verificação',
        'Código inválido ou erro no cadastro. Tente novamente.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!canResend) return;

    try {
      console.log('Reenviando código para:', email || phone);
      
      // Aqui você implementaria a lógica de reenvio do código
      // Por exemplo, chamada para API de reenvio
      
      // Resetar timer
      setResendTimer(60);
      setCanResend(false);
      
      Alert.alert(
        'Código reenviado',
        `Um novo código foi enviado para ${email || phone}`,
        [{ text: 'OK' }]
      );
      
    } catch (error) {
      console.error('Erro ao reenviar código:', error);
      Alert.alert(
        'Erro',
        'Não foi possível reenviar o código. Tente novamente.',
        [{ text: 'OK' }]
      );
    }
  };

  const contactMethod = email ? 'e-mail' : 'celular';
  const contactValue = email || phone || '';

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
              <Text style={styles.title}>Verifique seu {contactMethod}</Text>
              <Text style={styles.subtitle}>
                Enviamos um código de 6 dígitos para {contactValue}
              </Text>
            </View>
            
            {/* Campo de Código */}
            <View style={styles.codeContainer}>
              <Text style={styles.codeLabel}>Digite o código</Text>
              <View style={styles.codeInputContainer}>
                {code.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={ref => inputRefs.current[index] = ref}
                    style={[
                      styles.codeInput,
                      digit ? styles.codeInputFilled : null
                    ]}
                    value={digit}
                    onChangeText={(value) => handleCodeChange(value, index)}
                    onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                    keyboardType="numeric"
                    maxLength={1}
                    textAlign="center"
                    selectTextOnFocus
                  />
                ))}
              </View>
            </View>
            
            {/* Botão de Verificação */}
            <View style={styles.buttonContainer}>
              <PrimaryButton
                title={loading ? "Verificando..." : "Verificar e continuar"}
                onPress={handleVerifyCode}
                disabled={!isCodeComplete || loading}
              />
            </View>
            
            {/* Link de Reenvio */}
            <View style={styles.resendContainer}>
              {canResend ? (
                <TouchableOpacity onPress={handleResendCode}>
                  <Text style={styles.resendLink}>
                    Não recebeu? Reenviar código
                  </Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.resendTimer}>
                  Reenviar código em {resendTimer}s
                </Text>
              )}
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
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  codeContainer: {
    marginBottom: 40,
  },
  codeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  codeInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  codeInput: {
    width: 45,
    height: 55,
    borderWidth: 2,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    backgroundColor: '#F8F8F8',
  },
  codeInputFilled: {
    borderColor: '#EA1D2C',
    backgroundColor: 'white',
  },
  buttonContainer: {
    marginBottom: 24,
  },
  resendContainer: {
    alignItems: 'center',
  },
  resendLink: {
    fontSize: 16,
    color: '#EA1D2C',
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  resendTimer: {
    fontSize: 16,
    color: '#999',
  },
});

export default DeliveryVerificationScreen;