import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import cs from './locales/cs.json';
import en from './locales/en.json';

const storageKey = 'language';
const savedLanguage = typeof window !== 'undefined' ? localStorage.getItem(storageKey) : null;

i18n
  .use(initReactI18next)
  .init({
    fallbackLng: 'cs',
    lng: savedLanguage || 'cs',
    interpolation: {
      escapeValue: false,
    },
    resources: {
      en: { translation: en },
      cs: { translation: cs },
    },
  });

if (typeof window !== 'undefined') {
  i18n.on('languageChanged', (lng) => {
    localStorage.setItem(storageKey, lng);
  });
}

export default i18n;

