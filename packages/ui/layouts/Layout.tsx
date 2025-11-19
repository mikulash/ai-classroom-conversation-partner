import { Outlet } from 'react-router';
import { Header } from '../components/Header';
import { useEffect } from 'react';
import { Toaster } from '../components/ui/toast';
import { useAppStore } from '../hooks/useAppStore';
import { appConfigClient } from '@repo/frontend-utils/src/clients/db/appConfig.client';
import { Loading } from '../components/Loading';

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
    <div className="flex flex-col min-h-screen">
      <Header/>
      <main className="flex-grow">
        {
          isLoaded ? <Outlet/> : <Loading/>
        }
      </main>
      <Toaster/>
      <footer className="p-4 bg-gray-100"/>
    </div>
  );
};

