import { useMutation } from '@tanstack/react-query';
import { authClient } from '@repo/frontend-utils/src/clients/db/auth.client';
import { unwrap } from './unwrap';

export const useVerifyEmail = () =>
  useMutation({
    mutationFn: (token: string) => authClient.verifyEmail(token).then(unwrap),
  });

export const useResendVerificationEmail = () =>
  useMutation({
    mutationFn: (email: string) =>
      authClient.resendVerificationEmail({ email }).then(unwrap),
  });

export const useRequestPasswordReset = () =>
  useMutation({
    mutationFn: (email: string) => authClient.resetPasswordForEmail(email).then(unwrap),
  });

export const useResetPassword = () =>
  useMutation({
    mutationFn: ({ token, newPassword }: { token: string; newPassword: string }) =>
      authClient.resetPassword(token, newPassword).then(unwrap),
  });
