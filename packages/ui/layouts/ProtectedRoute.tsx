import React from 'react';
import { Outlet } from 'react-router';
import { useSession } from '../hooks/useSession';
import { Loading } from '../components/Loading';
import { NotFoundPage } from '../pages/NotFoundPage';
import { useTypedTranslation } from '../hooks/useTypedTranslation';

export const ProtectedRoute: React.FC = () => {
  const { session, ready } = useSession();
  const { t } = useTypedTranslation();

  if (!ready) {
    return <Loading message={t('loading.checkingAuth')}/>;
  }

  if (!session?.user) {
    return <NotFoundPage/>;
  }

  return <Outlet/>;
};

