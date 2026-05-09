import React from 'react';
import { Platform, View, Text, ActivityIndicator } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LayoutDashboard, Package, TrendingUp } from 'lucide-react-native';
import { colors } from './src/theme/colors';
import { authService } from './src/services/authService';
import tw from 'twrnc';

// Screens
import Dashboard from './src/screens/Dashboard';
import InventoryList from './src/screens/InventoryList';
import ProductDetail from './src/screens/ProductDetail';
import AddItem from './src/screens/AddItem';
import SalesTracker from './src/screens/SalesTracker';
import Login from './src/screens/Login';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function InventoryStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="InventoryList" component={InventoryList} />
      <Stack.Screen name="ProductDetail" component={ProductDetail} />
      <Stack.Screen name="AddItem" component={AddItem} />
    </Stack.Navigator>
  );
}

function MainTabs({ onLogout }: { onLogout: () => void }) {
  const insets = useSafeAreaInsets();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          if (route.name === 'Dashboard') {
            return <LayoutDashboard size={size} color={color} />;
          } else if (route.name === 'Inventory') {
            return <Package size={size} color={color} />;
          } else if (route.name === 'Sales') {
            return <TrendingUp size={size} color={color} />;
          }
        },
        tabBarActiveTintColor: colors.primaryContainer,
        tabBarInactiveTintColor: colors.slate500,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopWidth: 1,
          borderTopColor: colors.slate100,
          height: Platform.OS === 'web' ? 70 : 65 + (Platform.OS === 'android' ? insets.bottom : insets.bottom > 0 ? insets.bottom - 10 : 0),
          paddingBottom: Platform.OS === 'web' ? 0 : insets.bottom > 0 ? insets.bottom : 10,
          paddingTop: 8,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '700',
          marginBottom: Platform.OS === 'web' ? 5 : 4,
        },
        tabBarItemStyle: {
          backgroundColor: 'transparent',
        },
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarShowLabel: true,
        tabBarLabelPosition: 'below-icon',
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        options={{ tabBarLabel: 'Dashboard' }}
      >
        {(props) => <Dashboard {...props} onLogout={onLogout} />}
      </Tab.Screen>
      <Tab.Screen 
        name="Sales" 
        component={SalesTracker} 
        options={{ tabBarLabel: 'Tracker' }}
      />
      <Tab.Screen 
        name="Inventory" 
        component={InventoryStack} 
        options={{ tabBarLabel: 'Inventory' }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [isReady, setIsReady] = React.useState(false);

  React.useEffect(() => {
    // Listen for Firebase Auth state changes
    const unsubscribe = authService.subscribeToAuthChanges((user) => {
      setIsAuthenticated(!!user);
      setIsReady(true);
    });

    // Safety timeout: if auth doesn't respond in 3 seconds, show login anyway
    const timeout = setTimeout(() => {
      if (!isReady) setIsReady(true);
    }, 3000);

    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
  }, [isReady]);

  const handleLogout = async () => {
    try {
      await authService.logout();
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!isReady) {
    return (
      <View style={tw`flex-1 justify-center items-center bg-violet-50`}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={tw`mt-4 text-slate-500 font-bold`}>Initializing Mira Store...</Text>
      </View>
    );
  }

  return (
    <View style={tw`flex-1`}>
      <SafeAreaProvider>
        {!isAuthenticated ? (
          <Login />
        ) : (
          <NavigationContainer>
            <MainTabs onLogout={handleLogout} />
          </NavigationContainer>
        )}
      </SafeAreaProvider>
    </View>
  );
}
