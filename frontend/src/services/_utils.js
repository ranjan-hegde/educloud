// Shared helpers for mock services.
// When a real backend is connected, these wrappers should be replaced
// with actual fetch/axios calls to your API base URL (e.g. import.meta.env.VITE_API_URL).

export const delay = (data, ms = 500) =>
  new Promise((resolve) => setTimeout(() => resolve(data), ms));

export const mockError = (message, ms = 500) =>
  new Promise((_, reject) => setTimeout(() => reject(new Error(message)), ms));
