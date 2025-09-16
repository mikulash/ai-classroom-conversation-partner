import { createBrowserRouter, RouterProvider } from 'react-router';
import React from 'react';
import { ROUTES } from '@repo/ui/routes/routes';
import { ThemeProvider } from '@repo/ui/components/ThemeProvider';

const router = createBrowserRouter(ROUTES);

function App(): React.ReactElement<typeof RouterProvider> {
  return (
    <ThemeProvider>
      <RouterProvider router={router}/>
    </ThemeProvider>
  );
}

export default App;

