import { View, Text, ScrollView, TouchableOpacity } from 'react-native';

export default function ProfileScreen() {
  return (
    <ScrollView className="flex-1 bg-gray-50 p-4">
      <View className="bg-white rounded-xl p-6 mb-6 items-center shadow-sm">
        <Text className="text-6xl mb-3">👤</Text>
        <Text className="text-xl font-bold text-swimming-navy">John Swimmer</Text>
        <Text className="text-gray-600">@johnswimmer</Text>
        <Text className="text-gray-600 mt-1">Swimming Team Member</Text>
      </View>

      <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
        <Text className="text-lg font-bold text-swimming-navy mb-4">
          Swimming Stats
        </Text>
        
        <View className="flex-row justify-between mb-3">
          <Text className="text-gray-600">Total Distance</Text>
          <Text className="font-semibold">45.2 km</Text>
        </View>
        
        <View className="flex-row justify-between mb-3">
          <Text className="text-gray-600">Total Sessions</Text>
          <Text className="font-semibold">23</Text>
        </View>
        
        <View className="flex-row justify-between mb-3">
          <Text className="text-gray-600">Best Time (50m Free)</Text>
          <Text className="font-semibold">24.5s</Text>
        </View>
        
        <View className="flex-row justify-between">
          <Text className="text-gray-600">Member Since</Text>
          <Text className="font-semibold">Jan 2025</Text>
        </View>
      </View>

      <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
        <Text className="text-lg font-bold text-swimming-navy mb-4">
          Settings
        </Text>
        
        <TouchableOpacity className="py-3 border-b border-gray-100">
          <Text className="text-gray-900">Edit Profile</Text>
        </TouchableOpacity>
        
        <TouchableOpacity className="py-3 border-b border-gray-100">
          <Text className="text-gray-900">Notifications</Text>
        </TouchableOpacity>
        
        <TouchableOpacity className="py-3 border-b border-gray-100">
          <Text className="text-gray-900">Privacy Settings</Text>
        </TouchableOpacity>
        
        <TouchableOpacity className="py-3">
          <Text className="text-gray-900">Help & Support</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity className="bg-red-500 rounded-xl p-4">
        <Text className="text-white text-center font-semibold text-lg">
          Logout
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
