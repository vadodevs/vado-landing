declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

const GA_MEASUREMENT_ID = 'G-HCJMBVGD72';

export function trackPageView(pagePath: string) {
  window.gtag?.('config', GA_MEASUREMENT_ID, {
    page_path: pagePath,
    page_title: document.title,
    page_location: window.location.href,
  });
}
