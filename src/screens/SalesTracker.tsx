import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, FlatList, useWindowDimensions, Image, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import tw from 'twrnc';
import { colors } from '../theme/colors';
import { Card } from '../components/Card';
import { TrendingUp, Receipt, Package, Trash2 } from 'lucide-react-native';
import { salesService, Sale } from '../services/salesService';

export default function SalesTracker({ navigation }: any) {
  const { width } = useWindowDimensions();
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'Today' | 'Weekly' | 'Monthly' | 'Total'>('Today');

  const fetchSales = async () => {
    try {
      const data = await salesService.getSales();
      setSales(data);
    } catch (error) {
      console.error('Error fetching sales:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSale = (sale: Sale) => {
    const confirmDelete = async () => {
      try {
        setLoading(true);
        await salesService.deleteSale(sale);
        await fetchSales(); // Refresh data
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

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchSales();
    });
    return unsubscribe;
  }, [navigation]);

  // Filtering Logic
  const filteredSales = sales.filter(s => {
    if (period === 'Total') return true;
    const saleDate = s.timestamp?.toDate ? s.timestamp.toDate() : new Date(s.timestamp);
    const now = new Date();
    
    if (period === 'Today') {
      return saleDate.toDateString() === now.toDateString();
    }
    if (period === 'Weekly') {
      const weekAgo = new Date();
      weekAgo.setDate(now.getDate() - 7);
      return saleDate >= weekAgo;
    }
    if (period === 'Monthly') {
      return saleDate.getMonth() === now.getMonth() && saleDate.getFullYear() === now.getFullYear();
    }
    return true;
  });

  const totalEarnings = filteredSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
  const totalSalesCount = filteredSales.length;

  const renderSaleItem = ({ item }: { item: Sale }) => {
    const date = item.timestamp?.toDate ? item.timestamp.toDate() : new Date(item.timestamp);
    return (
      <Card style={tw`p-4 mb-2 border-slate-200`}>
        <View style={tw`flex-row items-center`}>
          <View style={tw`w-12 h-12 rounded-full bg-slate-50 justify-center items-center overflow-hidden border border-slate-100`}>
            {item.items[0]?.imageUrl ? (
              <Image source={{ uri: item.items[0].imageUrl }} style={tw`w-full h-full`} resizeMode="cover" />
            ) : (
              <View style={tw`w-10 h-10 rounded-full bg-violet-100 justify-center items-center`}>
                <Receipt color={colors.primary} size={20} />
              </View>
            )}
          </View>
          <View style={tw`flex-1 ml-3`}>
            <Text style={tw`text-base font-bold text-indigo-950`} numberOfLines={1}>
              {item.items.length > 1 
                ? `${item.items[0].productName} & ${item.items.length - 1} more`
                : item.items[0].productName}
            </Text>
            <Text style={tw`text-xs text-slate-500`}>{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {date.toLocaleDateString()}</Text>
          </View>
          <View style={tw`items-end mr-3`}>
            <Text style={tw`text-base font-extrabold text-indigo-950`}>₱{item.totalAmount.toFixed(2)}</Text>
          </View>
          <TouchableOpacity onPress={() => handleDeleteSale(item)} style={tw`p-2 bg-red-50 rounded-lg`}>
            <Trash2 color={colors.error} size={18} />
          </TouchableOpacity>
        </View>
        <View style={tw`mt-3 pt-3 border-t border-slate-50`}>
          {item.items.map((prod, idx) => (
            <View key={idx} style={tw`flex-row justify-between mb-1`}>
              <View style={tw`flex-row items-center`}>
                <View style={tw`w-7 h-7 rounded-md bg-slate-50 justify-center items-center mr-2 overflow-hidden`}>
                  {prod.imageUrl ? (
                    <Image source={{ uri: prod.imageUrl }} style={tw`w-full h-full`} resizeMode="cover" />
                  ) : (
                    <Package color={colors.slate400} size={14} />
                  )}
                </View>
                <Text style={tw`text-sm text-slate-500`}>{prod.productName} x {prod.quantity}</Text>
              </View>
              <Text style={tw`text-sm font-semibold text-indigo-950`}>₱{prod.totalPrice.toFixed(2)}</Text>
            </View>
          ))}
        </View>
      </Card>
    );
  };

  if (loading) {
    return (
      <View style={tw`flex-1 justify-center items-center bg-violet-50`}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={tw`flex-1 bg-white`} edges={['top']}>
      <View style={tw`flex-1 w-full bg-violet-50`}>
        <View style={tw`px-6 pb-6 pt-4 flex-row justify-between items-center bg-white border-b border-slate-100`}>
          <View>
            <Text style={tw`text-xs font-bold text-slate-400 uppercase tracking-widest`}>Financial Reports</Text>
            <Text style={tw`text-3xl font-black text-indigo-950`}>Sales Tracker</Text>
          </View>
          <View style={tw`w-12 h-12 rounded-2xl bg-violet-50 justify-center items-center border border-violet-100 shadow-sm`}>
            <TrendingUp color={colors.primary} size={24} />
          </View>
        </View>

        <ScrollView style={tw`p-4`}>
          {/* Period Selector */}
          <View style={tw`flex-row bg-white rounded-2xl p-1.5 mb-6 border border-slate-100 shadow-sm`}>
            {['Today', 'Weekly', 'Monthly', 'Total'].map((p) => (
              <TouchableOpacity 
                key={p} 
                style={[tw`flex-1 py-2.5 items-center rounded-xl`, period === p && tw`bg-violet-600 shadow-sm`]}
                onPress={() => setPeriod(p as any)}
              >
                <Text style={[tw`text-xs font-bold text-slate-400`, period === p && tw`text-white`]}>{p}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Summary Stats */}
          <View style={tw`flex-row justify-between mb-4`}>
            <Card style={[tw`w-[48%] p-4 rounded-2xl`, { backgroundColor: colors.primary }]}>
              <Text style={tw`text-[10px] font-bold text-white opacity-80 tracking-wide`}>{period.toUpperCase()} EARNINGS</Text>
              <Text style={tw`text-2xl font-extrabold text-white my-1`}>₱{totalEarnings.toLocaleString()}</Text>
              <View style={tw`flex-row items-center`}>
                <TrendingUp color={colors.white} size={14} />
                <Text style={tw`text-[10px] font-semibold text-white ml-1`}>Live Data</Text>
              </View>
            </Card>
            
            <Card style={tw`w-[48%] p-4 rounded-2xl border-slate-100 bg-white`}>
              <Text style={tw`text-[10px] font-bold text-slate-500 tracking-wide`}>ORDERS</Text>
              <Text style={tw`text-2xl font-extrabold text-indigo-950 my-1`}>{totalSalesCount}</Text>
              <View style={tw`flex-row items-center`}>
                <Receipt color={colors.primary} size={14} />
                <Text style={tw`text-[10px] font-semibold text-violet-600 ml-1`}>{period} Count</Text>
              </View>
            </Card>
          </View>

          <View style={tw`flex-row justify-between items-center mb-4`}>
            <Text style={tw`text-lg font-bold text-indigo-950`}>{period} Transactions</Text>
          </View>

          {filteredSales.length === 0 ? (
            <View style={tw`items-center justify-center py-16`}>
              <Receipt color={colors.slate200} size={64} />
              <Text style={tw`mt-4 text-base text-slate-500 font-medium`}>No sales for this period.</Text>
            </View>
          ) : (
            <FlatList
              data={filteredSales}
              renderItem={renderSaleItem}
              keyExtractor={item => item.id || Math.random().toString()}
              scrollEnabled={false}
              contentContainerStyle={tw`pb-12`}
            />
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
