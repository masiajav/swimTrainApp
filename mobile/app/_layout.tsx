import 'react-native-url-polyfill/auto';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, useTheme } from '../contexts/ThemeContext';
import { LocaleProvider } from '../contexts/LocaleContext';
import { BootWrapper } from './components/BootWrapper';

function ThemedStatusBar() {
  const { isDarkMode } = useTheme();
  return <StatusBar style={isDarkMode ? "light" : "dark"} />;
}

export default function RootLayout() {
  return (
    <LocaleProvider>
      <ThemeProvider>
        <BootWrapper>
          <Stack>
            <Stack.Screen name="index" options={{ title: 'SwimTrainApp' }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="auth" options={{ headerShown: false }} />
            <Stack.Screen name="settings" options={{ headerShown: false }} />
          </Stack>
          <ThemedStatusBar />
        </BootWrapper>
      </ThemeProvider>
    </LocaleProvider>
  );
}
