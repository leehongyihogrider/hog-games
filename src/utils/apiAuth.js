export function getApiAuthHeaders() {
  const clientKey = import.meta.env.VITE_API_CLIENT_KEY;
  if (!clientKey) {
    return {};
  }

  return { 'X-Client-Key': clientKey };
}
