import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useState } from 'react';
import { Link, router } from 'expo-router';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      // TODO: Implement actual login logic
      console.log('Login attempt:', { email, password });
      Alert.alert('Success', 'Login successful!');
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Error', 'Login failed. Please try again.');
    }
  };

  return (
    <View className="flex-1 bg-blue-50 justify-center px-6">
      <View className="bg-white rounded-xl p-8 shadow-lg">
        <Text className="text-2xl font-bold text-swimming-navy text-center mb-6">
          Welcome Back! 🏊‍♀️
        </Text>
        
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          className="border border-gray-300 rounded-lg p-4 mb-4"
        />
        
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          className="border border-gray-300 rounded-lg p-4 mb-6"
        />
        
        <TouchableOpacity 
          onPress={handleLogin}
          className="bg-swimming-blue py-4 px-6 rounded-lg mb-4"
        >
          <Text className="text-white text-center font-semibold text-lg">
            Login
          </Text>
        </TouchableOpacity>
        
        <Link href="/auth/register" asChild>
          <TouchableOpacity>
            <Text className="text-swimming-blue text-center">
              Don't have an account? Sign up
            </Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
}
