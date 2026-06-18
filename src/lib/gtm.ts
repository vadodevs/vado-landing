declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}


export const GTM_VIRTUAL_PAGEVIEW_EVENT = 'virtual_pageview';

export function pushVirtualPageView(pagePath: string) {
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({
    event: GTM_VIRTUAL_PAGEVIEW_EVENT,
    page_path: pagePath,
    page_title: document.title,
    page_location: window.location.href,
  });
}
