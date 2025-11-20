import { Language } from '@repo/shared/enums/Language';

export const getLocalizedDateTimeString = (dateString: string) => {
  return new Date(dateString).toLocaleString();
};
/**
 * Formats a timestamp to a time string based on the provided language.
 */
export const formatMessageTime = (lang: Language, timestamp?: Date | string) => {
  if (!timestamp) return '';
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  return new Intl.DateTimeFormat(lang.BCP47, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(date);
};
