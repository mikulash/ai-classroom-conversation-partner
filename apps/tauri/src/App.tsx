import './App.css';
import { attachConsole } from '@tauri-apps/plugin-log';
import { createHashRouter, RouterProvider } from 'react-router';
import React from 'react';
import { ROUTES } from '@repo/ui/routes/routes';

void attachConsole();

const router = createHashRouter(ROUTES);

function App(): React.ReactElement<typeof RouterProvider> {
  return <RouterProvider router={router}/>;
}

export default App;

