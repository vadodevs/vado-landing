import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@/styles/globals.css';
import { Providers } from '@/app/providers';
import { Router } from '@/app/router';

import '@fontsource/poppins/400.css'; // Specify weight
import '@fontsource/poppins/400-italic.css'; // Specify weight and style

import '@fontsource/poppins/500.css'; // Specify weight
import '@fontsource/poppins/500-italic.css'; // Specify weight and style

import '@fontsource/poppins/600.css'; // Specify weight
import '@fontsource/poppins/600-italic.css'; // Specify weight and style

import '@fontsource/poppins/700.css'; // Specify weight
import '@fontsource/poppins/700-italic.css'; // Specify weight and style

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Providers>
      <Router />
    </Providers>
  </StrictMode>,
);
