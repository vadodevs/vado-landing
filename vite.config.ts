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
  '/gracias',
  '/terminos',
  '/politica-privacidad',
  '/cookies',
]
const OUR_WORK_SLUGS = [
  'zenqr', 'sendero', 'ebm', 'digitalRanch', 'easySales', 'cipreses', 'maggiore', 'washaut',
]
const ARTICLE_SLUGS = [
  'digitalizacion-retail', 'tecnologia-industria-restaurantera', 'ia-sin-fronteras',
  'evolucion-trabajo-remoto-talento', 'mas-alla-fronteras-talento-global',
  'preparando-negocio-futuro-mercados-talento', 'plataformas-talento-revolucionando-crecimiento',
  'nuevo-paradigma-laboral-talento-senior', '10-razones-nearshore-outsourcing',
  'futuro-trabajo-fronteras-decada-transformacion', 'asegurando-pipeline-cicd-devops',
  'desbloqueando-potencial-ingenieria-nearshore', 'consigue-trabajo-suenos-entrevista-desarrollo',
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

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    eslint({}),
    // Sustituye %VITE_SITE_URL% en index.html y genera sitemap + robots en build
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
