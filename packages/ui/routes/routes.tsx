import { RouteObject } from 'react-router';
import { Layout } from '../layouts/Layout';
import { HomePage } from '../pages/HomePage';
import { AuthPage } from '../pages/AuthPage';
import { EmailValidatedPage } from '../pages/EmailValidatedPage';
import { ProtectedRoute } from '../layouts/ProtectedRoute';
import { PersonalitySelectorPage } from '../pages/chats/PersonalitySelectorPage';
import { VoiceCallPage } from '../pages/chats/VoiceCallPage';
import { VideoCallPage } from '../pages/chats/VideoCallPage';
import { MessageChatPage } from '../pages/chats/MessageChatPage';
import { UserProfilePage } from '../pages/ProfilePage';
import { AdminPagesLayout } from '../layouts/AdminPagesLayout';
import { AdminGlobalModelSelectionPage } from '../pages/admin/AdminGlobalModelSelectionPage';
import { AdminPersonalitiesPage } from '../pages/admin/AdminPersonalitiesPage';
import { AdminScenariosPage } from '../pages/admin/AdminScenariosPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import React from 'react';
import { AdminCustomModelSelectionPage } from '../pages/admin/AdminCustomModelSelectionPage';
import { ResetPasswordRequestForm } from '../components/ResetPasswordRequestForm';
import { ResetPasswordForm } from '../components/ResetPasswordForm';
import { AdminProfilesPage } from '../pages/admin/AdminProfilesPage';

export const ROUTES: RouteObject[] = [
  {
    path: '/',
    element: <Layout/>,
    children: [
      /* ----------  PUBLIC  ---------- */
      { index: true, element: <HomePage/> },
      { path: 'auth', element: <AuthPage/> },
      { path: 'auth/validated', element: <EmailValidatedPage/> },
      { path: 'forgot-password', element: <ResetPasswordRequestForm/> },
      { path: 'reset-password', element: <ResetPasswordForm/> },

      /* ----------  PROTECTED  ---------- */
      {
        element: <ProtectedRoute/>,
        children: [
          {
            path: 'chat',
            children: [
              { index: true, element: <PersonalitySelectorPage/> },
              { path: 'voice-call', element: <VoiceCallPage/> },
              { path: 'video-call', element: <VideoCallPage/> },
              { path: 'message-chat', element: <MessageChatPage/> },
            ],
          },
          { path: 'profile', element: <UserProfilePage/> },
          {
            path: 'admin', element: <AdminPagesLayout/>, children: [
              { index: true, element: <AdminGlobalModelSelectionPage/> },
              { path: 'personalities', element: <AdminPersonalitiesPage/> },
              { path: 'scenarios', element: <AdminScenariosPage/> },
              { path: 'custom-models', element: <AdminCustomModelSelectionPage/> },
              { path: 'user-profiles', element: <AdminProfilesPage/> },
            ],
          },
        ],
      },
      { path: '*', element: <NotFoundPage/> },
    ],
  },
];
