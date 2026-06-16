import React from 'react';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { useLocation, useNavigate } from 'react-router';
import { isProfileOwner } from '../lib/access';
import { useAuth } from '../hooks/useAuth';
import { useTypedTranslation } from '../hooks/useTypedTranslation';

export function AdminNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = useAuth();
  const { t } = useTypedTranslation();

  if (!profile) {
    void navigate('/sign-in');
    return null;
  }

  const pathname = location.pathname;
  let activeTab = 'personalities';
  if (pathname === '/admin/personalities') {
    activeTab = 'personalities';
  } else if (pathname === '/admin/scenarios') {
    activeTab = 'scenarios';
  } else if (pathname === '/admin/custom-models') {
    activeTab = 'custom_models';
  } else if (pathname === '/admin/user-profiles') {
    activeTab = 'user_profiles';
  } else if (pathname === '/admin/global-models') {
    activeTab = 'global_models';
  } else if (pathname === '/admin') {
    activeTab = 'personalities';
  }

  const handleTabChange = (value: string) => {
    if (value === 'global_models') {
      void navigate('/admin/global-models');
    } else if (value === 'personalities') {
      void navigate('/admin/personalities');
    } else if (value === 'scenarios') {
      void navigate('/admin/scenarios');
    } else if (value === 'custom_models') {
      void navigate('/admin/custom-models');
    } else if (value === 'user_profiles') {
      void navigate('/admin/user-profiles');
    }
  };


  return (
    <div className="w-full flex justify-center mb-8 mt-4">
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-[900px]"
      >
        <TabsList className={`grid w-full ${isProfileOwner(profile) ? 'grid-cols-5' : 'grid-cols-3'}`}>
          <TabsTrigger value="personalities">{t('personalities.personalities')}</TabsTrigger>
          <TabsTrigger value="scenarios">{t('scenarios.scenarios')}</TabsTrigger>
          <TabsTrigger value="custom_models">{t('models.customSelection')}</TabsTrigger>
          {
            isProfileOwner(profile) && (
              <>
                <TabsTrigger value="global_models">{t('models.globallyUsed')}</TabsTrigger>
                <TabsTrigger value="user_profiles">{t('admin.userProfiles')}</TabsTrigger>
              </>
            )
          }
        </TabsList>
      </Tabs>

    </div>
  );
}
