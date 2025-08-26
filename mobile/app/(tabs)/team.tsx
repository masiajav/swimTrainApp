import { View, Text, ScrollView, TouchableOpacity } from 'react-native';

export default function TeamScreen() {
  const teamMembers = [
    { id: 1, name: 'Alice Johnson', role: 'Captain', avatar: '👩‍🦰' },
    { id: 2, name: 'Bob Smith', role: 'Swimmer', avatar: '👨‍🦱' },
    { id: 3, name: 'Carol Davis', role: 'Coach', avatar: '👩‍🏫' },
    { id: 4, name: 'David Wilson', role: 'Swimmer', avatar: '👨‍🦲' },
  ];

  return (
    <ScrollView className="flex-1 bg-gray-50 p-4">
      <View className="bg-swimming-blue rounded-xl p-6 mb-6">
        <Text className="text-white text-xl font-bold mb-2">
          🏊‍♀️ Swimming Team
        </Text>
        <Text className="text-blue-100">
          4 active members • 12 sessions this month
        </Text>
      </View>

      <View className="bg-white rounded-xl p-4 shadow-sm">
        <Text className="text-lg font-bold text-swimming-navy mb-4">
          Team Members
        </Text>
        
        {teamMembers.map((member) => (
          <TouchableOpacity 
            key={member.id}
            className="flex-row items-center py-3 border-b border-gray-100 last:border-b-0"
          >
            <Text className="text-2xl mr-3">{member.avatar}</Text>
            <View className="flex-1">
              <Text className="font-semibold text-gray-900">
                {member.name}
              </Text>
              <Text className="text-gray-600 text-sm">
                {member.role}
              </Text>
            </View>
            <View className="bg-swimming-teal rounded-full px-2 py-1">
              <Text className="text-white text-xs font-semibold">
                Active
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity className="bg-swimming-blue rounded-xl p-4 mt-6">
        <Text className="text-white text-center font-semibold text-lg">
          + Invite Team Member
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
