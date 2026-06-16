import React from 'react';
import { Outlet } from 'react-router';
import { useAuth } from '../hooks/useAuth';
import { Loading } from '../components/Loading';
import { NotFoundPage } from '../pages/NotFoundPage';
import { useTypedTranslation } from '../hooks/useTypedTranslation';

export const ProtectedRoute: React.FC = () => {
  const { session, ready } = useAuth();
  const { t } = useTypedTranslation();

  if (!ready) {
    return <Loading message={t('common.loading.checkingAuth')}/>;
  }

  if (!session?.user) {
    return <NotFoundPage/>;
  }

  return <Outlet/>;
};

