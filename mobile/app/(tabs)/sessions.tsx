import { View, Text, ScrollView, TouchableOpacity } from 'react-native';

export default function SessionsScreen() {
  const sessions = [
    { 
      id: 1, 
      title: 'Morning Practice', 
      date: '2025-08-26', 
      distance: 2000,
      duration: 45,
      type: 'Training'
    },
    { 
      id: 2, 
      title: 'Sprint Training', 
      date: '2025-08-25', 
      distance: 1500,
      duration: 35,
      type: 'Sprint'
    },
    { 
      id: 3, 
      title: 'Endurance Set', 
      date: '2025-08-24', 
      distance: 3000,
      duration: 60,
      type: 'Endurance'
    },
  ];

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 p-4">
        {sessions.map((session) => (
          <TouchableOpacity 
            key={session.id}
            className="bg-white rounded-xl p-4 mb-4 shadow-sm"
          >
            <View className="flex-row justify-between items-start mb-2">
              <Text className="text-lg font-bold text-swimming-navy">
                {session.title}
              </Text>
              <View className="bg-swimming-teal rounded-full px-2 py-1">
                <Text className="text-white text-xs font-semibold">
                  {session.type}
                </Text>
              </View>
            </View>
            
            <Text className="text-gray-600 mb-3">{session.date}</Text>
            
            <View className="flex-row justify-between">
              <View className="flex-row items-center">
                <Text className="text-sm text-gray-600">Distance: </Text>
                <Text className="text-sm font-semibold">{session.distance}m</Text>
              </View>
              <View className="flex-row items-center">
                <Text className="text-sm text-gray-600">Duration: </Text>
                <Text className="text-sm font-semibold">{session.duration}min</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      <View className="p-4">
        <TouchableOpacity className="bg-swimming-blue rounded-xl p-4">
          <Text className="text-white text-center font-semibold text-lg">
            + Add New Session
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
