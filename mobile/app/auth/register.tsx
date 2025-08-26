import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useState } from 'react';
import { Link, router } from 'expo-router';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const handleRegister = async () => {
    if (!email || !username || !password) {
      Alert.alert('Error', 'Please fill in required fields');
      return;
    }

    try {
      // TODO: Implement actual registration logic
      console.log('Register attempt:', { email, username, firstName, lastName });
      Alert.alert('Success', 'Registration successful!');
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Error', 'Registration failed. Please try again.');
    }
  };

  return (
    <View className="flex-1 bg-blue-50 justify-center px-6">
      <View className="bg-white rounded-xl p-8 shadow-lg">
        <Text className="text-2xl font-bold text-swimming-navy text-center mb-6">
          Join SwimTrainApp! 🏊‍♀️
        </Text>
        
        <TextInput
          placeholder="Email *"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          className="border border-gray-300 rounded-lg p-4 mb-4"
        />
        
        <TextInput
          placeholder="Username *"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          className="border border-gray-300 rounded-lg p-4 mb-4"
        />
        
        <TextInput
          placeholder="First Name"
          value={firstName}
          onChangeText={setFirstName}
          className="border border-gray-300 rounded-lg p-4 mb-4"
        />
        
        <TextInput
          placeholder="Last Name"
          value={lastName}
          onChangeText={setLastName}
          className="border border-gray-300 rounded-lg p-4 mb-4"
        />
        
        <TextInput
          placeholder="Password *"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          className="border border-gray-300 rounded-lg p-4 mb-6"
        />
        
        <TouchableOpacity 
          onPress={handleRegister}
          className="bg-swimming-teal py-4 px-6 rounded-lg mb-4"
        >
          <Text className="text-white text-center font-semibold text-lg">
            Sign Up
          </Text>
        </TouchableOpacity>
        
        <Link href="/auth/login" asChild>
          <TouchableOpacity>
            <Text className="text-swimming-blue text-center">
              Already have an account? Login
            </Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
}
