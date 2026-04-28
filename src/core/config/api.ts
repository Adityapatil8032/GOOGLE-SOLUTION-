const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');

const rawApiBaseUrl = import.meta.env.VITE_API_URL?.trim() || '';
const rawSocketServerUrl = import.meta.env.VITE_SOCKET_SERVER_URL?.trim() || '';

export const apiBaseUrl = rawApiBaseUrl ? trimTrailingSlash(rawApiBaseUrl) : '';
export const socketServerUrl = rawSocketServerUrl
  ? trimTrailingSlash(rawSocketServerUrl)
  : apiBaseUrl;

export const apiUrl = (path: string) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return apiBaseUrl ? `${apiBaseUrl}${normalizedPath}` : normalizedPath;
};
