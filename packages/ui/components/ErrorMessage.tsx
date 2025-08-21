import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { cn } from '../lib/utils';
import { Button } from './ui/button';
import { useTypedTranslation } from '../hooks/useTypedTranslation';

interface ErrorProps extends React.HTMLAttributes<HTMLDivElement> {
    title?: string;
    message?: string;
    onRetry?: () => void;
}

export const ErrorMessage =
    ({
      className,
      title,
      message,
      onRetry,
      ...props
    }: ErrorProps) => {
      const { t } = useTypedTranslation();

      return (
        <Card className={cn('w-full max-w-md mx-auto', className)} {...props}>
          <CardHeader>
            <CardTitle className="text-center text-destructive">
              {title || t('errorTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center space-y-4">
            <CardDescription className="text-center">
              {message || t('errorMessage')}
            </CardDescription>
            {onRetry && (
              <Button variant="outline" onClick={onRetry}>
                {t('retry')}
              </Button>
            )}
          </CardContent>
        </Card>
      );
    };
