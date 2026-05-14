import React, { lazy, Suspense } from 'react';
import { RouteObject } from 'react-router';
import { Layout } from '../layouts/Layout';
import { HomePage } from '../pages/HomePage';
import { EmailValidatedPage } from '../pages/EmailValidatedPage';
import { EmailVerificationExpiredPage } from '../pages/EmailVerificationExpiredPage';
import { ProtectedRoute } from '../layouts/ProtectedRoute';
import { NotFoundPage } from '../pages/NotFoundPage';
import { SignInPage } from '../pages/SignInPage';
import { RegistrationPage } from '../pages/RegistrationPage';
import { ResetPasswordRequestForm } from '../components/ResetPasswordRequestForm';
import { ResetPasswordForm } from '../components/ResetPasswordForm';
import { Loading } from '../components/Loading';

// Chat pages — only loaded when the user enters the chat flow.
const PersonalitySelectorPage = lazy(() =>
  import('../pages/chats/PersonalitySelectorPage').then((m) => ({ default: m.PersonalitySelectorPage })),
);
const VoiceCallPage = lazy(() =>
  import('../pages/chats/VoiceCallPage').then((m) => ({ default: m.VoiceCallPage })),
);
const VideoCallPage = lazy(() =>
  import('../pages/chats/VideoCallPage').then((m) => ({ default: m.VideoCallPage })),
);
const MessageChatPage = lazy(() =>
  import('../pages/chats/MessageChatPage').then((m) => ({ default: m.MessageChatPage })),
);

// User profile — only after login.
const UserProfilePage = lazy(() =>
  import('../pages/ProfilePage').then((m) => ({ default: m.UserProfilePage })),
);

// Admin — only for admins, so we keep all of it out of the main bundle.
const AdminPagesLayout = lazy(() =>
  import('../layouts/AdminPagesLayout').then((m) => ({ default: m.AdminPagesLayout })),
);
const AdminPersonalitiesPage = lazy(() =>
  import('../pages/admin/AdminPersonalitiesPage').then((m) => ({ default: m.AdminPersonalitiesPage })),
);
const AdminScenariosPage = lazy(() =>
  import('../pages/admin/AdminScenariosPage').then((m) => ({ default: m.AdminScenariosPage })),
);
const AdminCustomModelSelectionPage = lazy(() =>
  import('../pages/admin/AdminCustomModelSelectionPage').then((m) => ({ default: m.AdminCustomModelSelectionPage })),
);
const AdminGlobalModelSelectionPage = lazy(() =>
  import('../pages/admin/AdminGlobalModelSelectionPage').then((m) => ({ default: m.AdminGlobalModelSelectionPage })),
);
const AdminProfilesPage = lazy(() =>
  import('../pages/admin/AdminProfilesPage').then((m) => ({ default: m.AdminProfilesPage })),
);

const lazyRoute = (Component: React.LazyExoticComponent<React.ComponentType>) => (
  <Suspense fallback={<Loading/>}>
    <Component/>
  </Suspense>
);

export const ROUTES: RouteObject[] = [
  {
    path: '/',
    element: <Layout/>,
    children: [
      /* ----------  PUBLIC  ---------- */
      { index: true, element: <HomePage/> },
      { path: 'sign-in', element: <SignInPage/> },
      { path: 'register', element: <RegistrationPage/> },
      { path: 'email-validated', element: <EmailValidatedPage/> },
      { path: 'verification-expired', element: <EmailVerificationExpiredPage/> },
      { path: 'forgot-password', element: <ResetPasswordRequestForm/> },
      { path: 'reset-password', element: <ResetPasswordForm/> },

      /* ----------  PROTECTED  ---------- */
      {
        element: <ProtectedRoute/>,
        children: [
          {
            path: 'chat',
            children: [
              { index: true, element: lazyRoute(PersonalitySelectorPage) },
              { path: 'voice-call', element: lazyRoute(VoiceCallPage) },
              { path: 'video-call', element: lazyRoute(VideoCallPage) },
              { path: 'message-chat', element: lazyRoute(MessageChatPage) },
            ],
          },
          { path: 'profile', element: lazyRoute(UserProfilePage) },
          {
            path: 'admin', element: lazyRoute(AdminPagesLayout), children: [
              { index: true, element: lazyRoute(AdminPersonalitiesPage) },
              { path: 'personalities', element: lazyRoute(AdminPersonalitiesPage) },
              { path: 'scenarios', element: lazyRoute(AdminScenariosPage) },
              { path: 'custom-models', element: lazyRoute(AdminCustomModelSelectionPage) },
              { path: 'global-models', element: lazyRoute(AdminGlobalModelSelectionPage) },
              { path: 'user-profiles', element: lazyRoute(AdminProfilesPage) },
            ],
          },
        ],
      },
      { path: '*', element: <NotFoundPage/> },
    ],
  },
];
