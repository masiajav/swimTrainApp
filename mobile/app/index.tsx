import { View, Text, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';

export default function HomePage() {
  return (
    <View className="flex-1 bg-blue-50 justify-center items-center px-6">
      <View className="bg-white rounded-xl p-8 shadow-lg w-full max-w-sm">
        <Text className="text-3xl font-bold text-swimming-navy text-center mb-2">
          🏊‍♀️ SwimTrainApp
        </Text>
        <Text className="text-gray-600 text-center mb-8">
          Track your swimming training sessions with your team
        </Text>
        
        <Link href="/auth/login" asChild>
          <TouchableOpacity className="bg-swimming-blue py-4 px-6 rounded-lg mb-4">
            <Text className="text-white text-center font-semibold text-lg">
              Login
            </Text>
          </TouchableOpacity>
        </Link>
        
        <Link href="/auth/register" asChild>
          <TouchableOpacity className="bg-swimming-teal py-4 px-6 rounded-lg">
            <Text className="text-white text-center font-semibold text-lg">
              Sign Up
            </Text>
          </TouchableOpacity>
        </Link>
      </View>
      
      <Text className="text-swimming-navy mt-8 text-center">
        Open-source swimming training tracker
      </Text>
    </View>
  );
}
