import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, useWindowDimensions, ScrollView } from 'react-native';
import { colors } from '../theme/colors';
import { Lock, Mail, ArrowRight } from 'lucide-react-native';
import tw from 'twrnc';

export default function Login({ onLogin }: { onLogin: () => void }) {
  const { width } = useWindowDimensions();
  const isLargeScreen = width > 768;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = () => {
    setLoading(true);
    setError('');
    
    setTimeout(() => {
      if (email === 'mira@store.com' && password === 'admin123') {
        onLogin();
      } else {
        setError('Invalid credentials. Please try again.');
        setLoading(false);
      }
    }, 1500);
  };

  return (
    <View style={tw`flex-1 bg-slate-50`}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={tw`flex-1`}
      >
        <ScrollView 
          contentContainerStyle={tw`flex-grow justify-center p-6 ${isLargeScreen ? 'bg-slate-100 p-16' : ''}`}
          showsVerticalScrollIndicator={false}
        >
          <View style={tw`w-full self-center ${isLargeScreen ? 'bg-white p-12 rounded-[40px] shadow-2xl max-w-[500px]' : 'max-w-[420px]'}`}>
            <View style={tw`items-center mb-12`}>
              <View style={[tw`w-22 h-22 rounded-3xl justify-center items-center mb-8 shadow-lg`, { backgroundColor: colors.primary }]}>
                <Text style={tw`text-5xl font-black text-white`}>M</Text>
              </View>
              <Text style={tw`text-3xl font-black text-slate-900 text-center leading-tight tracking-tighter`}>
                Mira's Sari-Sari Store
              </Text>
              <Text style={tw`text-base text-slate-500 mt-3 font-medium text-center`}>
                Manage your store with ease
              </Text>
            </View>

            <View style={tw`w-full`}>
              <View style={tw`flex-row items-center bg-slate-50 rounded-2xl mb-4 px-6 border border-slate-200 h-16`}>
                <Mail size={20} color={colors.slate400} style={tw`mr-3.5`} />
                <TextInput
                  style={tw`flex-1 h-full text-slate-900 text-base font-semibold`}
                  placeholder="Email Address"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor={colors.slate400}
                />
              </View>

              <View style={tw`flex-row items-center bg-slate-50 rounded-2xl mb-4 px-6 border border-slate-200 h-16`}>
                <Lock size={20} color={colors.slate400} style={tw`mr-3.5`} />
                <TextInput
                  style={tw`flex-1 h-full text-slate-900 text-base font-semibold`}
                  placeholder="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  placeholderTextColor={colors.slate400}
                />
              </View>

              {error ? (
                <Text style={tw`text-red-500 text-sm mb-4 text-center font-bold bg-red-50 p-3 rounded-xl overflow-hidden`}>
                  {error}
                </Text>
              ) : null}

              <TouchableOpacity 
                style={[tw`flex-row h-16 rounded-2xl justify-center items-center mt-6 shadow-md`, { backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 }]}
                onPress={handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <>
                    <Text style={tw`text-white text-lg font-extrabold mr-2.5`}>Sign In</Text>
                    <ArrowRight size={20} color="white" />
                  </>
                )}
              </TouchableOpacity>
            </View>

            <View style={tw`mt-12 items-center`}>
              <Text style={tw`text-slate-400 text-xs font-bold uppercase tracking-widest`}>
                Secure Login for Admin Only
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
