import { AxiosError } from 'axios';

export const toErrorMessage = (error: unknown, fallbackMessage: string): string => {
  if (error instanceof AxiosError) {
    const messageFromResponse = (error.response?.data as { message?: string } | undefined)?.message;
    if (messageFromResponse) {
      return messageFromResponse;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallbackMessage;
};
