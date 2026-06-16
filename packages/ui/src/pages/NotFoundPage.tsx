import { Link } from 'react-router';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { useTypedTranslation } from '../hooks/useTypedTranslation';

export function NotFoundPage() {
  const { t } = useTypedTranslation();

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">{t('notFound.title')}</CardTitle>
          <CardDescription>
            {t('notFound.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {t('notFound.message')}
          </p>
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full">
            <Link to="/" className="w-full text-center">
              {t('common.goToHome')}
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
