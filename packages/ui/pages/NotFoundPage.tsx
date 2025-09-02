import { Link } from 'react-router';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { useTypedTranslation } from '../hooks/useTypedTranslation';

export function NotFoundPage() {
  const { t } = useTypedTranslation();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">{t('notFoundTitle')}</CardTitle>
          <CardDescription>
            {t('notFoundDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            {t('notFoundMessage')}
          </p>
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full">
            <Link to="/" className="w-full text-center">
              {t('goToHome')}
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
