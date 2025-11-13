import { Outlet } from 'react-router';
import { Header } from '../components/Header';
import { useEffect } from 'react';
import { Toaster } from '../components/ui/toast';
import { useAppStore } from '../hooks/useAppStore';
import { fetchInitialData } from '@repo/frontend-utils/src/clients/db/appConfig.client';

export const Layout = () => {
  const setConversationOptions = useAppStore(
    (state) => state.setConversationOptions,
  );
  const setAppConfig = useAppStore((state) => state.setAppConfig);

  useEffect(() => {
    const fetchData = async () => {
      const initialData = await fetchInitialData();

      setConversationOptions({
        personalities: initialData.personalities,
        scenarios: initialData.scenarios,
        conversationRoles: initialData.conversationRoles,
      });
      setAppConfig(initialData.appConfig);
    };

    fetchData().catch((err) =>
      console.error('Error fetching initial data:', err),
    );
  }, [setConversationOptions]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header/>
      <main className="flex-grow">
        <Outlet/>
      </main>
      <Toaster/>
      <footer className="p-4 bg-gray-100"/>
    </div>
  );
};

