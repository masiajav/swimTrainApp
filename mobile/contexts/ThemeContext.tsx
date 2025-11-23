import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { View, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ThemeColors {
  background: string;
  surface: string;
  primary: string;
  secondary: string;
  text: string;
  textSecondary: string;
  border: string;
  card: string;
  success: string;
  warning: string;
  error: string;
  shadow: string;
}

interface ThemeContextType {
  isDarkMode: boolean;
  colors: ThemeColors;
  toggleDarkMode: () => Promise<void>;
  setDarkMode: (enabled: boolean) => Promise<void>;
}

const lightColors: ThemeColors = {
  background: '#f8fafc',
  surface: '#ffffff',
  primary: '#3b82f6',
  secondary: '#64748b',
  text: '#1f2937',
  textSecondary: '#6b7280',
  border: '#e2e8f0',
  card: '#ffffff',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  shadow: '#000000',
};

const darkColors: ThemeColors = {
  background: '#0f172a',
  surface: '#1e293b',
  primary: '#60a5fa',
  secondary: '#94a3b8',
  text: '#f8fafc',
  textSecondary: '#cbd5e1',
  border: '#334155',
  card: '#1e293b',
  success: '#34d399',
  warning: '#fbbf24',
  error: '#f87171',
  shadow: '#000000',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const DARK_MODE_KEY = '@lapster:darkMode';

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDarkModePreference();
  }, []);

  const loadDarkModePreference = async () => {
    try {
      const stored = await AsyncStorage.getItem(DARK_MODE_KEY);
      if (stored !== null) {
        setIsDarkMode(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading dark mode preference:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveDarkModePreference = async (enabled: boolean) => {
    try {
      await AsyncStorage.setItem(DARK_MODE_KEY, JSON.stringify(enabled));
    } catch (error) {
      console.error('Error saving dark mode preference:', error);
    }
  };

  const toggleDarkMode = async () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    await saveDarkModePreference(newMode);
  };

  const setDarkMode = async (enabled: boolean) => {
    setIsDarkMode(enabled);
    await saveDarkModePreference(enabled);
  };

  const colors = isDarkMode ? darkColors : lightColors;

  // Show a minimal loading screen while theme loads
  if (isLoading) {
    return (
      <View style={{ 
        flex: 1, 
        backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <Text style={{ color: isDarkMode ? '#f8fafc' : '#1f2937' }}>Loading...</Text>
      </View>
    );
  }

  return (
    <ThemeContext.Provider 
      value={{ 
        isDarkMode, 
        colors, 
        toggleDarkMode, 
        setDarkMode 
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
