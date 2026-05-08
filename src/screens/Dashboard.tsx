import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, useWindowDimensions, Image, Modal, Dimensions, Alert, Platform, StatusBar } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import tw from 'twrnc';
import { colors } from '../theme/colors';
import { Card } from '../components/Card';
import { Menu, Bell, User, Calculator, Store, MoreVertical, Receipt, Package, LogOut, Trash2 } from 'lucide-react-native';
import { productService, Product } from '../services/productService';
import { salesService, Sale } from '../services/salesService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function Dashboard({ navigation, onLogout }: any) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [logoutMenuVisible, setLogoutMenuVisible] = useState(false);

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      if (confirm("Are you sure you want to log out?")) {
        onLogout();
      }
    } else {
      Alert.alert(
        "Logout",
        "Are you sure you want to log out?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Logout", onPress: onLogout, style: "destructive" }
        ]
      );
    }
  };

  const handleDeleteSale = (sale: Sale) => {
    const confirmDelete = async () => {
      try {
        setLoading(true);
        await salesService.deleteSale(sale);
        await fetchMetrics(); // Refresh data
      } catch (error) {
        console.error('Error deleting sale:', error);
        Alert.alert('Error', 'Failed to delete transaction.');
      } finally {
        setLoading(false);
      }
    };

    if (Platform.OS === 'web') {
      if (confirm(`Delete transaction for ${sale.items[0].productName}? This will restock the items.`)) {
        confirmDelete();
      }
    } else {
      Alert.alert(
        "Delete Transaction",
        `Are you sure you want to delete this transaction? Items will be returned to stock.`,
        [
          { text: "Cancel", style: "cancel" },
          { text: "Delete", onPress: confirmDelete, style: "destructive" }
        ]
      );
    }
  };
  
  // Calculator State
  const [calculatorVisible, setCalculatorVisible] = useState(false);
  const [calcExpression, setCalcExpression] = useState('');
  const [calcResult, setCalcResult] = useState('0');

  const handleCalcInput = (value: string) => {
    if (value === 'C') {
      setCalcExpression('');
      setCalcResult('0');
    } else if (value === '⌫') {
      setCalcExpression(prev => prev.slice(0, -1));
    } else if (value === '=') {
      try {
        const result = eval(calcExpression.replace(/×/g, '*').replace(/÷/g, '/'));
        setCalcResult(String(result));
        setCalcExpression(String(result));
      } catch (e) {
        setCalcResult('Error');
      }
    } else {
      setCalcExpression(prev => prev + value);
    }
  };

  const fetchMetrics = async () => {
    try {
      const [productsData, salesData] = await Promise.all([
        productService.getProducts(),
        salesService.getSales()
      ]);
      setProducts(productsData);
      setSales(salesData);
    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchMetrics();
    });
    return unsubscribe;
  }, [navigation]);

  const totalItems = products.length;
  const fullyStocked = products.filter(p => p.stock > 10).length;
  const needsRestock = products.filter(p => p.stock <= 5).length;

  const today = new Date().toDateString();
  const todaySales = sales.filter(s => {
    const date = s.timestamp?.toDate ? s.timestamp.toDate() : new Date(s.timestamp);
    return date.toDateString() === today;
  });
  const todayEarnings = todaySales.reduce((sum, sale) => sum + sale.totalAmount, 0);

  // Group sales by date for the last 8 days
  const last8Days = [...Array(8)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toDateString();
  }).reverse();

  const dailyTotals = last8Days.map(dateStr => {
    const daySales = sales.filter(s => {
      const saleDate = s.timestamp?.toDate ? s.timestamp.toDate() : new Date(s.timestamp);
      return saleDate.toDateString() === dateStr;
    });
    return daySales.reduce((sum, s) => sum + s.totalAmount, 0);
  });

  const maxDailySale = Math.max(...dailyTotals, 100);
  const barData = dailyTotals.map(total => (total / maxDailySale) * 60 + 5); // Base height of 5px

  if (loading) {
    return (
      <View style={tw`flex-1 w-full bg-white justify-center items-center`}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={tw`flex-1 bg-white`} edges={['top']}>
      <ScrollView 
        style={tw`flex-1 w-full bg-white`}
        contentContainerStyle={tw`pb-24`}
      >
        {/* Header */}
        <View style={[
          tw`px-6 pb-6 pt-2 flex-row items-center justify-between bg-white border-b border-slate-50`,
          { borderBottomLeftRadius: 32, borderBottomRightRadius: 32 }
        ]}>
          <View>
            <Text style={tw`text-xs font-bold text-slate-400 uppercase tracking-widest`}>Mira's Sari-Sari Store</Text>
            <Text style={tw`text-3xl font-black text-slate-900`}>Dashboard</Text>
          </View>
          <View style={tw`flex-row items-center`}>
            <TouchableOpacity 
              onPress={() => setLogoutMenuVisible(true)} 
              style={tw`w-12 h-12 rounded-2xl bg-slate-50 justify-center items-center border border-slate-100 shadow-sm`}
            >
              <User color={colors.primary} size={24} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout Menu Modal */}
        <Modal
          visible={logoutMenuVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setLogoutMenuVisible(false)}
        >
          <TouchableOpacity 
            style={tw`flex-1 bg-black/10`} 
            activeOpacity={1} 
            onPress={() => setLogoutMenuVisible(false)}
          >
            <View style={tw`absolute top-16 right-4 bg-white p-2 rounded-2xl shadow-xl border border-slate-100 w-40`}>
              <TouchableOpacity 
                style={tw`flex-row items-center p-3 rounded-xl`}
                onPress={() => {
                  setLogoutMenuVisible(false);
                  handleLogout();
                }}
              >
                <LogOut color={colors.error} size={20} />
                <Text style={tw`ml-3 text-base font-bold text-red-500`}>Logout</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>

        <View style={tw`p-4`}>
          {/* Greeting */}
          <View style={tw`mt-4 mb-6`}>
            <Text style={tw`text-3xl font-extrabold text-indigo-950`}>Kumusta, Mira!</Text>
            <Text style={tw`text-sm text-slate-500 mt-1`}>Here's your store update for today.</Text>
          </View>

          {/* Action Buttons */}
          <View style={tw`flex-row justify-between mb-6`}>
            <TouchableOpacity 
              style={tw`w-[48%] flex-row items-center justify-center py-4 rounded-xl border border-slate-200 bg-white`}
              onPress={() => setCalculatorVisible(true)}
            >
              <Calculator color={colors.onSurface} size={20} />
              <Text style={tw`text-base font-bold text-indigo-950 ml-2`}>Calculator</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={tw`w-[48%] flex-row items-center justify-center py-4 rounded-xl border border-violet-600 bg-violet-600`}
              onPress={() => navigation.navigate('Inventory')}
            >
              <Store color={colors.white} size={20} />
              <Text style={tw`text-base font-bold text-white ml-2`}>New Sale</Text>
            </TouchableOpacity>
          </View>

          <View style={tw`flex-row flex-wrap justify-between mb-6`}>
            {/* Today's Sales Card */}
            <TouchableOpacity style={tw`w-[48%] mb-4`} onPress={() => navigation.navigate('Sales')}>
              <Card style={tw`p-4 border-slate-200 flex-1`}>
                <View style={tw`flex-row justify-between items-center mb-2`}>
                  <Text style={tw`text-xs font-bold text-slate-500 tracking-wider`}>TODAY'S SALES</Text>
                  <MoreVertical color={colors.onSurface} size={20} />
                </View>
                <View style={tw`flex-row items-center mb-2`}>
                  <Text style={tw`text-2xl font-extrabold text-violet-600`}>₱{todayEarnings.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
                </View>

                {/* Simple Bar Chart */}
                <View style={tw`flex-row items-end justify-between h-16 mt-4`}>
                  {barData.map((height, index) => (
                    <View 
                      key={index} 
                      style={[
                        tw`w-[10%] rounded-sm ${index === barData.length - 1 ? 'bg-violet-600' : 'bg-slate-50'}`,
                        { height: Math.min(height, 80) }
                      ]} 
                    />
                  ))}
                </View>
              </Card>
            </TouchableOpacity>

            {/* Store Status Card */}
            <Card style={tw`p-4 border-slate-200 w-[48%] mb-4`}>
              <Text style={tw`text-xs font-bold text-slate-500 tracking-wider mb-2`}>STORE STATUS</Text>
              
              <View style={tw`flex-row justify-between items-center py-1`}>
                <Text style={tw`text-xs font-semibold text-indigo-950`}>Total Items</Text>
                <Text style={tw`text-sm font-bold text-indigo-950`}>{totalItems}</Text>
              </View>
              
              <View style={tw`h-[1px] bg-slate-50 my-1`} />

              <View style={tw`flex-row justify-between items-center py-1`}>
                <View style={tw`flex-row items-center`}>
                  <View style={tw`w-1.5 h-1.5 rounded-full bg-violet-100 mr-1.5`} />
                  <Text style={tw`text-xs font-semibold text-indigo-950`}>Fully Stocked</Text>
                </View>
                <Text style={tw`text-sm font-bold text-indigo-950`}>{fullyStocked}</Text>
              </View>

              <View style={tw`h-[1px] bg-slate-50 my-1`} />

              <View style={tw`flex-row justify-between items-center py-1`}>
                <View style={tw`flex-row items-center`}>
                  <View style={tw`w-1.5 h-1.5 rounded-full bg-violet-600 mr-1.5`} />
                  <Text style={tw`text-xs font-semibold text-violet-600`}>Needs Restock</Text>
                </View>
                <Text style={tw`text-sm font-bold text-violet-600`}>{needsRestock}</Text>
              </View>
            </Card>
          </View>

          {/* Recent Transactions */}
          <View style={tw`flex-row justify-between items-center mb-4 mt-4`}>
            <Text style={tw`text-xl font-extrabold text-indigo-950`}>Recent Transactions</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Sales')}>
              <Text style={tw`text-sm font-semibold text-violet-600`}>See All</Text>
            </TouchableOpacity>
          </View>

          {sales.length === 0 ? (
            <Card style={tw`p-8 items-center border-slate-50 bg-slate-50/50`}>
              <Receipt color={colors.slate300} size={48} />
              <Text style={tw`text-sm font-bold text-slate-400 mt-4`}>No transactions yet today</Text>
            </Card>
          ) : (
            sales.slice(0, 3).map((sale) => (
              <Card key={sale.id} style={tw`p-4 mb-2 border-slate-100`}>
              <View style={tw`flex-row items-center`}>
                <View style={tw`w-10 h-10 rounded-full bg-violet-100 justify-center items-center overflow-hidden border border-violet-100`}>
                  {sale.items[0]?.imageUrl ? (
                    <Image source={{ uri: sale.items[0].imageUrl }} style={tw`w-full h-full`} resizeMode="cover" />
                  ) : (
                    <Receipt color={colors.primary} size={20} />
                  )}
                </View>
                <View style={tw`flex-1 ml-3`}>
                  <Text style={tw`text-sm font-bold text-indigo-950`} numberOfLines={1}>
                    {sale.items.length > 1 
                      ? `${sale.items[0].productName} & ${sale.items.length - 1} more`
                      : sale.items[0].productName}
                  </Text>
                  <Text style={tw`text-xs text-slate-500`}>
                    {sale.timestamp?.toDate ? sale.timestamp.toDate().toLocaleDateString() : 'Just now'}
                  </Text>
                </View>
                <View style={tw`items-end mr-3`}>
                  <Text style={tw`text-sm font-extrabold text-indigo-950`}>₱{sale.totalAmount.toFixed(2)}</Text>
                </View>
                <TouchableOpacity onPress={() => handleDeleteSale(sale)} style={tw`p-2 bg-red-50 rounded-lg`}>
                  <Trash2 color={colors.error} size={16} />
                </TouchableOpacity>
              </View>
              <View style={tw`mt-3 pt-3 border-t border-slate-50`}>
                {sale.items.map((item, idx) => (
                  <View key={idx} style={tw`flex-row justify-between items-center mb-1`}>
                    <View style={tw`flex-row items-center`}>
                      <View style={tw`w-5 h-5 rounded bg-slate-50 justify-center items-center mr-2 overflow-hidden`}>
                        {item.imageUrl ? (
                          <Image source={{ uri: item.imageUrl }} style={tw`w-full h-full`} resizeMode="cover" />
                        ) : (
                          <Package color={colors.slate400} size={10} />
                        )}
                      </View>
                      <Text style={tw`text-xs text-slate-500`}>{item.productName} x {item.quantity}</Text>
                    </View>
                    <Text style={tw`text-xs font-semibold text-indigo-950`}>₱{item.totalPrice.toFixed(2)}</Text>
                  </View>
                ))}
              </View>
              </Card>
            ))
          )}
        </View>
      </ScrollView>
      
      {/* Calculator Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={calculatorVisible}
        onRequestClose={() => setCalculatorVisible(false)}
      >
        <View style={tw`flex-1 bg-black/50 items-center ${SCREEN_WIDTH < 768 ? 'justify-end' : 'justify-center'}`}>
          <View style={[
            tw`bg-white w-full shadow-2xl p-6 ${SCREEN_WIDTH < 768 ? 'rounded-t-3xl pb-10' : 'max-w-[360px] rounded-3xl'}`,
            { elevation: 24 }
          ]}>
            <View style={tw`flex-row justify-between items-center mb-4 ${SCREEN_WIDTH < 768 ? 'pt-1' : ''}`}>
              <Text style={tw`text-lg font-extrabold text-indigo-950`}>Store Calculator</Text>
              <TouchableOpacity onPress={() => setCalculatorVisible(false)}>
                <Text style={tw`text-sm font-bold text-violet-600`}>Close</Text>
              </TouchableOpacity>
            </View>
            
            <View style={tw`bg-slate-50 rounded-2xl p-6 mb-6 items-end border border-slate-100`}>
              <Text style={tw`text-base text-slate-500 mb-1 font-medium`}>{calcExpression || '0'}</Text>
              <Text style={tw`text-3xl font-black text-violet-600`}>= ₱{Number(calcResult).toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
            </View>
            
            <View style={tw`flex-row flex-wrap justify-between`}>
              {['7', '8', '9', '÷', '4', '5', '6', '×', '1', '2', '3', '-', '.', '0', '⌫', '+', 'C', '='].map((btn) => (
                <TouchableOpacity 
                  key={btn} 
                  style={[
                    tw`w-[23%] aspect-[1.1] bg-white rounded-xl justify-center items-center mb-2 border border-slate-200`,
                    btn === '=' ? tw`w-[74%] aspect-[2.3] bg-violet-600 border-violet-600` : null,
                    ['÷', '×', '-', '+'].includes(btn) ? tw`bg-violet-800 border-violet-800` : null,
                    ['C', '⌫'].includes(btn) ? tw`bg-red-50 border-red-100` : null
                  ]}
                  onPress={() => handleCalcInput(btn)}
                >
                  <Text style={[
                    tw`text-xl font-bold text-indigo-950`,
                    ['÷', '×', '-', '+', '='].includes(btn) ? tw`text-white` : null,
                    ['C', '⌫'].includes(btn) ? tw`text-red-500` : null
                  ]}>{btn}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
