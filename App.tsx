import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LayoutDashboard, Package, TrendingUp } from 'lucide-react-native';
import { colors } from './src/theme/colors';
import { authService } from './src/services/authService';

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

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [isReady, setIsReady] = React.useState(false);

  React.useEffect(() => {
    // Listen for Firebase Auth state changes
    const unsubscribe = authService.subscribeToAuthChanges((user) => {
      setIsAuthenticated(!!user);
      setIsReady(true);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await authService.logout();
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!isReady) {
    return null; // Or a loading spinner
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <NavigationContainer>
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
            borderTopColor: colors.slate200,
            paddingBottom: 5,
            height: 60,
          },
          headerShown: false,
        })}
      >
        <Tab.Screen name="Dashboard">
          {(props) => <Dashboard {...props} onLogout={handleLogout} />}
        </Tab.Screen>
        <Tab.Screen name="Sales" component={SalesTracker} />
        <Tab.Screen name="Inventory" component={InventoryStack} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
