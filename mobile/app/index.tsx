import { View, Text, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { Link } from 'expo-router';

export default function WelcomeScreen() {
  return (
    <ScrollView className="flex-1">
      {/* Hero Section with Gradient Background */}
      <View className="flex-1 min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-teal-600" style={{
        backgroundColor: '#3b82f6',
        backgroundImage: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #14b8a6 100%)'
      }}>
        
        {/* Floating Elements for Visual Interest */}
        <View className="absolute top-20 right-10 w-20 h-20 bg-white/10 rounded-full animate-pulse-slow" />
        <View className="absolute top-40 left-8 w-16 h-16 bg-white/10 rounded-full animate-bounce-slow" />
        <View className="absolute bottom-32 right-6 w-12 h-12 bg-white/10 rounded-full animate-float" />
        <View className="absolute top-60 right-20 w-8 h-8 bg-white/10 rounded-full" />
        <View className="absolute bottom-60 left-12 w-6 h-6 bg-white/10 rounded-full" />
        
        {/* Main Content */}
        <View className="flex-1 justify-center items-center px-8 pt-16 pb-12">
          {/* Swimming Icon with Glow Effect */}
          <View className="mb-8 items-center">
            <View className="bg-white/20 rounded-full p-8 mb-4 shadow-2xl backdrop-blur-sm border border-white/30">
              <Text className="text-6xl">🏊‍♀️</Text>
            </View>
            <View className="h-2 w-16 bg-white/30 rounded-full shadow-glow" />
          </View>
          
          {/* App Title */}
          <View className="items-center mb-8">
            <Text className="text-5xl font-black text-white text-center mb-3 tracking-wide drop-shadow-lg">
              SwimTrainApp
            </Text>
            <View className="h-1 w-32 bg-teal-300 rounded-full mb-6 shadow-glow-teal" />
            <Text className="text-xl text-blue-100 text-center font-medium leading-relaxed px-4">
              Track your swimming training sessions{'\n'}with your team like never before ✨
            </Text>
          </View>
          
          {/* Feature Highlights */}
          <View className="w-full mb-10 px-4">
            <View className="flex-row items-center justify-center mb-4">
              <View className="bg-white/20 rounded-full p-3 mr-4 backdrop-blur-sm">
                <Text className="text-2xl">📊</Text>
              </View>
              <Text className="text-white/90 font-semibold text-lg">Track Progress & Analytics</Text>
            </View>
            <View className="flex-row items-center justify-center mb-4">
              <View className="bg-white/20 rounded-full p-3 mr-4 backdrop-blur-sm">
                <Text className="text-2xl">👥</Text>
              </View>
              <Text className="text-white/90 font-semibold text-lg">Team Collaboration</Text>
            </View>
            <View className="flex-row items-center justify-center">
              <View className="bg-white/20 rounded-full p-3 mr-4 backdrop-blur-sm">
                <Text className="text-2xl">🏆</Text>
              </View>
              <Text className="text-white/90 font-semibold text-lg">Goal Achievement</Text>
            </View>
          </View>
          
          {/* Action Buttons */}
          <View className="w-full space-y-5 max-w-sm px-4">
            <Link href="/auth/login" asChild>
              <TouchableOpacity className="bg-white rounded-2xl py-5 px-8 shadow-xl active:scale-95 transform transition-transform">
                <View className="flex-row items-center justify-center">
                  <Text className="text-swimming-blue text-center font-bold text-xl mr-3">
                    Get Started
                  </Text>
                  <Text className="text-2xl">🚀</Text>
                </View>
              </TouchableOpacity>
            </Link>
            
            <Link href="/(tabs)" asChild>
              <TouchableOpacity className="bg-white/20 border-2 border-white/40 rounded-2xl py-5 px-8 backdrop-blur-sm active:scale-95 transform transition-transform">
                <View className="flex-row items-center justify-center">
                  <Text className="text-white text-center font-bold text-xl mr-3">
                    Try Demo
                  </Text>
                  <Text className="text-2xl">👀</Text>
                </View>
              </TouchableOpacity>
            </Link>
          </View>
          
          {/* App Features Cards */}
          <View className="w-full mt-16 space-y-4 px-4">
            <View className="bg-white/15 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-xl">
              <Text className="text-white font-bold text-center mb-2 text-lg">
                🌊 Swimming-Specific Features
              </Text>
              <Text className="text-white/80 text-center leading-relaxed">
                Track strokes, laps, times, and technique improvements with specialized swimming metrics
              </Text>
            </View>
            
            <View className="bg-white/15 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-xl">
              <Text className="text-white font-bold text-center mb-2 text-lg">
                📱 Cross-Platform & Free Forever
              </Text>
              <Text className="text-white/80 text-center leading-relaxed">
                Works seamlessly on phone, tablet, and web • Always free • Open source • Privacy-first
              </Text>
            </View>
          </View>
          
          {/* Stats Preview */}
          <View className="w-full mt-12 px-4">
            <View className="flex-row justify-around">
              <View className="items-center">
                <Text className="text-3xl font-bold text-white">500+</Text>
                <Text className="text-white/70 text-sm">Sessions Tracked</Text>
              </View>
              <View className="items-center">
                <Text className="text-3xl font-bold text-white">50+</Text>
                <Text className="text-white/70 text-sm">Swimming Teams</Text>
              </View>
              <View className="items-center">
                <Text className="text-3xl font-bold text-white">10k+</Text>
                <Text className="text-white/70 text-sm">Kilometers Swum</Text>
              </View>
            </View>
          </View>
          
          {/* Footer */}
          <View className="mt-16 items-center">
            <Text className="text-white/70 text-center font-medium">
              Made with ❤️ for swimmers around the world
            </Text>
            <Text className="text-white/50 text-center text-sm mt-2">
              Free • Open Source • Privacy-First • No Ads Ever
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
