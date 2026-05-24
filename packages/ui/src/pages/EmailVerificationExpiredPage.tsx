import React, { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../components/ui/form';
import { useTypedTranslation } from '../hooks/useTypedTranslation';
import { useAuth } from '../hooks/useAuth';
import { authClient } from '@repo/frontend-utils/src/clients/db/auth.client';

const buildSchema = (requiredMessage: string) =>
  z.object({
    email: z.string().trim().min(1, { message: requiredMessage }),
  });

type ResendValues = z.infer<ReturnType<typeof buildSchema>>;

export const EmailVerificationExpiredPage: React.FC = () => {
  const { t } = useTypedTranslation();
  const { profile } = useAuth();
  const [status, setStatus] = useState<'form' | 'success'>('form');
  const [submitError, setSubmitError] = useState<string | null>(null);

  const schema = useMemo(
    () => buildSchema(t('emailVerificationExpiredEmailRequired')),
    [t],
  );

  const form = useForm<ResendValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: profile?.email ?? '' },
    mode: 'onTouched',
  });

  // Sync email when a fresh profile arrives without clobbering edits made against the same snapshot.
  const [prevProfileEmail, setPrevProfileEmail] = useState(profile?.email);
  if (profile?.email !== prevProfileEmail) {
    setPrevProfileEmail(profile?.email);
    if (profile?.email) {
      form.reset({ email: profile.email });
    }
  }

  const onSubmit = async (values: ResendValues) => {
    setSubmitError(null);
    const { error: resendError } = await authClient.resendVerificationEmail({
      email: values.email.trim(),
    });
    if (resendError) {
      setSubmitError(resendError.message);
      return;
    }
    setStatus('success');
  };

  const { isSubmitting } = form.formState;

  const tips = [
    t('emailVerificationCheckEmailTipSpam'),
    t('emailVerificationCheckEmailTipWait'),
    t('emailVerificationCheckEmailTipCorrect'),
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="w-full max-w-md space-y-8 text-center">
        <Card className="p-6 w-full max-w-md space-y-4 text-center">
          {status === 'form' ? (
            <>
              <h2 className="text-2xl font-bold">{t('emailVerificationExpiredTitle')}</h2>
              <p className="text-sm text-gray-700">
                {t('emailVerificationExpiredDescription')}
              </p>

              <Form {...form}>
                <form className="space-y-4" onSubmit={(e) => {
                  void form.handleSubmit(onSubmit)(e);
                }}>
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="text-left">
                        <FormLabel>{t('email')}</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            autoComplete="email"
                            placeholder={t('emailVerificationExpiredEmailPlaceholder')}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage/>
                      </FormItem>
                    )}
                  />

                  {submitError && (
                    <p className="text-sm text-red-600" role="alert">
                      {submitError}
                    </p>
                  )}

                  <Button className="w-full" type="submit" disabled={isSubmitting}>
                    {isSubmitting ? t('loadingMessage') : t('emailVerificationExpiredPrimaryAction')}
                  </Button>
                </form>
              </Form>

              <Button variant="link" asChild>
                <Link to="/sign-in">{t('emailVerificationExpiredSecondaryAction')}</Link>
              </Button>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold">{t('emailVerificationCheckEmailTitle')}</h2>
              <p className="text-sm text-gray-700">
                {t('emailVerificationCheckEmailMessage')}
              </p>

              <ul className="space-y-2 text-left text-sm text-gray-700">
                {tips.map((tip) => (
                  <li key={tip}>{tip}</li>
                ))}
              </ul>

              <Button asChild className="w-full">
                <Link to="/sign-in">{t('emailVerificationExpiredSecondaryAction')}</Link>
              </Button>
            </>
          )}
        </Card>
      </div>
    </div>
  );
};
