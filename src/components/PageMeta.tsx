import { useEffect } from 'react';

const SUPPORTED_LOCALES = ['es', 'en'] as const;
const DEFAULT_LOCALE = 'es';

export type PageMetaProps = {
  
  title: string;
  
  description: string;
  
  image?: string;
  
  canonicalPath?: string;
  
  ogType?: 'website' | 'article';
  
  pathWithoutLang?: string;
};

const OG_IMAGE_DEFAULT = '/case-studies/ebm/ebm-cover-card.webp';
const SITE_NAME = 'Vado Devs';


export function PageMeta({
  title,
  description,
  image,
  canonicalPath,
  ogType = 'website',
  pathWithoutLang,
}: PageMetaProps) {
  useEffect(() => {
    document.title = title;
    const origin = typeof window !== 'undefined' ? window.location.origin : '';

    const setMeta = (nameOrProperty: string, content: string, isProperty = false) => {
      const attr = isProperty ? 'property' : 'name';
      let el = document.querySelector(`meta[${attr}="${nameOrProperty}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, nameOrProperty);
        document.head.appendChild(el);
      }
      el.content = content;
    };

    setMeta('description', description);

    setMeta('og:title', title, true);
    setMeta('og:description', description, true);
    setMeta('og:type', ogType, true);
    setMeta('og:site_name', SITE_NAME, true);

    const imageUrl = image
      ? image.startsWith('http')
        ? image
        : `${origin}${image}`
      : `${origin}${OG_IMAGE_DEFAULT}`;
    setMeta('og:image', imageUrl, true);
    setMeta('og:image:width', '1200', true);
    setMeta('og:image:height', '630', true);

    const canonicalUrl = canonicalPath ? `${origin}${canonicalPath}` : undefined;
    if (canonicalUrl) {
      setMeta('og:url', canonicalUrl, true);
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'canonical';
        document.head.appendChild(link);
      }
      link.href = canonicalUrl;
    }

    setMeta('twitter:card', 'summary_large_image', false);
    setMeta('twitter:title', title, false);
    setMeta('twitter:description', description, false);
    setMeta('twitter:image', imageUrl, false);
    if (canonicalUrl) {
      setMeta('twitter:url', canonicalUrl, false);
    }

    
    if (pathWithoutLang !== undefined) {
      const normalized =
        pathWithoutLang === '' ? '' : pathWithoutLang.startsWith('/') ? pathWithoutLang : `/${pathWithoutLang}`;
      const existing = document.querySelectorAll('link[rel="alternate"][hreflang]');
      existing.forEach((el) => el.remove());
      for (const locale of SUPPORTED_LOCALES) {
        const link = document.createElement('link');
        link.rel = 'alternate';
        link.setAttribute('hreflang', locale);
        link.href = `${origin}/${locale}${normalized}`;
        document.head.appendChild(link);
      }
      const xDefault = document.createElement('link');
      xDefault.rel = 'alternate';
      xDefault.setAttribute('hreflang', 'x-default');
      xDefault.href = `${origin}/${DEFAULT_LOCALE}${normalized}`;
      document.head.appendChild(xDefault);
    }

    return () => {
    };
  }, [title, description, image, canonicalPath, ogType, pathWithoutLang]);

  return null;
}
