import { Product, User, Sale, AuthUser, LoginCredentials, ApiResponse, DashboardStats } from '../types';
import { mockProducts, mockUsers, mockSales } from '../utils/mockData';

const delay = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

const simulateRequest = async <T>(data: T): Promise<ApiResponse<T>> => {
  await delay(300);
  return { data, success: true };
};

export const mockApi = {
  // Auth
  login: async (credentials: LoginCredentials): Promise<ApiResponse<AuthUser>> => {
    await delay(500);
    const user = mockUsers.find(u => u.username === credentials.username);
    if (!user || credentials.password !== 'password123') {
      throw new Error('Invalid credentials');
    }
    return {
      data: { ...user, token: 'mock-jwt-token-' + user.id },
      success: true,
    };
  },

  // Products
  getProducts: async (): Promise<ApiResponse<Product[]>> => simulateRequest(mockProducts),

  getProduct: async (id: number): Promise<ApiResponse<Product>> => {
    const product = mockProducts.find(p => p.id === id);
    if (!product) throw new Error('Product not found');
    return simulateRequest(product);
  },

  createProduct: async (data: Omit<Product, 'id'>): Promise<ApiResponse<Product>> => {
    const newProduct: Product = { ...data, id: mockProducts.length + 1 };
    mockProducts.push(newProduct);
    return simulateRequest(newProduct);
  },

  updateProduct: async (id: number, data: Partial<Product>): Promise<ApiResponse<Product>> => {
    const index = mockProducts.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Product not found');
    mockProducts[index] = { ...mockProducts[index], ...data };
    return simulateRequest(mockProducts[index]);
  },

  deleteProduct: async (id: number): Promise<ApiResponse<boolean>> => {
    const index = mockProducts.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Product not found');
    mockProducts.splice(index, 1);
    return simulateRequest(true);
  },

  // Users
  getUsers: async (): Promise<ApiResponse<User[]>> => simulateRequest(mockUsers),

  // Sales
  getSales: async (): Promise<ApiResponse<Sale[]>> => simulateRequest(mockSales),

  createSale: async (data: Omit<Sale, 'id'>): Promise<ApiResponse<Sale>> => {
    const newSale: Sale = { ...data, id: mockSales.length + 1 };
    mockSales.push(newSale);
    return simulateRequest(newSale);
  },

  // Dashboard
  getDashboardStats: async (): Promise<ApiResponse<DashboardStats>> => {
    const revenue = mockSales.reduce((sum, sale) => sum + (sale.totalPrice ?? 0), 0);
    return simulateRequest({
      totalProducts: mockProducts.length,
      totalSales: mockSales.length,
      totalUsers: mockUsers.length,
      revenue,
    });
  },
};
