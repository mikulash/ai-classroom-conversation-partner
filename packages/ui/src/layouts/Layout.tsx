import { Outlet } from 'react-router';
import { Header } from '../components/Header';
import { useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '../components/ui/toast';
import { useAppStore } from '../hooks/useAppStore';
import { appConfigClient } from '@repo/frontend-utils/src/clients/db/appConfig.client';
import { Loading } from '../components/Loading';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { ConfirmProvider } from '../hooks/useConfirm';
import { queryClient } from '../lib/queryClient';

export const Layout = () => {
  const setInitialConversationOptions = useAppStore((state) => state.setInitialConversationOptions);

  const isLoaded = useAppStore((s) => s.isLoaded);
  useEffect(() => {
    const fetchData = async () => {
      const initialOptions = await appConfigClient.fetchInitialConversationOptions();
      setInitialConversationOptions(initialOptions);
    };

    fetchData().catch((err: unknown) => {
      console.error('Error fetching initial data:', err);
    });
  }, [setInitialConversationOptions]);

  return (
    <QueryClientProvider client={queryClient}>
      <ConfirmProvider>
        <div className="flex flex-col min-h-screen">
          <Header/>
          <main className="flex-grow">
            <ErrorBoundary>
              {
                isLoaded ? <Outlet/> : <Loading/>
              }
            </ErrorBoundary>
          </main>
          <Toaster/>
          <footer className="p-4 bg-gray-100"/>
        </div>
      </ConfirmProvider>
    </QueryClientProvider>
  );
};

