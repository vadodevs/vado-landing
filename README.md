# Vado Devs — Landing

Sitio web corporativo y landing de **Vado Devs**: presentación de servicios (software a la medida, soluciones IA, ampliación de personal), testimonios, cultura y contacto.

## Contenido del sitio

- **Inicio** (`/:lang`): Hero, marcas, productos digitales, soluciones IA, tech stack, clientes, ampliación de personal, ¿Por qué Vado?, cultura y talento, Vado Insights, FAQ, CTA contacto.
- **Software a la medida** (`/:lang/servicios/software-a-la-medida`): Hero, productos, pestañas de servicios, proceso, ¿Por qué Vado?, testimonios.
- **Idiomas:** Español (`/es`) e inglés (`/en`) con rutas prefijadas por locale.

## Stack

- **React 19** + **TypeScript**
- **Vite** — desarrollo y build
- **Tailwind CSS v4** — estilos
- **Wouter** — rutas (con prefijo de idioma)
- **React i18next** — i18n
- **Shadcn UI** (Radix) — componentes base
- **Motion** — animaciones

## Scripts

```bash
npm install
npm run dev      # Desarrollo (con --host)
npm run build    # Build de producción
npm run preview  # Vista previa del build
npm run lint     # ESLint
npm run format   # Prettier
```

## Estructura relevante

```
src/
├── app/
│   ├── router.tsx       # Rutas (home, software-a-la-medida, 404)
│   ├── providers.tsx
│   └── i18n.ts
├── components/
│   ├── layout/          # Navbar, Footer, MainLayout
│   │   ├── home/        # Secciones y layouts de la home
│   │   └── servicios/software-a-la-medida/  # Secciones de la página de software
│   └── ui/              # Componentes Shadcn
├── pages/
│   ├── home.tsx
│   ├── servicios/software-a-la-medida.tsx
│   └── not-found.tsx
├── locales/             # es.json, en.json
└── styles/
```

## Rutas

- `/` → redirige a `/es`
- `/:lang` → Inicio (es/en)
- `/:lang/servicios/software-a-la-medida` → Software a la medida
- Cualquier otra ruta → 404

Los assets estáticos (logos, fondos, iconos) están en `public/` (backgrounds, icons, sections-image, brands, etc.).
