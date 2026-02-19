import { useEffect } from 'react';

export type PageMetaProps = {
  /** Título de la página (pestaña y og:title) */
  title: string;
  /** Descripción para meta description y og:description */
  description: string;
  /** URL de la imagen para og:image (relativa o absoluta). Si es relativa, se convierte a absoluta con origin. */
  image?: string;
  /** Ruta canónica relativa (ej: /nuestro-trabajo/sendero). Se convierte a URL absoluta en el cliente. */
  canonicalPath?: string;
};

const OG_IMAGE_DEFAULT = '/case-studies/ebm/ebm-cover-card.webp';

/**
 * Actualiza título, meta description y Open Graph para SEO y redes sociales.
 * Usar en páginas de caso de uso o landing para mejorar indexación y previews.
 */
export function PageMeta({ title, description, image, canonicalPath }: PageMetaProps) {
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
    setMeta('og:type', 'article', true);
    setMeta('og:site_name', 'Vado', true);

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
    }

    setMeta('twitter:card', 'summary_large_image', false);
    setMeta('twitter:title', title, false);
    setMeta('twitter:description', description, false);
    setMeta('twitter:image', imageUrl, false);
    if (canonicalUrl) {
      setMeta('twitter:url', canonicalUrl, false);
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'canonical';
        document.head.appendChild(link);
      }
      link.href = canonicalUrl;
    }

    return () => {
      // No revertimos title/description al desmontar; la siguiente página los actualizará
    };
  }, [title, description, image, canonicalPath]);

  return null;
}
