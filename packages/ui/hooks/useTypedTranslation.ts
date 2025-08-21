import { useTranslation } from 'react-i18next';
import { getLanguage, LANGUAGE } from '@repo/shared/enums/Language';


export function useTypedTranslation() {
  const translation = useTranslation();

  const { i18n } = translation;

  // Get the current language as a typed Language object
  const language = getLanguage(i18n.language);
  const changeLanguage = (langKey: keyof typeof LANGUAGE) => {
    void i18n.changeLanguage(LANGUAGE[langKey].ISO639);
  };

  return {
    ...translation,
    language,
    changeLanguage,
  };
}
