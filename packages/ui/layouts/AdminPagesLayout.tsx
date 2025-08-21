import AdminNavigation from '../components/AdminNavigation';
import React from 'react';
import { Outlet, useNavigate } from 'react-router';
import { useProfile } from '../hooks/useProfile';
import { isProfileAdmin } from '@repo/shared/utils/access';

export const AdminPagesLayout = () => {
  const profile = useProfile();
  const navigate = useNavigate();

  if (!profile) {
    navigate('/auth');
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
