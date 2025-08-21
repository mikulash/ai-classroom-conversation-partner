import React from 'react';
import { Outlet } from 'react-router';
import { useSession } from '../hooks/useSession';
import { Loading } from '../components/Loading';
import NotFoundPage from '../pages/NotFoundPage';

const ProtectedRoute: React.FC = () => {
  const { session, ready } = useSession();

  if (!ready) {
    return <Loading message="Checking authentication..." />;
  }

  if (!session?.user) {
    return <NotFoundPage />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
