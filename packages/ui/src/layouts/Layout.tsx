import { Outlet } from 'react-router';
import { Header } from '../components/Header';
import { useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '../components/ui/toast';
import { useAppStore } from '../hooks/useAppStore';
import { appConfigClient } from '@repo/frontend-utils/src/clients/db/appConfig.client';
import { Loading } from '../components/Loading';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { ConfirmProvider } from '../hooks/useConfirm';
import { queryClient } from '../lib/queryClient';
import { useTypedTranslation } from '../hooks/useTypedTranslation';

export const Layout = () => {
  const { t } = useTypedTranslation();
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
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <QueryClientProvider client={queryClient}>
        <ConfirmProvider>
          <div className="flex flex-col min-h-screen">
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:text-foreground focus:shadow-md focus:outline-none focus:ring-[3px] focus:ring-ring/50"
            >
              {t('nav.skipToContent')}
            </a>
            <Header/>
            <main id="main-content" className="flex-grow">
              <ErrorBoundary>
                {
                  isLoaded ? <Outlet/> : <Loading/>
                }
              </ErrorBoundary>
            </main>
            <Toaster/>
            <footer className="p-4 bg-muted"/>
          </div>
        </ConfirmProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

