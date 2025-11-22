# 🌍 Internationalization (i18n) Implementation

SwimTrainApp now supports multiple languages! This document explains how the i18n system works and how to add new translations or languages.

## 📋 Supported Languages

- 🇺🇸 **English** (en) - Default
- 🇪🇸 **Spanish** (es)

## 🏗️ Architecture

### File Structure

```
mobile/
├── i18n/
│   ├── index.ts          # i18n configuration
│   ├── en.ts             # English translations
│   └── es.ts             # Spanish translations
└── contexts/
    └── LocaleContext.tsx # Language state management
```

### How It Works

1. **LocaleContext**: Manages the current language preference
2. **AsyncStorage**: Persists language choice across app sessions
3. **Device Language Detection**: Auto-detects device language on first launch
4. **Fallback System**: Falls back to English if translation is missing

## 🚀 Usage

### In Components

```typescript
import { useLocale } from '../contexts/LocaleContext';

export default function MyComponent() {
  const { t, locale, setLocale } = useLocale();
  
  return (
    <View>
      <Text>{t('auth.welcomeBack')}</Text>
      <Text>{t('dashboard.weeklyStats')}</Text>
    </View>
  );
}
```

### Translation Keys

Translations are organized by feature area:

```typescript
// Authentication
t('auth.email')              // "📧 Email" / "📧 Correo electrónico"
t('auth.password')           // "🔒 Password" / "🔒 Contraseña"
t('auth.signIn')             // "🏊‍♀️ Sign In" / "🏊‍♀️ Iniciar sesión"

// Dashboard
t('dashboard.weeklyStats')   // "Weekly Stats" / "Estadísticas semanales"
t('dashboard.distance')      // "Distance" / "Distancia"

// Sessions
t('sessions.createSession')  // "Create Session" / "Crear sesión"
t('workoutTypes.WARMUP')     // "Warm Up" / "Calentamiento"
t('strokes.FREESTYLE')       // "Freestyle" / "Libre"

// Common
t('common.save')             // "Save" / "Guardar"
t('common.cancel')           // "Cancel" / "Cancelar"
```

## ➕ Adding New Translations

### To Add a New Translation Key

1. Add to `mobile/i18n/en.ts`:
```typescript
export default {
  myFeature: {
    myKey: 'My English Text',
  },
};
```

2. Add to `mobile/i18n/es.ts`:
```typescript
export default {
  myFeature: {
    myKey: 'Mi texto en español',
  },
};
```

3. Use in component:
```typescript
t('myFeature.myKey')
```

### To Add a New Language

1. Create new translation file `mobile/i18n/[code].ts` (e.g., `fr.ts` for French):
```typescript
export default {
  common: {
    loading: 'Chargement...',
    save: 'Enregistrer',
    // ... all other keys
  },
  // ... all other sections
};
```

2. Update `mobile/i18n/index.ts`:
```typescript
import fr from './fr';

const i18n = new I18n({
  en,
  es,
  fr,  // Add new language
});
```

3. Update LocaleContext type in `mobile/contexts/LocaleContext.tsx`:
```typescript
type Locale = 'en' | 'es' | 'fr';
```

4. Add language selector in settings:
```typescript
<TouchableOpacity 
  onPress={() => setLocale('fr')}
>
  <Text>🇫🇷 Français</Text>
</TouchableOpacity>
```

## 🔄 Language Switching

Users can change language in **Settings**:
1. Navigate to Settings screen
2. Find "Language / Idioma" section
3. Tap on desired language button
4. App updates immediately

The choice is persisted in AsyncStorage and remembered across app sessions.

## 🎯 Best Practices

### DO ✅

- **Use semantic keys**: `auth.signIn` instead of `signInButton`
- **Group by feature**: Keep related translations together
- **Include context**: `sessions.deleteConfirm` not just `confirm`
- **Keep consistent**: Use same terminology across translations
- **Test both languages**: Ensure UI doesn't break with longer text

### DON'T ❌

- **Don't hardcode text**: Use `t()` function instead
- **Don't split sentences**: Translate complete phrases, not fragments
- **Don't assume word order**: Different languages have different grammar
- **Don't forget plurals**: Some languages need special plural handling
- **Don't mix languages**: Don't put English text in Spanish translations

## 📝 Translation Coverage

### Fully Translated Screens

- ✅ Login Screen
- ✅ Settings Screen (partial)
- 🔄 Register Screen (in progress)
- ⏳ Dashboard (pending)
- ⏳ Sessions (pending)
- ⏳ Team (pending)
- ⏳ Profile (pending)

## 🔍 Finding Missing Translations

If a translation key is missing, the system will:
1. Try to find it in the current language
2. Fall back to English
3. Display the key itself if not found: `[Missing: key.name]`

## 🛠️ Development Tips

### Hot Reloading

Changes to translation files require restarting the Metro bundler:
```bash
npx expo start --clear
```

### Testing Different Languages

```typescript
// Temporarily force a language for testing
import i18n from '../i18n';
i18n.locale = 'es';
```

### Debugging

Enable console logs in LocaleContext to see language changes:
```typescript
console.log('Current locale:', locale);
console.log('Translation:', t('auth.welcomeBack'));
```

## 📦 Dependencies

```json
{
  "expo-localization": "^17.0.7",  // Device language detection
  "i18n.js": "^0.0.1"              // Translation library
}
```

## 🌟 Future Enhancements

- [ ] Add more languages (French, German, Portuguese, etc.)
- [ ] Implement pluralization rules
- [ ] Add date/time formatting per locale
- [ ] RTL (Right-to-Left) language support
- [ ] Translation management tool/service integration
- [ ] Lazy loading of translation files
- [ ] Translation interpolation with variables

## 🤝 Contributing Translations

Want to add a new language? Please:
1. Copy `en.ts` to `[language-code].ts`
2. Translate all strings
3. Test thoroughly
4. Submit a pull request

Native speakers welcome! 🎉

## 📞 Support

For translation issues or questions:
- Check existing translation files for examples
- Review this documentation
- Open an issue on GitHub
