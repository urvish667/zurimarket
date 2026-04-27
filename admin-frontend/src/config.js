export const DOMAIN_URL = (typeof window !== 'undefined' && window.__ENV__ && window.__ENV__.DOMAIN_URL) ? window.__ENV__.DOMAIN_URL : 'http://localhost:8080';
export const API_URL = (typeof window !== 'undefined' && window.__ENV__ && window.__ENV__.API_URL) ? window.__ENV__.API_URL : 'http://localhost:8080';
export const ADMIN_SECRET_KEY = (typeof window !== 'undefined' && window.__ENV__ && window.__ENV__.VITE_ADMIN_SECRET_KEY) ? window.__ENV__.VITE_ADMIN_SECRET_KEY : import.meta.env.VITE_ADMIN_SECRET_KEY || '';
