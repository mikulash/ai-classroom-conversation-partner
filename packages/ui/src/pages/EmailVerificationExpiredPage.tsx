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
import { useResendVerificationEmail } from '../hooks/queries/useAuthMutations';

const buildSchema = (requiredMessage: string) =>
  z.object({
    email: z.string().trim().min(1, { message: requiredMessage }),
  });

type ResendValues = z.infer<ReturnType<typeof buildSchema>>;

export const EmailVerificationExpiredPage: React.FC = () => {
  const { t } = useTypedTranslation();
  const { profile } = useAuth();
  const resendVerification = useResendVerificationEmail();

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

  const onSubmit = (values: ResendValues) => {
    resendVerification.mutate(values.email.trim());
  };

  const status: 'form' | 'success' = resendVerification.isSuccess ? 'success' : 'form';
  const submitError = resendVerification.error?.message ?? null;
  const isSubmitting = resendVerification.isPending;

  const tips = [
    t('emailVerificationCheckEmailTipSpam'),
    t('emailVerificationCheckEmailTipWait'),
    t('emailVerificationCheckEmailTipCorrect'),
  ];

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md space-y-8 text-center">
        <Card className="p-6 w-full max-w-md space-y-4 text-center">
          {status === 'form' ? (
            <>
              <h2 className="text-2xl font-bold">{t('emailVerificationExpiredTitle')}</h2>
              <p className="text-sm text-muted-foreground">
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
                    <p className="text-sm text-destructive" role="alert">
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
              <p className="text-sm text-muted-foreground">
                {t('emailVerificationCheckEmailMessage')}
              </p>

              <ul className="space-y-2 text-left text-sm text-muted-foreground">
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
