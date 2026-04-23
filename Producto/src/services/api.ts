import axios from 'axios';
import { Product, User, Sale, AuthUser, LoginCredentials, ApiResponse, DashboardStats } from '../types';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const api = {
  login: async (credentials: LoginCredentials): Promise<ApiResponse<AuthUser>> => {
    const response = await axiosInstance.post<ApiResponse<AuthUser>>('/auth/login', credentials);
    return response.data;
  },
  getProducts: async (): Promise<ApiResponse<Product[]>> => {
    const response = await axiosInstance.get<ApiResponse<Product[]>>('/products');
    return response.data;
  },
  createProduct: async (data: Omit<Product, 'id'>): Promise<ApiResponse<Product>> => {
    const response = await axiosInstance.post<ApiResponse<Product>>('/products', data);
    return response.data;
  },
  updateProduct: async (id: number, data: Partial<Product>): Promise<ApiResponse<Product>> => {
    const response = await axiosInstance.put<ApiResponse<Product>>(`/products/${id}`, data);
    return response.data;
  },
  deleteProduct: async (id: number): Promise<ApiResponse<boolean>> => {
    const response = await axiosInstance.delete<ApiResponse<boolean>>(`/products/${id}`);
    return response.data;
  },
  getUsers: async (): Promise<ApiResponse<User[]>> => {
    const response = await axiosInstance.get<ApiResponse<User[]>>('/users');
    return response.data;
  },
  getSales: async (): Promise<ApiResponse<Sale[]>> => {
    const response = await axiosInstance.get<ApiResponse<Sale[]>>('/sales');
    return response.data;
  },
  createSale: async (data: Omit<Sale, 'id'>): Promise<ApiResponse<Sale>> => {
    const response = await axiosInstance.post<ApiResponse<Sale>>('/sales', data);
    return response.data;
  },
  getDashboardStats: async (): Promise<ApiResponse<DashboardStats>> => {
    const response = await axiosInstance.get<ApiResponse<DashboardStats>>('/dashboard/stats');
    return response.data;
  },
};
