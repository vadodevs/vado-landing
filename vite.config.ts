import { defineConfig } from 'vite'
import eslint from '@nabla/vite-plugin-eslint'
import react from '@vitejs/plugin-react'
import path from 'path'
import { writeFileSync } from 'fs'
import tailwindcss from '@tailwindcss/vite'

const SITE_URL_FALLBACK = 'https://vadodevs.com'

const LOCALES = ['es', 'en'] as const
const STATIC_PATHS = [
  '',
  '/servicios/software-a-la-medida',
  '/servicios/soluciones-ia',
  '/servicios/ampliacion-de-personal',
  '/nuestro-trabajo',
  '/compania/vado-insights',
  '/compania/cultura-y-talento',
  '/contacto',
  '/login',
  '/gracias',
  '/info/terms-of-service',
  '/info/privacy-policy',
  '/info/cookies',
  '/app/dev',
  '/app/company',
  '/app/projects',
]
const OUR_WORK_SLUGS = [
  'zenqr', 'sendero', 'ebm', 'digitalRanch', 'easySales', 'cipreses', 'maggiore', 'washaut',
]
const ARTICLE_SLUGS = [
  'digitalization-in-retail', 'technology-transforming-restaurant-industry', 'ai-without-borders',
  'evolution-of-remote-work-talent-acquisition', 'beyond-borders-global-talent-pools',
  'future-proofing-with-talent-marketplaces', 'how-talent-platforms-revolutionize-growth',
  'new-labor-paradigm-senior-talent', '10-reasons-nearshore-outsourcing-success',
  'future-of-work-across-borders', 'securing-your-ci-cd-pipeline',
  'benefits-of-nearshore-engineering', 'land-your-dream-software-job',
]

function generateSitemapXml(baseUrl: string): string {
  const urls: string[] = []
  for (const locale of LOCALES) {
    for (const p of STATIC_PATHS) {
      urls.push(`${baseUrl}/${locale}${p}`)
    }
    for (const slug of OUR_WORK_SLUGS) {
      urls.push(`${baseUrl}/${locale}/nuestro-trabajo/${slug}`)
    }
    for (const slug of ARTICLE_SLUGS) {
      urls.push(`${baseUrl}/${locale}/compania/articulos/${slug}`)
    }
  }
  const entries = urls
    .map((loc) => `  <url><loc>${loc}</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>`)
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>`
}
export default defineConfig({
  server: {
    allowedHosts: [
      '.ngrok-free.dev',
      '.ngrok-free.app',
      '.ngrok.io',
      'localhost',
    ],
    proxy: {
      '/api': {
        target: process.env.VITE_API_PROXY_TARGET ?? 'http://127.0.0.1:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  plugins: [
    react(),
    tailwindcss(),
    eslint({}),
    {
      name: 'vado-seo',
      apply: 'build',
      closeBundle() {
        const baseUrl = (process.env.VITE_SITE_URL || SITE_URL_FALLBACK).replace(/\/$/, '')
        const outDir = path.resolve(__dirname, 'dist')
        writeFileSync(path.join(outDir, 'sitemap.xml'), generateSitemapXml(baseUrl), 'utf-8')
        const robotsPath = path.join(outDir, 'robots.txt')
        const robots = `User-agent: *
Allow: /

Sitemap: ${baseUrl}/sitemap.xml
`
        writeFileSync(robotsPath, robots, 'utf-8')
      },
    },
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
