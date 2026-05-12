import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@/fonts/poppins';
import '@/styles/globals.css';
import { initI18n } from '@/app/i18nInit';
import { Providers } from '@/app/providers';
import { Router } from '@/app/router';

const rootEl = document.getElementById('root')!;

void (async () => {
  await initI18n();
  createRoot(rootEl).render(
    <StrictMode>
      <Providers>
        <Router />
      </Providers>
    </StrictMode>,
  );
})();
