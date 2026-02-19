import { defineConfig } from 'vite'
import eslint from '@nabla/vite-plugin-eslint'
import react from '@vitejs/plugin-react'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'

const SITE_URL_FALLBACK = 'https://vadodevs.com'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    eslint({}),
    // Asegura que og:image siempre tenga URL absoluta (incluso si VITE_SITE_URL no está en CI)
    {
      name: 'html-seo-image-url',
      transformIndexHtml(html) {
        const baseUrl = (process.env.VITE_SITE_URL || SITE_URL_FALLBACK).replace(/\/$/, '')
        return html.replace(/%VITE_SITE_URL%/g, baseUrl)
      },
    },
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
})
