import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  FlatList,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

interface Transaction {
  id: string;
  type: 'earning' | 'withdrawal';
  amount: number;
  description: string;
  date: string;
  time: string;
  orderId?: string;
}

const DeliveryWalletScreen: React.FC = () => {
  const navigation = useNavigation();
  
  // Dados simulados da carteira
  const [walletData] = useState({
    availableBalance: 234.50,
    nextPayoutDate: '05/10/2025',
    nextPayoutAmount: 180.00,
    bankAccount: {
      bank: 'Banco do Brasil',
      account: '****-1234'
    }
  });

  // Dados simulados de transações
  const [transactions] = useState<Transaction[]>([
    {
      id: '1',
      type: 'earning',
      amount: 12.50,
      description: 'Corrida #54325',
      date: '30/09/2025',
      time: '14:30',
      orderId: '#54325'
    },
    {
      id: '2',
      type: 'earning',
      amount: 8.75,
      description: 'Corrida #54324',
      date: '30/09/2025',
      time: '13:15',
      orderId: '#54324'
    },
    {
      id: '3',
      type: 'earning',
      amount: 15.20,
      description: 'Corrida #54323',
      date: '30/09/2025',
      time: '12:00',
      orderId: '#54323'
    },
    {
      id: '4',
      type: 'withdrawal',
      amount: 180.00,
      description: 'Repasse para conta bancária',
      date: '29/09/2025',
      time: '09:00'
    },
    {
      id: '5',
      type: 'earning',
      amount: 9.30,
      description: 'Corrida #54322',
      date: '29/09/2025',
      time: '19:45',
      orderId: '#54322'
    },
    {
      id: '6',
      type: 'earning',
      amount: 11.80,
      description: 'Corrida #54321',
      date: '29/09/2025',
      time: '18:20',
      orderId: '#54321'
    }
  ]);

  const handleRequestPayout = () => {
    if (walletData.availableBalance < 50) {
      Alert.alert(
        'Saldo Insuficiente',
        'O valor mínimo para solicitar repasse é R$ 50,00.',
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Solicitar Repasse',
      `Deseja solicitar o repasse de ${formatCurrency(walletData.availableBalance)} para sua conta bancária?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Confirmar', 
          onPress: () => {
            console.log('Repasse solicitado');
            Alert.alert('Sucesso', 'Repasse solicitado com sucesso! O valor será transferido em até 2 dias úteis.');
          }
        }
      ]
    );
  };

  const MapsToBankAccount = () => {
    console.log('Navegar para gerenciar conta bancária');
    // Implementar navegação para tela de dados bancários
    navigation.navigate('DeliveryBankAccount' as never);
  };

  const formatCurrency = (value: number) => {
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
  };

  const formatDate = (date: string) => {
    return new Date(date.split('/').reverse().join('-')).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short'
    });
  };

  const renderTransactionItem = ({ item }: { item: Transaction }) => (
    <View style={styles.transactionItem}>
      <View style={styles.transactionIcon}>
        <Ionicons 
          name={item.type === 'earning' ? 'add-circle' : 'remove-circle'} 
          size={24} 
          color={item.type === 'earning' ? '#4CAF50' : '#FF5722'} 
        />
      </View>
      
      <View style={styles.transactionInfo}>
        <Text style={styles.transactionDescription}>{item.description}</Text>
        <Text style={styles.transactionDate}>{item.date} • {item.time}</Text>
      </View>
      
      <Text style={[
        styles.transactionAmount,
        { color: item.type === 'earning' ? '#4CAF50' : '#FF5722' }
      ]}>
        {item.type === 'earning' ? '+' : '-'} {formatCurrency(item.amount)}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Carteira</Text>
        <View style={styles.placeholder} />
      </View>

      <FlatList
        data={transactions}
        renderItem={renderTransactionItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            {/* Card de Saldo Principal */}
            <View style={styles.balanceCard}>
              <Text style={styles.balanceLabel}>Saldo Disponível</Text>
              <Text style={styles.balanceValue}>{formatCurrency(walletData.availableBalance)}</Text>
              <Text style={styles.balanceSubtext}>
                Disponível para saque
              </Text>
            </View>

            {/* Botão de Saque */}
            <TouchableOpacity style={styles.payoutButton} onPress={handleRequestPayout}>
              <Ionicons name="card-outline" size={24} color="#FFFFFF" />
              <Text style={styles.payoutButtonText}>Solicitar Repasse</Text>
            </TouchableOpacity>

            {/* Informações de Repasse */}
            <View style={styles.payoutInfoCard}>
              <View style={styles.payoutInfoHeader}>
                <Ionicons name="calendar-outline" size={20} color="#666" />
                <Text style={styles.payoutInfoTitle}>Próximo repasse agendado</Text>
              </View>
              
              <View style={styles.payoutInfoContent}>
                <Text style={styles.payoutDate}>{walletData.nextPayoutDate}</Text>
                <Text style={styles.payoutAmount}>{formatCurrency(walletData.nextPayoutAmount)}</Text>
              </View>
              
              <View style={styles.bankInfo}>
                <Ionicons name="business-outline" size={16} color="#999" />
                <Text style={styles.bankInfoText}>
                  {walletData.bankAccount.bank} • {walletData.bankAccount.account}
                </Text>
              </View>
            </View>

            {/* Gerenciar Conta Bancária */}
            <TouchableOpacity style={styles.bankAccountButton} onPress={MapsToBankAccount}>
              <Ionicons name="card" size={20} color="#EA1D2C" />
              <Text style={styles.bankAccountButtonText}>Gerenciar conta bancária</Text>
              <Ionicons name="chevron-forward" size={16} color="#EA1D2C" />
            </TouchableOpacity>

            {/* Título do Extrato */}
            <Text style={styles.extractTitle}>Extrato de Transações</Text>
          </View>
        }
        contentContainerStyle={styles.scrollContent}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 34,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  balanceCard: {
    backgroundColor: '#4CAF50',
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  balanceLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 8,
  },
  balanceValue: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  balanceSubtext: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  payoutButton: {
    backgroundColor: '#EA1D2C',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  payoutButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  payoutInfoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  payoutInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  payoutInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  payoutInfoContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  payoutDate: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  payoutAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4CAF50',
  },
  bankInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bankInfoText: {
    fontSize: 14,
    color: '#999',
    marginLeft: 6,
  },
  bankAccountButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bankAccountButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#EA1D2C',
    flex: 1,
    marginLeft: 12,
  },
  extractTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  transactionItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  transactionIcon: {
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: '#999',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
});

export default DeliveryWalletScreen;