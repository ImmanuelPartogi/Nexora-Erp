// ============================================
// FILE: frontend/src/shared/api/client.ts
// Centralized Axios client with auth interceptors and typed helpers.
// ============================================
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { PaginatedResponse } from '../types';

type QueryParams = Record<string, unknown>;

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Attach JWT and active-company header on every request.
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        const companyId = localStorage.getItem('activeCompanyId');

        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        if (companyId) {
          config.headers['X-Company-Id'] = companyId;
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    // Auto-redirect to login on 401 responses.
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * GET with overloaded second argument: pass a params object for convenience
   * or a full AxiosRequestConfig when you need headers, signal, etc.
   */
  async get<T>(url: string, params?: QueryParams): Promise<T>;
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T>;
  async get<T>(url: string, paramsOrConfig?: QueryParams | AxiosRequestConfig): Promise<T> {
    let config: AxiosRequestConfig = {};

    if (paramsOrConfig) {
      if ('params' in paramsOrConfig || 'headers' in paramsOrConfig || 'signal' in paramsOrConfig) {
        config = paramsOrConfig as AxiosRequestConfig;
      } else {
        config = { params: paramsOrConfig };
      }
    }

    const response = await this.client.get(url, config);
    return response.data.data;
  }

  async getPaginated<T>(
    url: string,
    params?: QueryParams
  ): Promise<PaginatedResponse<T>> {
    const response = await this.client.get(url, { params });

    return {
      data: response.data.data,
      pagination: response.data.pagination
    };
  }

  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post(url, data, config);
    return response.data.data;
  }

  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put(url, data, config);
    return response.data.data;
  }

  async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch(url, data, config);
    return response.data.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete(url, config);
    return response.data.data;
  }
}

export const apiClient = new ApiClient();