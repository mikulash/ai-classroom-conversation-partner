import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import cs from './locales/cs.json';
import en from './locales/en.json';

const storageKey = 'language';
const savedLanguage = typeof globalThis !== 'undefined' ? localStorage.getItem(storageKey) : null;

void i18n
  .use(initReactI18next)
  .init({
    fallbackLng: 'cs',
    lng: savedLanguage ?? 'cs',
    interpolation: {
      escapeValue: false,
    },
    resources: {
      en: { translation: en },
      cs: { translation: cs },
    },
  });

if (typeof globalThis !== 'undefined') {
  i18n.on('languageChanged', (lng) => {
    localStorage.setItem(storageKey, lng);
    // Keep the document language in sync so screen readers use the right voice.
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lng;
    }
  });
  if (typeof document !== 'undefined') {
    document.documentElement.lang = i18n.language;
  }
}

export default i18n;

