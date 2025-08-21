import { Outlet } from 'react-router';
import Header from '../components/Header';
import { useEffect } from 'react';
import { supabase } from '@repo/api-client/src/supabase';
import { Toaster } from '../components/ui/toast';
import { useAppStore } from '../hooks/useAppStore';

const Layout = () => {
  const setConversationOptions = useAppStore(
    (state) => state.setConversationOptions,
  );
  const setAppConfig = useAppStore((state) => state.setAppConfig);

  useEffect(() => {
    const fetchData = async () => {
      const [pRes, sRes, rRes, aRes] = await Promise.all([
        supabase.from('personalities').select('*'),
        supabase.from('scenarios').select('*'),
        supabase.from('conversation_roles').select('*'),
        supabase.from('app_config').select('*').single(),
      ]);

      if (pRes.error || sRes.error || rRes.error || aRes.error) {
        console.error('Supabase fetch error', pRes.error, sRes.error, rRes.error, aRes.error);
        return;
      }

      setConversationOptions({
        personalities: pRes.data,
        scenarios: sRes.data,
        conversationRoles: rRes.data,
      });
      setAppConfig(aRes.data);
    };

    fetchData().catch((err) =>
      console.error('Error fetching data from Supabase:', err),
    );
  }, [setConversationOptions]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header/>
      <main className="flex-grow">
        <Outlet/>
      </main>
      <Toaster />
      <footer className="p-4 bg-gray-100"/>
    </div>
  );
};

export default Layout;
