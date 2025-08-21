import { createBrowserRouter, RouterProvider } from 'react-router';
import React from 'react';
import { ROUTES } from '@repo/ui/routes/routes';

const router = createBrowserRouter(ROUTES);

function App(): React.ReactElement<typeof RouterProvider> {
  return <RouterProvider router={router}/>;
}

export default App;

