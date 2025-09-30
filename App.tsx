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

// Stack para a aba Início (quando logado)
function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="Category" component={CategoryScreen} />
      <Stack.Screen name="Store" component={StoreScreen} />
      <Stack.Screen 
        name="Product" 
        component={ProductScreen} 
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen 
        name="Cart" 
        component={CartScreen} 
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen 
        name="Address" 
        component={AddressScreen} 
        options={{ presentation: 'modal' }}
      />
    </Stack.Navigator>
  );
}

// Stack para a aba Perfil
function ProfileStack() {
  const { usuarioLogado, userRole } = useAuth();
  
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!usuarioLogado ? (
        <Stack.Screen 
          name="ProfileMain" 
          component={ProfileScreen} 
        />
      ) : userRole === 'entregador' ? (
        <Stack.Screen 
          name="ProfileMain" 
          component={DeliveryProfileScreen} 
        />
      ) : (
        <Stack.Screen 
          name="ProfileMain" 
          component={PerfilLogadoScreen} 
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
    console.log('Renderizando interface do ENTREGADOR...');
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
            } else if (route.name === 'Ganhos') {
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
        <Tab.Screen name="Entregas" component={OrdersScreen} />
        <Tab.Screen name="Ganhos" component={SearchScreen} />
        <Tab.Screen name="Perfil" component={ProfileStack} />
      </Tab.Navigator>
    );
  }
  
  // Interface padrão para clientes
  console.log('Renderizando interface do CLIENTE...');
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
    console.log('Mostrando LoadingScreen...');
    return <LoadingScreen />;
  }

  console.log('Renderizando NavigationContainer...');
  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* Sempre mostrar interface principal primeiro */}
        <Stack.Screen name="Main" component={MainNavigator} />
        <Stack.Screen 
          name="Auth" 
          component={AuthStackNavigator}
          options={{ presentation: 'modal' }}
        />
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