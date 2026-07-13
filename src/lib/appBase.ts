/**
 * Application base path for deployments under a subpath (e.g. GitHub Pages).
 * Vite sets import.meta.env.BASE_URL to "/" or "/Competitor-groups/".
 */
export const APP_BASE_PATH = import.meta.env.BASE_URL.replace(/\/$/, '');

export const appPath = (path: string) => {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${APP_BASE_PATH}${normalized}` || normalized;
};

export const appOriginPath = () => {
  const origin = window.location.origin;
  return APP_BASE_PATH ? `${origin}${APP_BASE_PATH}` : origin;
};
