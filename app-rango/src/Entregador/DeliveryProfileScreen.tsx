/**
 * DeliveryProfileScreen.tsx
 * Perfil completo do entregador
 * Editar dados pessoais, documentos, configurações
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { getDeliveryPerson, updateDeliveryPerson, DeliveryPerson } from '../services/deliveryService';
import { useAuth } from '../contexts/AuthContext';

const DeliveryProfileScreen = () => {
  const { usuarioLogado, logout } = useAuth();

  const [deliveryPerson, setDeliveryPerson] = useState<DeliveryPerson | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  // Estados para edição
  const [phone, setPhone] = useState('');
  const [vehiclePlate, setVehiclePlate] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    if (!usuarioLogado?.uid) return;

    try {
      const data = await getDeliveryPerson(usuarioLogado.uid);
      if (data) {
        setDeliveryPerson(data);
        setPhone(data.phone || '');
        setVehiclePlate(data.vehicle?.plate || '');
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      Alert.alert('Erro', 'Não foi possível carregar o perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!usuarioLogado?.uid) return;

    setSaving(true);
    try {
      await updateDeliveryPerson(usuarioLogado.uid, {
        phone,
        vehicle: {
          ...deliveryPerson?.vehicle,
          plate: vehiclePlate,
        },
      });

      Alert.alert('Sucesso', 'Perfil atualizado com sucesso');
      setEditing(false);
      loadProfile();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      Alert.alert('Erro', 'Não foi possível salvar as alterações');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    console.log('🔴 handleLogout chamado');
    
    // Verificar se está rodando no navegador (window.confirm existe)
    const isWeb = typeof window !== 'undefined' && typeof window.confirm === 'function';
    
    if (isWeb) {
      // No navegador web, usar confirmação nativa
      console.log('🌐 Rodando no navegador, usando window.confirm');
      const confirmed = window.confirm('Deseja realmente sair da sua conta?');
      
      if (confirmed) {
        console.log('✅ Usuário confirmou logout');
        await logout();
        console.log('✅ Logout executado');
      } else {
        console.log('❌ Usuário cancelou logout');
      }
    } else {
      // No mobile, usar Alert.alert
      console.log('📱 Rodando no mobile, usando Alert.alert');
      Alert.alert('Sair', 'Deseja realmente sair da sua conta?', [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            console.log('✅ Usuário confirmou logout (mobile)');
            await logout();
            console.log('✅ Logout executado (mobile)');
          },
        },
      ]);
    }
  };

  const getVehicleLabel = (type: string) => {
    const labels: Record<string, string> = {
      bike: 'Bicicleta',
      motorcycle: 'Moto',
      car: 'Carro',
    };
    return labels[type] || type;
  };

  const getStatusBadge = () => {
    if (!deliveryPerson) return { label: 'Carregando...', color: '#ccc', icon: 'loading' };

    const badges: Record<string, { label: string; color: string; icon: string }> = {
      pending: { label: 'Aguardando Aprovação', color: '#FF9800', icon: 'clock-alert' },
      approved: { label: 'Aprovado', color: '#4CAF50', icon: 'check-circle' },
      rejected: { label: 'Rejeitado', color: '#F44336', icon: 'close-circle' },
      blocked: { label: 'Bloqueado', color: '#F44336', icon: 'lock' },
    };

    return badges[deliveryPerson.status] || badges.pending;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
        <Text style={styles.loadingText}>Carregando perfil...</Text>
      </View>
    );
  }

  if (!deliveryPerson) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="alert-circle" size={64} color="#ccc" />
        <Text style={styles.errorText}>Perfil não encontrado</Text>
      </View>
    );
  }

  const statusBadge = getStatusBadge();

  return (
    <ScrollView style={styles.container}>
      {/* Header com avatar e status */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          {deliveryPerson.documents?.profilePhoto ? (
            <Icon name="account-circle" size={80} color="#FF6B35" />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>{deliveryPerson.name.charAt(0).toUpperCase()}</Text>
            </View>
          )}
        </View>

        <Text style={styles.headerName}>{deliveryPerson.name}</Text>
        <Text style={styles.headerEmail}>{deliveryPerson.email}</Text>

        <View style={[styles.statusBadge, { backgroundColor: statusBadge.color }]}>
          <Icon name={statusBadge.icon} size={16} color="#fff" />
          <Text style={styles.statusBadgeText}>{statusBadge.label}</Text>
        </View>
      </View>

      {/* Estatísticas */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Icon name="star" size={24} color="#FFB300" />
          <Text style={styles.statValue}>{deliveryPerson.stats?.rating?.toFixed(1) || '0.0'}</Text>
          <Text style={styles.statLabel}>Avaliação</Text>
        </View>

        <View style={styles.statBox}>
          <Icon name="package-variant" size={24} color="#2196F3" />
          <Text style={styles.statValue}>{deliveryPerson.stats?.completedDeliveries || 0}</Text>
          <Text style={styles.statLabel}>Entregas</Text>
        </View>

        <View style={styles.statBox}>
          <Icon name="cash" size={24} color="#4CAF50" />
          <Text style={styles.statValue}>R$ {deliveryPerson.stats?.totalEarnings?.toFixed(0) || 0}</Text>
          <Text style={styles.statLabel}>Ganhos</Text>
        </View>
      </View>

      {/* Informações Pessoais */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Informações Pessoais</Text>
          {!editing && (
            <TouchableOpacity onPress={() => setEditing(true)}>
              <Icon name="pencil" size={20} color="#FF6B35" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.infoRow}>
          <Icon name="card-account-details" size={20} color="#666" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>CPF</Text>
            <Text style={styles.infoValue}>{deliveryPerson.cpf}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Icon name="phone" size={20} color="#666" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Telefone</Text>
            {editing ? (
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="(00) 00000-0000"
                keyboardType="phone-pad"
              />
            ) : (
              <Text style={styles.infoValue}>{deliveryPerson.phone}</Text>
            )}
          </View>
        </View>

        <View style={styles.infoRow}>
          <Icon name="map-marker" size={20} color="#666" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Endereço</Text>
            <Text style={styles.infoValue}>
              {deliveryPerson.address.street}, {deliveryPerson.address.number}
            </Text>
            <Text style={styles.infoValueSecondary}>
              {deliveryPerson.address.neighborhood}, {deliveryPerson.address.city}/{deliveryPerson.address.state}
            </Text>
          </View>
        </View>
      </View>

      {/* Veículo */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Veículo</Text>

        <View style={styles.infoRow}>
          <Icon name="bike" size={20} color="#666" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Tipo</Text>
            <Text style={styles.infoValue}>{getVehicleLabel(deliveryPerson.vehicle.type)}</Text>
          </View>
        </View>

        {deliveryPerson.vehicle.type !== 'bike' && (
          <View style={styles.infoRow}>
            <Icon name="card-text" size={20} color="#666" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Placa</Text>
              {editing ? (
                <TextInput
                  style={styles.input}
                  value={vehiclePlate}
                  onChangeText={setVehiclePlate}
                  placeholder="ABC-1234"
                  autoCapitalize="characters"
                />
              ) : (
                <Text style={styles.infoValue}>{deliveryPerson.vehicle.plate || 'Não informado'}</Text>
              )}
            </View>
          </View>
        )}
      </View>

      {/* Botões de ação */}
      {editing && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary]}
            onPress={() => {
              setEditing(false);
              setPhone(deliveryPerson.phone || '');
              setVehiclePlate(deliveryPerson.vehicle?.plate || '');
            }}
          >
            <Text style={styles.buttonSecondaryText}>Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonPrimary, saving && styles.buttonDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.buttonPrimaryText}>Salvar</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Configurações */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Configurações</Text>

        <TouchableOpacity style={styles.menuItem}>
          <Icon name="bell" size={22} color="#666" />
          <Text style={styles.menuItemText}>Notificações</Text>
          <Icon name="chevron-right" size={22} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Icon name="help-circle" size={22} color="#666" />
          <Text style={styles.menuItemText}>Ajuda e Suporte</Text>
          <Icon name="chevron-right" size={22} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Icon name="file-document" size={22} color="#666" />
          <Text style={styles.menuItemText}>Termos de Uso</Text>
          <Icon name="chevron-right" size={22} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Icon name="shield-check" size={22} color="#666" />
          <Text style={styles.menuItemText}>Política de Privacidade</Text>
          <Icon name="chevron-right" size={22} color="#ccc" />
        </TouchableOpacity>
      </View>

      {/* Botão de Logout */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Icon name="logout" size={22} color="#F44336" />
        <Text style={styles.logoutButtonText}>Sair da Conta</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingVertical: 32,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  headerEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  statusBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginTop: 12,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
  },
  infoValueSecondary: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  input: {
    fontSize: 16,
    color: '#333',
    borderBottomWidth: 1,
    borderBottomColor: '#FF6B35',
    paddingVertical: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 16,
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonPrimary: {
    backgroundColor: '#FF6B35',
  },
  buttonPrimaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  buttonSecondary: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  buttonSecondaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    gap: 12,
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 12,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: '#F44336',
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F44336',
  },
});

export default DeliveryProfileScreen;
