import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { OrderStatus } from '../types/shared';

interface StatusStep {
  status: OrderStatus;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  description: string;
}

interface OrderStatusTrackerProps {
  currentStatus: OrderStatus;
}

const steps: StatusStep[] = [
  {
    status: 'pending',
    label: 'Recebido',
    icon: 'checkmark-circle',
    description: 'Aguardando confirmação',
  },
  {
    status: 'confirmed',
    label: 'Confirmado',
    icon: 'checkmark-done',
    description: 'Restaurante aceitou',
  },
  {
    status: 'preparing',
    label: 'Preparando',
    icon: 'restaurant',
    description: 'Sendo preparado',
  },
  {
    status: 'ready',
    label: 'Pronto',
    icon: 'checkmark-done-circle',
    description: 'Pronto para entrega',
  },
  {
    status: 'in_delivery',
    label: 'A caminho',
    icon: 'bicycle',
    description: 'Saiu para entrega',
  },
  {
    status: 'delivered',
    label: 'Entregue',
    icon: 'home',
    description: 'Bom apetite!',
  },
];

const OrderStatusTracker: React.FC<OrderStatusTrackerProps> = ({ currentStatus }) => {
  const getCurrentIndex = () => {
    return steps.findIndex((s) => s.status === currentStatus);
  };

  const currentIndex = getCurrentIndex();

  // Se pedido foi cancelado, mostrar estado especial
  if (currentStatus === 'cancelled') {
    return (
      <View style={styles.cancelledContainer}>
        <View style={styles.cancelledIcon}>
          <Ionicons name="close-circle" size={40} color="#FF3B30" />
        </View>
        <Text style={styles.cancelledTitle}>Pedido Cancelado</Text>
        <Text style={styles.cancelledDescription}>
          Este pedido foi cancelado
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {steps.map((step, index) => {
        const isActive = index <= currentIndex;
        const isCurrent = index === currentIndex;
        const isCompleted = index < currentIndex;

        return (
          <View key={step.status} style={styles.stepContainer}>
            <View style={styles.stepRow}>
              {/* Círculo do status */}
              <View
                style={[
                  styles.circle,
                  isActive && styles.circleActive,
                  isCompleted && styles.circleCompleted,
                ]}
              >
                <Ionicons
                  name={step.icon}
                  size={20}
                  color={isActive ? '#FFF' : '#CCC'}
                />
              </View>

              {/* Informações do status */}
              <View style={styles.stepInfo}>
                <Text
                  style={[
                    styles.stepLabel,
                    isActive && styles.stepLabelActive,
                  ]}
                >
                  {step.label}
                </Text>
                {isCurrent && (
                  <Text style={styles.stepDescription}>{step.description}</Text>
                )}
              </View>
            </View>

            {/* Linha conectora */}
            {index < steps.length - 1 && (
              <View
                style={[
                  styles.line,
                  isCompleted && styles.lineActive,
                ]}
              />
            )}
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  stepContainer: {
    marginBottom: 8,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  circleActive: {
    backgroundColor: '#EA1D2C',
    borderColor: '#EA1D2C',
  },
  circleCompleted: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  stepInfo: {
    marginLeft: 12,
    flex: 1,
  },
  stepLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
  },
  stepLabelActive: {
    color: '#333',
  },
  stepDescription: {
    fontSize: 13,
    color: '#EA1D2C',
    marginTop: 2,
  },
  line: {
    width: 2,
    height: 24,
    backgroundColor: '#E0E0E0',
    marginLeft: 19,
    marginVertical: 2,
  },
  lineActive: {
    backgroundColor: '#4CAF50',
  },
  cancelledContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  cancelledIcon: {
    marginBottom: 12,
  },
  cancelledTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FF3B30',
    marginBottom: 4,
  },
  cancelledDescription: {
    fontSize: 14,
    color: '#666',
  },
});

export default OrderStatusTracker;

