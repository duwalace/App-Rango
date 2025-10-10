import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  TouchableOpacity,
  Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const DeliveryHelpScreen: React.FC = () => {
  const handleWhatsApp = () => {
    Linking.openURL('https://wa.me/5511999999999');
  };

  const handleEmail = () => {
    Linking.openURL('mailto:suporte@rappy.com.br');
  };

  const helpTopics = [
    {
      icon: 'bicycle',
      title: 'Como aceitar uma entrega?',
      description: 'Quando estiver online, você receberá notificações de novas entregas disponíveis.',
    },
    {
      icon: 'cash',
      title: 'Como recebo meus pagamentos?',
      description: 'Os pagamentos são processados semanalmente e depositados na sua conta bancária cadastrada.',
    },
    {
      icon: 'location',
      title: 'Como funciona a navegação?',
      description: 'Use o GPS integrado para navegar até o restaurante e depois até o cliente.',
    },
    {
      icon: 'shield-checkmark',
      title: 'Segurança durante as entregas',
      description: 'Dicas de segurança e o que fazer em caso de problemas.',
    },
    {
      icon: 'star',
      title: 'Sistema de avaliações',
      description: 'Como funciona e como melhorar sua nota.',
    },
    {
      icon: 'time',
      title: 'Horários e disponibilidade',
      description: 'Gerencie seus horários e defina quando quer trabalhar.',
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Central de Ajuda</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Contato Rápido */}
        <View style={styles.quickContactSection}>
          <Text style={styles.sectionTitle}>Precisa de ajuda imediata?</Text>
          
          <View style={styles.contactButtons}>
            <TouchableOpacity style={styles.contactButton} onPress={handleWhatsApp}>
              <Ionicons name="logo-whatsapp" size={24} color="#FFF" />
              <Text style={styles.contactButtonText}>WhatsApp</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.contactButton, styles.contactButtonSecondary]} onPress={handleEmail}>
              <Ionicons name="mail" size={24} color="#FF6B35" />
              <Text style={[styles.contactButtonText, styles.contactButtonTextSecondary]}>Email</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tópicos de Ajuda */}
        <View style={styles.topicsSection}>
          <Text style={styles.sectionTitle}>Tópicos frequentes</Text>
          
          {helpTopics.map((topic, index) => (
            <TouchableOpacity key={index} style={styles.topicItem}>
              <View style={styles.topicIcon}>
                <Ionicons name={topic.icon as any} size={24} color="#FF6B35" />
              </View>
              
              <View style={styles.topicContent}>
                <Text style={styles.topicTitle}>{topic.title}</Text>
                <Text style={styles.topicDescription}>{topic.description}</Text>
              </View>
              
              <Ionicons name="chevron-forward" size={20} color="#CCC" />
            </TouchableOpacity>
          ))}
        </View>

        {/* FAQ */}
        <View style={styles.faqSection}>
          <Text style={styles.sectionTitle}>Perguntas Frequentes</Text>
          
          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>Como me torno um entregador?</Text>
            <Text style={styles.faqAnswer}>
              Complete o cadastro no app, envie seus documentos e aguarde a aprovação. O processo leva até 48 horas.
            </Text>
          </View>
          
          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>Posso escolher quando trabalhar?</Text>
            <Text style={styles.faqAnswer}>
              Sim! Você tem total flexibilidade para escolher seus horários de trabalho. Basta ficar online quando quiser trabalhar.
            </Text>
          </View>
          
          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>Quanto posso ganhar?</Text>
            <Text style={styles.faqAnswer}>
              Seus ganhos variam de acordo com o número de entregas realizadas, distância percorrida e horários de pico. Entregadores ativos podem ganhar entre R$ 50 a R$ 150 por dia.
            </Text>
          </View>
        </View>

        {/* Informações de Suporte */}
        <View style={styles.supportInfo}>
          <Text style={styles.supportTitle}>Suporte Rappy</Text>
          <View style={styles.supportItem}>
            <Ionicons name="time-outline" size={20} color="#666" />
            <Text style={styles.supportText}>Segunda a Sábado, 8h às 20h</Text>
          </View>
          <View style={styles.supportItem}>
            <Ionicons name="call-outline" size={20} color="#666" />
            <Text style={styles.supportText}>(11) 9999-9999</Text>
          </View>
          <View style={styles.supportItem}>
            <Ionicons name="mail-outline" size={20} color="#666" />
            <Text style={styles.supportText}>suporte@rappy.com.br</Text>
          </View>
        </View>

        {/* Espaçamento para SafeArea inferior */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
  scrollView: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  quickContactSection: {
    padding: 16,
    backgroundColor: '#FFF',
    marginBottom: 8,
  },
  contactButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  contactButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B35',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  contactButtonSecondary: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#FF6B35',
  },
  contactButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  contactButtonTextSecondary: {
    color: '#FF6B35',
  },
  topicsSection: {
    padding: 16,
    backgroundColor: '#FFF',
    marginBottom: 8,
  },
  topicItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  topicIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0F9F4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  topicContent: {
    flex: 1,
  },
  topicTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
    marginBottom: 4,
  },
  topicDescription: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
  faqSection: {
    padding: 16,
    backgroundColor: '#FFF',
    marginBottom: 8,
  },
  faqItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  faqQuestion: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
  },
  supportInfo: {
    padding: 16,
    backgroundColor: '#FFF',
    marginBottom: 24,
  },
  supportTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  supportItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  supportText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
  },
});

export default DeliveryHelpScreen;

