import { AdminNavigation } from '../components/AdminNavigation';
import React from 'react';
import { Outlet, useNavigate } from 'react-router';
import { useAuth } from '../hooks/useAuth';
import { isProfileAdmin } from '@repo/shared/utils/access';

export const AdminPagesLayout = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();

  if (!profile) {
    navigate('/sign-in');
    return null;
  }

  if (!isProfileAdmin(profile)) {
    navigate('/');
    return null;
  }


  return (
    <>
      <AdminNavigation/>
      <Outlet/>
    </>
  );
}
;
