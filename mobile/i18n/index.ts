import * as Localization from 'expo-localization';
import en from './en';
import es from './es';

type Translations = {
  [key: string]: any;
};

type Locale = 'en' | 'es';

class I18nManager {
  private translations: Record<Locale, Translations>;
  private currentLocale: Locale;
  private fallbackLocale: Locale;

  constructor(translations: Record<Locale, Translations>) {
    this.translations = translations;
    this.fallbackLocale = 'en';
    
    // Set initial locale based on device settings
    const deviceLocale = Localization.getLocales()[0]?.languageCode;
    this.currentLocale = deviceLocale?.startsWith('es') ? 'es' : 'en';
  }

  get locale(): Locale {
    return this.currentLocale;
  }

  set locale(locale: Locale) {
    if (this.translations[locale]) {
      this.currentLocale = locale;
    }
  }

  t(key: string, params?: any): string {
    const keys = key.split('.');
    let value: any = this.translations[this.currentLocale];

    // Try to get translation from current locale
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Fallback to default locale
        value = this.translations[this.fallbackLocale];
        for (const fallbackKey of keys) {
          if (value && typeof value === 'object' && fallbackKey in value) {
            value = value[fallbackKey];
          } else {
            return `[Missing: ${key}]`;
          }
        }
        break;
      }
    }

    if (typeof value === 'string') {
      // Simple parameter replacement
      if (params) {
        return value.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
          return params[paramKey] !== undefined ? String(params[paramKey]) : match;
        });
      }
      return value;
    }

    return `[Invalid: ${key}]`;
  }
}

const i18n = new I18nManager({ en, es });

export default i18n;
export { en, es };
