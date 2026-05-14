import { Outlet } from 'react-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { Header } from '../components/Header';
import { Toaster } from '../components/ui/toast';
import { useAppStore } from '../hooks/useAppStore';
import { Loading } from '../components/Loading';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { ConfirmProvider } from '../hooks/useConfirm';
import { queryClient } from '../lib/queryClient';
import { useInitialConversationOptions } from '../hooks/queries/useAppConfig';

/**
 * Inner shell that runs *inside* the QueryClientProvider so it can use
 * `useInitialConversationOptions` (and any other RQ hook in the future).
 */
const LayoutShell = () => {
  // Drives the initial conversation options fetch and syncs into useAppStore.
  // We don't read the query state directly here — `isLoaded` on the store
  // is the single source of truth other consumers already key off of.
  useInitialConversationOptions();
  const isLoaded = useAppStore((s) => s.isLoaded);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <ErrorBoundary>
          {isLoaded ? <Outlet /> : <Loading />}
        </ErrorBoundary>
      </main>
      <Toaster />
      <footer className="p-4 bg-gray-100" />
    </div>
  );
};

export const Layout = () => (
  <QueryClientProvider client={queryClient}>
    <ConfirmProvider>
      <LayoutShell />
    </ConfirmProvider>
  </QueryClientProvider>
);
