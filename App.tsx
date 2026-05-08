import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LayoutDashboard, Package } from 'lucide-react-native';
import { colors } from './src/theme/colors';

// Screens
import Dashboard from './src/screens/Dashboard';
import InventoryList from './src/screens/InventoryList';
import ProductDetail from './src/screens/ProductDetail';
import AddItem from './src/screens/AddItem';

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
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            if (route.name === 'Dashboard') {
              return <LayoutDashboard size={size} color={color} />;
            } else if (route.name === 'Inventory') {
              return <Package size={size} color={color} />;
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
        <Tab.Screen name="Dashboard" component={Dashboard} />
        <Tab.Screen name="Inventory" component={InventoryStack} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
