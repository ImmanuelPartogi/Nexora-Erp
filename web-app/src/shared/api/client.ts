// ============================================
// FILE: web-app/src/shared/api/client.ts
// Axios instance with auth + tenant interceptors and typed helpers.
// ============================================
import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
} from 'axios';
import { useAuthStore } from '../store/auth.store';
import type { PaginatedResponse } from '../types';

// Permissive so typed query interfaces are assignable without index signatures.
type QueryParams = object | Record<string, unknown> | undefined;

const BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: BASE_URL,
      headers: { 'Content-Type': 'application/json' },
    });

    // Request interceptor: inject Bearer token + X-Company-Id from store.
    this.client.interceptors.request.use(
      (config) => {
        const { token, activeCompanyId } = useAuthStore.getState();

        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        if (activeCompanyId) {
          config.headers['X-Company-Id'] = activeCompanyId;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor: on 401 clear store + redirect to /login.
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        const status = error.response?.status;
        if (status === 401) {
          useAuthStore.getState().logout();
          if (
            typeof window !== 'undefined' &&
            window.location.pathname !== '/login'
          ) {
            window.location.assign('/login');
          }
        }
        return Promise.reject(error);
      }
    );
  }

  /** Extract a readable error message from any axios failure. */
  getMessage(error: unknown): string {
    if (axios.isAxiosError(error)) {
      const data = error.response?.data as
        | { message?: string; error?: string }
        | undefined;
      return (
        data?.message ||
        data?.error ||
        error.message ||
        'Terjadi kesalahan tak terduga'
      );
    }
    if (error instanceof Error) return error.message;
    return 'Terjadi kesalahan tak terduga';
  }

  async get<T>(url: string, params?: QueryParams): Promise<T> {
    const res = await this.client.get(url, { params });
    return res.data.data as T;
  }

  async getRaw<T>(url: string, params?: QueryParams): Promise<T> {
    const res = await this.client.get<T>(url, { params });
    return res.data;
  }

  async getPaginated<T>(
    url: string,
    params?: QueryParams
  ): Promise<PaginatedResponse<T>> {
    const res = await this.client.get(url, { params });
    return {
      data: res.data.data as T[],
      pagination: res.data.pagination,
    };
  }

  async post<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const res = await this.client.post(url, data, config);
    return res.data.data as T;
  }

  async patch<T>(url: string, data?: unknown): Promise<T> {
    const res = await this.client.patch(url, data);
    return res.data.data as T;
  }

  async put<T>(url: string, data?: unknown): Promise<T> {
    const res = await this.client.put(url, data);
    return res.data.data as T;
  }

  async delete<T>(url: string): Promise<T> {
    const res = await this.client.delete(url);
    return res.data?.data as T;
  }
}

export const apiClient = new ApiClient();