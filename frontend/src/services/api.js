// Central API client for EduCloud.
// All service files should import { api } from './api' and use it
// instead of raw fetch() so the backend URL is configured in one place.
//
// Set VITE_API_URL in your .env (or Vercel Environment Variables):
//   VITE_API_URL=https://educloud-backend.onrender.com

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

/**
 * Thin wrapper around fetch that:
 *  - prepends the API base URL
 *  - attaches the JWT token from localStorage
 *  - sets JSON Content-Type for non-FormData bodies
 *  - throws on non-2xx responses with the server error message
 */
export async function api(path, options = {}) {
  const token = localStorage.getItem('educloud_token');

  const headers = { ...(options.headers || {}) };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Don't set Content-Type for FormData (browser sets multipart boundary)
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status}`;
    try {
      const errorBody = await response.json();
      errorMessage = errorBody.message || errorBody.error || errorMessage;
    } catch {
      // response wasn't JSON — use the default message
    }
    throw new Error(errorMessage);
  }

  // 204 No Content
  if (response.status === 204) return null;

  return response.json();
}

export default api;

