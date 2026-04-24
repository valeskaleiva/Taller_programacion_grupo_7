// src/services/mockApi.ts
import { mockProducts, mockUsers, mockSales } from '../utils/mockData';
import type { Product, User, Sale } from '../types';

type Endpoint = 'products' | 'users' | 'sales';

interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

type EndpointDataMap = {
  products: Product[];
  users: User[];
  sales: Sale[];
};

const db: EndpointDataMap = {
  products: mockProducts as Product[],
  users: mockUsers as User[],
  sales: mockSales as Sale[],
};

function delay(ms = 200): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class MockApi {
  async get<T extends Endpoint>(endpoint: T): Promise<ApiResponse<EndpointDataMap[T]>> {
    await delay();
    return { data: db[endpoint] as EndpointDataMap[T], status: 200, message: 'OK' };
  }

  async post<T extends Endpoint>(
    endpoint: T,
    data: Omit<EndpointDataMap[T][number], 'id'>,
  ): Promise<ApiResponse<EndpointDataMap[T][number]>> {
    await delay();
    const collection = db[endpoint] as Array<EndpointDataMap[T][number]>;
    const ids = (collection as Array<{ id: number }>).map((item) => item.id);
    const newId = ids.length ? Math.max(...ids) + 1 : 1;
    const newItem = { id: newId, ...data } as EndpointDataMap[T][number];
    collection.push(newItem);
    return { data: newItem, status: 201, message: 'Created' };
  }

  async put<T extends Endpoint>(
    endpoint: T,
    id: number,
    data: Partial<EndpointDataMap[T][number]>,
  ): Promise<ApiResponse<EndpointDataMap[T][number]>> {
    await delay();
    const collection = db[endpoint] as Array<EndpointDataMap[T][number]>;
    const index = (collection as Array<{ id: number }>).findIndex((item) => item.id === id);
    if (index === -1) {
      throw new Error(`${endpoint}/${id} not found`);
    }
    const updated = { ...collection[index], ...data } as EndpointDataMap[T][number];
    collection[index] = updated;
    return { data: updated, status: 200, message: 'Updated' };
  }

  async delete(endpoint: Endpoint, id: number): Promise<ApiResponse<null>> {
    await delay();
    const collection = db[endpoint] as Array<{ id: number }>;
    const index = collection.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new Error(`${endpoint}/${id} not found`);
    }
    collection.splice(index, 1);
    return { data: null, status: 200, message: 'Deleted' };
  }
}

export const mockApi = new MockApi();
