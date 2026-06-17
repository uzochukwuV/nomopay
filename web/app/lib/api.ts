const DEFAULT_BACKEND_URL = "http://localhost:8080";

export function getBackendUrl() {
  return (
    process.env.BACKEND_URL ??
    process.env.NEXT_PUBLIC_BACKEND_URL ??
    DEFAULT_BACKEND_URL
  ).replace(/\/+$/, "");
}

export function backendApiUrl(path: string) {
  return `${getBackendUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}
