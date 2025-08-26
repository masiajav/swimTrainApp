import { View, Text, ScrollView, TouchableOpacity } from 'react-native';

export default function DashboardScreen() {
  const recentSessions = [
    { id: 1, title: 'Morning Practice', date: '2025-08-26', distance: 2000 },
    { id: 2, title: 'Sprint Training', date: '2025-08-25', distance: 1500 },
    { id: 3, title: 'Endurance Set', date: '2025-08-24', distance: 3000 },
  ];

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-4">
        {/* Welcome Section */}
        <View className="bg-swimming-blue rounded-xl p-6 mb-6">
          <Text className="text-white text-xl font-bold mb-2">
            Welcome back, Swimmer! 🏊‍♀️
          </Text>
          <Text className="text-blue-100">
            Track your progress and stay motivated with your team
          </Text>
        </View>

        {/* Quick Stats */}
        <View className="flex-row justify-between mb-6">
          <View className="bg-white rounded-lg p-4 flex-1 mr-2 shadow-sm">
            <Text className="text-gray-600 text-sm">This Week</Text>
            <Text className="text-2xl font-bold text-swimming-navy">8.5km</Text>
          </View>
          <View className="bg-white rounded-lg p-4 flex-1 ml-2 shadow-sm">
            <Text className="text-gray-600 text-sm">Sessions</Text>
            <Text className="text-2xl font-bold text-swimming-navy">5</Text>
          </View>
        </View>

        {/* Recent Sessions */}
        <View className="bg-white rounded-xl p-4 shadow-sm">
          <Text className="text-lg font-bold text-swimming-navy mb-4">
            Recent Sessions
          </Text>
          
          {recentSessions.map((session) => (
            <TouchableOpacity 
              key={session.id}
              className="border-b border-gray-100 py-3 last:border-b-0"
            >
              <View className="flex-row justify-between items-center">
                <View>
                  <Text className="font-semibold text-gray-900">
                    {session.title}
                  </Text>
                  <Text className="text-gray-600 text-sm">
                    {session.date}
                  </Text>
                </View>
                <View className="bg-swimming-teal rounded-full px-3 py-1">
                  <Text className="text-white text-sm font-semibold">
                    {session.distance}m
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Actions */}
        <View className="mt-6">
          <TouchableOpacity className="bg-swimming-blue rounded-xl p-4 mb-3">
            <Text className="text-white text-center font-semibold text-lg">
              🏊‍♀️ Start New Session
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity className="bg-swimming-teal rounded-xl p-4">
            <Text className="text-white text-center font-semibold text-lg">
              👥 View Team Progress
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
