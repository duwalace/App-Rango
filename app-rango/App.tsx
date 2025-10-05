import React from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { CartProvider } from './src/contexts/CartContext';

// Importe suas telas
import LoginScreen from './src/Cliente/LoginScreen';
import SignupScreen from './src/Cliente/SignupScreen';
import AuthScreen from './src/Cliente/AuthScreen';
import DeliveryAuthScreen from './src/Entregador/DeliveryAuthScreen';
import DeliveryLoginScreen from './src/Entregador/DeliveryLoginScreen';
import DeliverySignupScreen from './src/Entregador/DeliverySignupScreen';
import DeliveryVerificationScreen from './src/Entregador/DeliveryVerificationScreen';
import DeliveryDocumentsScreen from './src/Entregador/DeliveryDocumentsScreen';
import DeliveryConfirmationScreen from './src/Entregador/DeliveryConfirmationScreen';
import DeliveryDashboardScreen from './src/Entregador/DeliveryDashboardScreen';
import DeliveryProfileScreen from './src/Entregador/DeliveryProfileScreen';
import DeliveryTripDetailsScreen from './src/Entregador/DeliveryTripDetailsScreen';
import DeliveryRouteScreen from './src/Entregador/DeliveryRouteScreen';
import DeliveryHistoryScreen from './src/Entregador/DeliveryHistoryScreen';
import DeliveryCompletionScreen from './src/Entregador/DeliveryCompletionScreen';
import DeliveryWalletScreen from './src/Entregador/DeliveryWalletScreen';
import LoadingScreen from './src/components/LoadingScreen';
import PerfilLogadoScreen from './src/Cliente/PerfilLogado';
import HomeScreen from './src/Cliente/HomeScreen';
import SearchScreen from './src/Cliente/SearchScreen';
import OrdersScreen from './src/Cliente/OrdersScreen';
import ProfileScreen from './src/Cliente/ProfileScreen';
import AddressScreen from './src/Cliente/AddressScreen';
import CategoryScreen from './src/Cliente/CategoryScreen';
import StoreScreen from './src/Cliente/StoreScreen';
import ProductScreen from './src/Cliente/ProductScreen';
import CartScreen from './src/Cliente/CartScreen';

// Telas de Perfil
import PersonalDataScreen from './src/Cliente/PersonalDataScreen';
import AddressesScreen from './src/Cliente/AddressesScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const AuthStack = createNativeStackNavigator();

// Stack de autenticação (para usuários não logados)
function AuthStackNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="AuthMain" component={AuthScreen} />
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Signup" component={SignupScreen} />
      <AuthStack.Screen name="DeliveryAuth" component={DeliveryAuthScreen} />
      <AuthStack.Screen name="DeliveryLogin" component={DeliveryLoginScreen} />
      <AuthStack.Screen name="DeliverySignup" component={DeliverySignupScreen} />
      <AuthStack.Screen name="DeliveryVerification" component={DeliveryVerificationScreen} />
      <AuthStack.Screen name="DeliveryDocuments" component={DeliveryDocumentsScreen} />
      <AuthStack.Screen name="DeliveryConfirmation" component={DeliveryConfirmationScreen} />
    </AuthStack.Navigator>
  );
}

// Stack da tela inicial (Home)
function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="Category" component={CategoryScreen} />
      <Stack.Screen name="Store" component={StoreScreen} />
      <Stack.Screen name="Product" component={ProductScreen} />
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen name="Address" component={AddressScreen} />
    </Stack.Navigator>
  );
}

// Stack do perfil
function ProfileStack() {
  const { usuarioLogado, userRole } = useAuth();
  
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {usuarioLogado && userRole === 'entregador' ? (
        <>
          <Stack.Screen 
            name="ProfileMain" 
            component={DeliveryProfileScreen} 
          />
        </>
      ) : usuarioLogado ? (
        <>
          <Stack.Screen 
            name="ProfileMain" 
            component={ProfileScreen} 
          />
          {/* Telas de Perfil do Cliente */}
          <Stack.Screen name="PersonalData" component={PersonalDataScreen} />
          <Stack.Screen name="Addresses" component={AddressesScreen} />
          {/* TODO: Adicionar mais telas */}
          {/* <Stack.Screen name="AddAddress" component={AddAddressScreen} />
          <Stack.Screen name="EditAddress" component={EditAddressScreen} />
          <Stack.Screen name="PaymentMethods" component={PaymentMethodsScreen} />
          <Stack.Screen name="AddPayment" component={AddPaymentScreen} />
          <Stack.Screen name="Notifications" component={NotificationsScreen} />
          <Stack.Screen name="Help" component={HelpScreen} />
          <Stack.Screen name="About" component={AboutScreen} /> */}
        </>
      ) : (
        <Stack.Screen 
          name="ProfileMain" 
          component={ProfileScreen} 
        />
      )}
    </Stack.Navigator>
  );
}



// Navegador principal que sempre mostra as abas
function MainNavigator() {
  const { userRole, usuarioLogado } = useAuth();
  
  console.log('=== MAINNAVIGATOR RENDER ===');
  console.log('UserRole:', userRole);
  console.log('UsuarioLogado:', usuarioLogado?.email || 'null');
  
  // Se for entregador, mostrar interface específica
  if (userRole === 'entregador') {
    console.log('🚚 Renderizando interface do ENTREGADOR...');
    return (
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap;

            if (route.name === 'Dashboard') {
              iconName = focused ? 'speedometer' : 'speedometer-outline';
            } else if (route.name === 'Entregas') {
              iconName = focused ? 'bicycle' : 'bicycle-outline';
            } else if (route.name === 'Carteira') {
              iconName = focused ? 'wallet' : 'wallet-outline';
            } else if (route.name === 'Perfil') {
              iconName = focused ? 'person' : 'person-outline';
            } else {
              iconName = 'speedometer-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#EA1D2C',
          tabBarInactiveTintColor: 'gray',
          tabBarStyle: {
            backgroundColor: 'white',
            borderTopWidth: 1,
            borderTopColor: '#E5E5E5',
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
          },
        })}
      >
        <Tab.Screen name="Dashboard" component={DeliveryDashboardScreen} />
        <Tab.Screen name="Entregas" component={DeliveryHistoryScreen} />
        <Tab.Screen name="Carteira" component={DeliveryWalletScreen} />
        <Tab.Screen name="Perfil" component={ProfileStack} />
      </Tab.Navigator>
    );
  }
  
  // Interface padrão para clientes
  console.log('👤 Renderizando interface do CLIENTE...');
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Início') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Busca') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'Pedidos') {
            iconName = focused ? 'receipt' : 'receipt-outline';
          } else if (route.name === 'Perfil') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'home-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#EA1D2C',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#E5E5E5',
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      })}
    >
      <Tab.Screen name="Início" component={HomeStack} />
      <Tab.Screen name="Busca" component={SearchScreen} />
      <Tab.Screen name="Pedidos" component={OrdersScreen} />
      <Tab.Screen name="Perfil" component={ProfileStack} />
    </Tab.Navigator>
  );
}

// O "GPS" principal que decide qual navegador mostrar
function RootNavigator() {
  const { loading, usuarioLogado, userRole } = useAuth();

  console.log('=== ROOTNAVIGATOR RENDER ===');
  console.log('Loading:', loading);
  console.log('UsuarioLogado:', usuarioLogado?.email || 'null');
  console.log('UserRole:', userRole);

  if (loading) {
    console.log('⏳ Mostrando LoadingScreen...');
    return <LoadingScreen />;
  }

  // Se não há usuário logado, mostrar tela de autenticação
  if (!usuarioLogado) {
    console.log('🔐 Usuário não logado, mostrando AuthStackNavigator...');
    return (
      <NavigationContainer>
        <StatusBar style="dark" />
        <AuthStackNavigator />
      </NavigationContainer>
    );
  }

  console.log('✅ Usuário logado, renderizando NavigationContainer com MainNavigator...');
  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={MainNavigator} />
        <Stack.Screen 
          name="Auth" 
          component={AuthStackNavigator}
          options={{ presentation: 'modal' }}
        />
        {/* Telas específicas do entregador */}
        <Stack.Screen name="DeliveryTripDetails" component={DeliveryTripDetailsScreen} />
        <Stack.Screen name="DeliveryRoute" component={DeliveryRouteScreen} />
        <Stack.Screen name="DeliveryHistory" component={DeliveryHistoryScreen} />
        <Stack.Screen name="DeliveryCompletion" component={DeliveryCompletionScreen} />
        <Stack.Screen name="DeliveryWallet" component={DeliveryWalletScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// O componente App principal que "veste" tudo com os contextos
export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <CartProvider>
          <RootNavigator />
        </CartProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}