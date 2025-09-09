import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { cn } from '../lib/utils';
import { useTypedTranslation } from '../hooks/useTypedTranslation';

interface LoadingProps extends React.HTMLAttributes<HTMLDivElement> {
    message?: string;
}

export const Loading = ({ className, message, ...props }: LoadingProps) => {
  const { t } = useTypedTranslation();

  return (
    <Card className={cn('w-full max-w-md mx-auto', className)} {...props}>
      <CardHeader>
        <CardTitle className="text-center">{t('loading.general')}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center space-y-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <CardDescription>{message || t('loadingMessage')}</CardDescription>
      </CardContent>
    </Card>
  );
};
