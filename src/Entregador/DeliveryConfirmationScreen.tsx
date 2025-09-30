import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import PrimaryButton from '../components/PrimaryButton';

const DeliveryConfirmationScreen: React.FC = () => {
  const navigation = useNavigation();

  const handleDismiss = () => {
    // Fechar o fluxo de cadastro e voltar para a tela de login inicial
    navigation.navigate('AuthMain' as never);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Ilustração/Ícone Grande */}
          <View style={styles.iconContainer}>
            <View style={styles.iconBackground}>
              <Ionicons name="document-text" size={40} color="#EA1D2C" />
              <View style={styles.magnifyingGlass}>
                <Ionicons name="search" size={24} color="#4CAF50" />
              </View>
            </View>
          </View>

          {/* Título */}
          <Text style={styles.title}>Cadastro em análise</Text>

          {/* Texto Explicativo */}
          <View style={styles.textContainer}>
            <Text style={styles.description}>
              Recebemos seus dados! Nossa equipe irá analisá-los e você receberá uma notificação por e-mail e no app em até{' '}
              <Text style={styles.highlightText}>3 dias úteis</Text> com o resultado.
            </Text>
            
            <View style={styles.infoBox}>
              <View style={styles.infoItem}>
                <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                <Text style={styles.infoText}>Dados pessoais verificados</Text>
              </View>
              
              <View style={styles.infoItem}>
                <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                <Text style={styles.infoText}>Documentos recebidos</Text>
              </View>
              
              <View style={styles.infoItem}>
                <Ionicons name="time" size={20} color="#FF9800" />
                <Text style={styles.infoText}>Análise em andamento</Text>
              </View>
            </View>

            <Text style={styles.additionalInfo}>
              Enquanto isso, você pode explorar o app e conhecer melhor nossa plataforma. Assim que sua conta for aprovada, você poderá começar a receber pedidos!
            </Text>
          </View>

          {/* Botão de Confirmação */}
          <View style={styles.buttonContainer}>
            <PrimaryButton
              title="Ok, entendi"
              onPress={handleDismiss}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    minHeight: '100%',
  },
  content: {
    flex: 1,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: 40,
    alignItems: 'center',
  },
  iconBackground: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFF5F5',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderWidth: 3,
    borderColor: '#FFE5E5',
  },
  magnifyingGlass: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 24,
    textAlign: 'center',
  },
  textContainer: {
    width: '100%',
    marginBottom: 40,
  },
  description: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 32,
  },
  highlightText: {
    fontWeight: 'bold',
    color: '#EA1D2C',
  },
  infoBox: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 16,
    color: '#495057',
    marginLeft: 12,
    flex: 1,
  },
  additionalInfo: {
    fontSize: 16,
    color: '#6C757D',
    textAlign: 'center',
    lineHeight: 24,
    fontStyle: 'italic',
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 20,
  },
});

export default DeliveryConfirmationScreen;