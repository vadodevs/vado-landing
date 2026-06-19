import { useEffect } from 'react';

const SITE_URL = import.meta.env.VITE_SITE_URL?.replace(/\/$/, '') ?? 'https://vadodevs.com';

const ORGANIZATION_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Vado Devs',
  url: SITE_URL,
  description:
    'Software a la medida, desarrollo web, apps y soluciones digitales. Llevamos tu negocio del reto al resultado.',
  sameAs: [],
};

const WEBSITE_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Vado Devs',
  url: SITE_URL,
  description:
    'Vado Devs: software a la medida, desarrollo web, apps y soluciones digitales.',
  publisher: { '@id': `${SITE_URL}/#organization` },
  inLanguage: ['es', 'en'],
};

const ID = 'vado-jsonld';


export function JsonLd() {
  useEffect(() => {
    const existing = document.getElementById(ID);
    if (existing) return;

    const script = document.createElement('script');
    script.id = ID;
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify([
      { ...ORGANIZATION_JSON_LD, '@id': `${SITE_URL}/#organization` },
      WEBSITE_JSON_LD,
    ]);
    document.head.appendChild(script);

    return () => {
      document.getElementById(ID)?.remove();
    };
  }, []);

  return null;
}
