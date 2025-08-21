export const LANGUAGE = {
  CS: {
    BCP47: 'cs-CZ',
    ISO639: 'cs',
    ENGLISH_NAME: 'Czech',
    NATIVE_NAME: 'Čeština',
  },
  EN: {
    BCP47: 'en-US',
    ISO639: 'en',
    ENGLISH_NAME: 'English',
    NATIVE_NAME: 'English',
  },
  SK: {
    BCP47: 'sk-SK',
    ISO639: 'sk',
    ENGLISH_NAME: 'Slovak',
    NATIVE_NAME: 'Slovenčina',
  },
} as const;

export const getLanguage = (lang: string) => {
  const language = Object.values(LANGUAGE).find((l) => l.ISO639 === lang);
  if (!language) {
    console.error(`Language not found for ISO639: ${lang}; using default: ${LANGUAGE.CS.ISO639}`);
    return LANGUAGE.CS;
  }
  return language;
};
