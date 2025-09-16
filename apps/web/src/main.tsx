import './index.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { I18nextProvider } from 'react-i18next';
import i18n from '@repo/frontend-utils/src/translation/i18n';
import { ThemeProvider } from '@repo/ui/components/ThemeProvider';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <I18nextProvider i18n={i18n}>
      <ThemeProvider>
        <App/>
      </ThemeProvider>
    </I18nextProvider>
  </StrictMode>,
);


