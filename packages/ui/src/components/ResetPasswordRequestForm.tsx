import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Button } from './ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/form';
import { useAppStore } from '../hooks/useAppStore';
import { useTypedTranslation } from '../hooks/useTypedTranslation';
import { authClient } from '@repo/frontend-utils/src/clients/db/auth.client';

const requestResetSchema = z.object({
  email: z.string().email(),
});

type RequestResetValues = z.infer<typeof requestResetSchema>;

export const ResetPasswordRequestForm: React.FC = () => {
  const { t } = useTypedTranslation();
  const allowedDomains = useAppStore((state) => state.appConfig.allowedDomains);

  const [message, setMessage] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<RequestResetValues>({
    resolver: zodResolver(requestResetSchema),
    defaultValues: { email: '' },
    mode: 'onTouched',
  });

  const onSubmit = async (values: RequestResetValues) => {
    setSubmitError(null);
    const { error } = await authClient.resetPasswordForEmail(values.email);
    if (error) {
      setSubmitError(error.message);
      return;
    }
    setMessage(t('resetLinkSent', 'We\'ve emailed you a reset link – check your inbox!'));
  };

  const { isSubmitting } = form.formState;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8 px-4 sm:py-12 sm:px-6">
      <Card className="p-4 sm:p-6 w-full max-w-md">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center">
          {t('forgotPassword', 'Forgot your password?')}
        </h2>

        {message ? (
          <p className="text-center text-xs sm:text-sm text-green-600">{message}</p>
        ) : (
          <Form {...form}>
            <form onSubmit={(e) => {
              void form.handleSubmit(onSubmit)(e);
            }} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('email')}</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        autoComplete="email"
                        placeholder={t('emailPlaceholder', { allowedDomains: allowedDomains.join(', ') })}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage/>
                  </FormItem>
                )}
              />

              {submitError && (
                <p role="alert" className="text-destructive text-sm">{submitError}</p>
              )}

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? t('loading.general') : t('sendResetLink', 'Send reset link')}
              </Button>
            </form>
          </Form>
        )}
      </Card>
    </div>
  );
};
