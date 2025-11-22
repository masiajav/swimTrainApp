import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import i18n from '../i18n';

type Locale = 'en' | 'es';

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => Promise<void>;
  t: (key: string, params?: any) => string;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

const LOCALE_STORAGE_KEY = 'userLocale';

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');
  const [isReady, setIsReady] = useState(false);
  const [, forceUpdate] = useState(0); // Force re-render trigger

  useEffect(() => {
    loadLocale();
  }, []);

  const loadLocale = async () => {
    try {
      // Try to load saved locale
      const savedLocale = await AsyncStorage.getItem(LOCALE_STORAGE_KEY);
      
      if (savedLocale && (savedLocale === 'en' || savedLocale === 'es')) {
        setLocaleState(savedLocale);
        i18n.locale = savedLocale;
      } else {
        // Use device locale
        const deviceLocale = Localization.getLocales()[0]?.languageCode;
        const defaultLocale: Locale = deviceLocale?.startsWith('es') ? 'es' : 'en';
        setLocaleState(defaultLocale);
        i18n.locale = defaultLocale;
      }
    } catch (error) {
      console.error('Failed to load locale:', error);
      setLocaleState('en');
      i18n.locale = 'en';
    } finally {
      setIsReady(true);
    }
  };

  const setLocale = async (newLocale: Locale) => {
    try {
      await AsyncStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
      setLocaleState(newLocale);
      i18n.locale = newLocale;
      forceUpdate(prev => prev + 1); // Force re-render all consumers
    } catch (error) {
      console.error('Failed to save locale:', error);
    }
  };

  // Memoize context value to trigger re-renders when locale changes
  // t function must be recreated when locale changes
  const contextValue = useMemo(
    () => ({
      locale,
      setLocale,
      t: (key: string, params?: any) => i18n.t(key, params),
    }),
    [locale]
  );

  if (!isReady) {
    return null; // Or a loading spinner
  }

  return (
    <LocaleContext.Provider value={contextValue}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (context === undefined) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
}
