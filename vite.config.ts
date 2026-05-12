import { defineConfig } from 'vite'
import eslint from '@nabla/vite-plugin-eslint'
import react from '@vitejs/plugin-react'
import path from 'path'
import { readdirSync, readFileSync, writeFileSync } from 'fs'
import tailwindcss from '@tailwindcss/vite'

const SITE_URL_FALLBACK = 'https://vadodevs.com'

const LOCALES = ['es', 'en'] as const
/** Must match `src/app/router.tsx` localized path segments (after `/:lang`). */
const STATIC_PATHS = [
  '',
  '/services/custom-software',
  '/services/ai-solutions',
  '/services/staff-augmentation',
  '/our-work',
  '/company/vado-insights',
  '/company/culture-and-talent',
  '/contact',
  '/thank-you',
  '/info/terms-of-service',
  '/info/privacy-policy',
  '/info/cookies',
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
      urls.push(`${baseUrl}/${locale}/our-work/${slug}`)
    }
    for (const slug of ARTICLE_SLUGS) {
      urls.push(`${baseUrl}/${locale}/company/articles/${slug}`)
    }
  }
  const entries = urls
    .map((loc) => `  <url><loc>${loc}</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>`)
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>`
}

// https://vite.dev/config/
export default defineConfig({
  build: {
    target: 'es2022',
    cssMinify: true,
    /** Menos JS en el documento: el polyfill de modulepreload casi nunca hace falta en navegadores actuales. */
    modulePreload: { polyfill: false },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (id.includes('node_modules/react-dom/') || id.includes('node_modules/react/')) {
            return 'react-vendor';
          }
          if (id.includes('node_modules/motion/')) {
            return 'motion-vendor';
          }
          if (id.includes('node_modules/i18next/') || id.includes('node_modules/react-i18next/')) {
            return 'i18n-vendor';
          }
          if (id.includes('node_modules/@radix-ui/')) {
            return 'radix-vendor';
          }
          if (id.includes('node_modules/@tanstack/react-query')) {
            return 'react-query-vendor';
          }
          return undefined;
        },
      },
    },
  },
  esbuild: {
    legalComments: 'none',
  },
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

        try {
          const indexPath = path.join(outDir, 'index.html')
          let html = readFileSync(indexPath, 'utf-8')
          const originalHtml = html
          const assetsDir = path.join(outDir, 'assets')
          const assetFiles = readdirSync(assetsDir)
          const pick = (prefix: string) =>
            assetFiles.find((f) => f.startsWith(prefix) && f.endsWith('.woff2'))
          const hints: string[] = []
          if (!html.includes('as="font"')) {
            const latin400 = pick('poppins-latin-400-normal')
            const latin700 = pick('poppins-latin-700-normal')
            if (latin400) {
              hints.push(
                `    <link rel="preload" href="/assets/${latin400}" as="font" type="font/woff2" crossorigin />`,
              )
            }
            if (latin700) {
              hints.push(
                `    <link rel="preload" href="/assets/${latin700}" as="font" type="font/woff2" crossorigin />`,
              )
            }
          }
          if (!html.includes('world-map-dots.svg')) {
            hints.push(
              '    <link rel="preload" href="/generated/world-map-dots.svg" as="image" type="image/svg+xml" fetchpriority="high" />',
            )
          }
          if (hints.length > 0) {
            html = html.replace('<meta name="viewport"', `${hints.join('\n')}\n    <meta name="viewport"`)
          }
          /** CSS principal: preload + onload evita bloqueo de render (Lighthouse). */
          html = html.replace(
            /<link rel="stylesheet" crossorigin href="(\/assets\/[^"]+\.css)">/,
            (_, href: string) =>
              `<link rel="preload" href="${href}" as="style" crossorigin onload="this.onload=null;this.rel='stylesheet'" />\n    <noscript><link rel="stylesheet" crossorigin href="${href}"></noscript>`,
          )
          if (html !== originalHtml) {
            writeFileSync(indexPath, html, 'utf-8')
          }
        } catch {
          /* dist ausente en algunos entornos */
        }
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
