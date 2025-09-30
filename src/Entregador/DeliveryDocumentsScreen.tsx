import React, { useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

import { signUp } from '../services/authService';
import { useAuth } from '../contexts/AuthContext';
import AuthHeader from '../components/AuthHeader';
import PrimaryButton from '../components/PrimaryButton';
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface DocumentItem {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  buttonText: string;
  isCompleted: boolean;
  onPress: () => void;
}

interface RouteParams {
  userData?: any;
}

const DeliveryDocumentsScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { login } = useAuth();
  const { userData } = (route.params as RouteParams) || {};
  
  // Debug: verificar se userData foi recebido
  console.log('=== DELIVERY DOCUMENTS SCREEN ===');
  console.log('route.params:', route.params);
  console.log('userData recebido:', userData);
  
  const [documents, setDocuments] = useState<DocumentItem[]>([
    {
      id: '1',
      title: 'Foto do Rosto (Selfie)',
      description: 'Foto nítida do seu rosto',
      icon: 'camera',
      buttonText: 'Tirar foto',
      isCompleted: false,
      onPress: () => handleSelfieUpload(),
    },
    {
      id: '2',
      title: 'Documento (CNH ou RG)',
      description: 'Frente e verso do seu documento',
      icon: 'document-text',
      buttonText: 'Enviar fotos',
      isCompleted: false,
      onPress: () => handleDocumentUpload(),
    },
    {
      id: '3',
      title: 'Dados do Veículo',
      description: 'Documento do veículo',
      icon: 'bicycle',
      buttonText: 'Enviar documento',
      isCompleted: false,
      onPress: () => handleVehicleUpload(),
    },
    {
      id: '4',
      title: 'Dados Bancários',
      description: 'Conta para receber seus repasses',
      icon: 'card',
      buttonText: 'Preencher dados',
      isCompleted: false,
      onPress: () => handleBankDataUpload(),
    },
  ]);

  const handleSelfieUpload = async () => {
    // Solicitar permissões
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Erro', 'Permissão para acessar a galeria é necessária!');
      return;
    }
  
    // Abrir seletor de imagem
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
  
    if (!result.canceled) {
      // Upload para Firebase Storage
      const uploadImage = async (uri: string) => {
        const response = await fetch(uri);
        const blob = await response.blob();
        const storage = getStorage();
        const imageRef = ref(storage, `documents/${Date.now()}_selfie.jpg`);
        await uploadBytes(imageRef, blob);
        return await getDownloadURL(imageRef);
      };
  
      try {
        const downloadURL = await uploadImage(result.assets[0].uri);
        updateDocumentStatus('1', true);
        Alert.alert('Sucesso', 'Selfie enviada com sucesso!');
      } catch (error) {
        Alert.alert('Erro', 'Falha ao enviar imagem. Tente novamente.');
      }
    }
  };

  const handleDocumentUpload = () => {
    Alert.alert(
      'Enviar Documento',
      'Envie a frente e verso do seu RG ou CNH:',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Câmera',
          onPress: () => {
            console.log('Abrindo câmera para documento');
            // Simular upload bem-sucedido
            setTimeout(() => {
              updateDocumentStatus('2', true);
              Alert.alert('Sucesso', 'Documento enviado com sucesso!');
            }, 1500);
          },
        },
        {
          text: 'Galeria',
          onPress: () => {
            console.log('Abrindo galeria para documento');
            // Simular upload bem-sucedido
            setTimeout(() => {
              updateDocumentStatus('2', true);
              Alert.alert('Sucesso', 'Documento enviado com sucesso!');
            }, 1500);
          },
        },
      ]
    );
  };

  const handleVehicleUpload = () => {
    Alert.alert(
      'Documento do Veículo',
      'Envie o documento do seu veículo (CRLV):',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Câmera',
          onPress: () => {
            console.log('Abrindo câmera para documento do veículo');
            // Simular upload bem-sucedido
            setTimeout(() => {
              updateDocumentStatus('3', true);
              Alert.alert('Sucesso', 'Documento do veículo enviado com sucesso!');
            }, 1500);
          },
        },
        {
          text: 'Galeria',
          onPress: () => {
            console.log('Abrindo galeria para documento do veículo');
            // Simular upload bem-sucedido
            setTimeout(() => {
              updateDocumentStatus('3', true);
              Alert.alert('Sucesso', 'Documento do veículo enviado com sucesso!');
            }, 1500);
          },
        },
      ]
    );
  };

  const handleBankDataUpload = () => {
    Alert.alert(
      'Dados Bancários',
      'Preencha seus dados bancários para receber os repasses:',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Preencher',
          onPress: () => {
            console.log('Abrindo formulário de dados bancários');
            // Simular preenchimento bem-sucedido
            setTimeout(() => {
              updateDocumentStatus('4', true);
              Alert.alert('Sucesso', 'Dados bancários salvos com sucesso!');
            }, 1000);
          },
        },
      ]
    );
  };

  const updateDocumentStatus = (id: string, isCompleted: boolean) => {
    setDocuments(prevDocs =>
      prevDocs.map(doc =>
        doc.id === id ? { ...doc, isCompleted } : doc
      )
    );
  };

  const allDocumentsCompleted = documents.every(doc => doc.isCompleted);

  const handleSubmitForReview = async () => {
    if (!allDocumentsCompleted) {
      Alert.alert(
        'Documentos Pendentes',
        'Por favor, complete todos os documentos antes de enviar para análise.',
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Enviar para Análise',
      'Seus documentos serão enviados para análise. Você receberá uma resposta em até 24 horas.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Enviar',
          onPress: async () => {
            try {
              console.log('=== INÍCIO DO PROCESSO DE ENVIO ===');
              console.log('userData recebido:', userData);
              
              // Completar o cadastro no Firebase
              if (userData) {
                console.log('userData existe, iniciando signUp...');
                console.log('Dados para signUp:', {
                  fullName: userData.fullName,
                  email: userData.email,
                  role: 'entregador'
                });
                
                const { user, role } = await signUp(
                  userData.fullName,
                  userData.email,
                  userData.password,
                  'entregador'
                );
                
                console.log('SignUp concluído com sucesso!');
                console.log('User ID:', user.uid);
                console.log('Role:', role);
                
                // Fazer login automático
                console.log('Fazendo login automático...');
                await login(user, role);
                console.log('Login automático concluído!');
              } else {
                console.log('ERRO: userData não existe!');
                Alert.alert(
                  'Erro',
                  'Dados do usuário não encontrados. Tente fazer o cadastro novamente.',
                  [{ text: 'OK' }]
                );
                return;
              }
              
              // Simular envio de documentos
              console.log('Iniciando simulação de envio de documentos...');
              setTimeout(() => {
                console.log('Navegando para DeliveryConfirmation...');
                navigation.navigate('DeliveryConfirmation' as never);
                console.log('Navegação executada!');
              }, 2000);
              
            } catch (error) {
              console.error('=== ERRO NO PROCESSO ===');
              console.error('Erro completo:', error);
              console.error('Stack trace:', (error as Error).stack);
              Alert.alert(
                'Erro',
                'Ocorreu um erro ao finalizar seu cadastro. Tente novamente.',
                [{ text: 'OK' }]
              );
            }
          },
        },
      ]
    );
  };

  const renderDocumentItem = ({ item }: { item: DocumentItem }) => (
    <View style={styles.documentItem}>
      <View style={styles.documentHeader}>
        <View style={styles.iconContainer}>
          <Ionicons 
            name={item.icon} 
            size={24} 
            color={item.isCompleted ? '#4CAF50' : '#EA1D2C'} 
          />
        </View>
        <View style={styles.documentInfo}>
          <Text style={styles.documentTitle}>{item.title}</Text>
          <Text style={styles.documentDescription}>{item.description}</Text>
        </View>
        {item.isCompleted && (
          <View style={styles.checkContainer}>
            <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
          </View>
        )}
      </View>
      
      {!item.isCompleted && (
        <TouchableOpacity style={styles.uploadButton} onPress={item.onPress}>
          <Text style={styles.uploadButtonText}>{item.buttonText}</Text>
          <Ionicons name="chevron-forward" size={16} color="#EA1D2C" />
        </TouchableOpacity>
      )}
      
      {item.isCompleted && (
        <View style={styles.completedContainer}>
          <Text style={styles.completedText}>✓ Concluído</Text>
          <TouchableOpacity style={styles.editButton} onPress={item.onPress}>
            <Text style={styles.editButtonText}>Editar</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <AuthHeader />
        
        <View style={styles.content}>
          <View style={styles.headerSection}>
            <Text style={styles.title}>Quase lá! Faltam seus documentos</Text>
            <Text style={styles.subtitle}>
              Complete todas as etapas abaixo para finalizar seu cadastro
            </Text>
          </View>

          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              {documents.filter(doc => doc.isCompleted).length} de {documents.length} concluídos
            </Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${(documents.filter(doc => doc.isCompleted).length / documents.length) * 100}%` }
                ]} 
              />
            </View>
          </View>

          <FlatList
            data={documents}
            renderItem={renderDocumentItem}
            keyExtractor={item => item.id}
            style={styles.documentsList}
            scrollEnabled={false}
          />

          <View style={styles.submitContainer}>
            <PrimaryButton
              title="Enviar para análise"
              onPress={handleSubmitForReview}
              disabled={!allDocumentsCompleted}
            />
            
            {!allDocumentsCompleted && (
              <Text style={styles.submitHint}>
                Complete todos os documentos para enviar para análise
              </Text>
            )}
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
  content: {
    flex: 1,
    padding: 24,
    paddingTop: 20,
  },
  headerSection: {
    marginBottom: 32,
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
  progressContainer: {
    marginBottom: 32,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E5E5E5',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 3,
  },
  documentsList: {
    marginBottom: 32,
  },
  documentItem: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  documentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  documentInfo: {
    flex: 1,
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  documentDescription: {
    fontSize: 14,
    color: '#666',
  },
  checkContainer: {
    marginLeft: 12,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EA1D2C',
  },
  uploadButtonText: {
    fontSize: 16,
    color: '#EA1D2C',
    fontWeight: '500',
  },
  completedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  completedText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '500',
  },
  editButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  editButtonText: {
    fontSize: 14,
    color: '#EA1D2C',
    fontWeight: '500',
  },
  submitContainer: {
    marginTop: 20,
  },
  submitHint: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 12,
  },
});

export default DeliveryDocumentsScreen;