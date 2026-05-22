// src/api/axios.js
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5002/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

function getAuthStore() {
  return import('../store/authStore').then((m) => m.useAuthStore);
}

api.interceptors.request.use(async (config) => {
  try {
    const useAuthStore = await getAuthStore();
    const token = useAuthStore.getState().accessToken;
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch {
    // store not ready yet
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const isAuthRefresh = original?.url?.includes('/auth/refresh-token');

    if (
      error.response?.status === 401 &&
      !original._retry &&
      !isAuthRefresh
    ) {
      original._retry = true;
      try {
        const useAuthStore = await getAuthStore();
        const refreshToken = useAuthStore.getState().refreshToken;
        if (!refreshToken) throw new Error('No refresh token');

        const { data } = await axios.post(`${BASE_URL}/auth/refresh-token`, {
          refreshToken,
        });
        const accessToken = data.accessToken ?? data.data?.accessToken;
        if (!accessToken) throw new Error('No access token in refresh response');

        useAuthStore.getState().setAccessToken(accessToken);
        original.headers.Authorization = `Bearer ${accessToken}`;
        return api(original);
      } catch {
        const useAuthStore = await getAuthStore();
        useAuthStore.getState().logout();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
