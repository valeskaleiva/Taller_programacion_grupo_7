import { useState, useEffect, useCallback } from 'react';
import { Product } from '../types';
import { mockApi } from '../services/mockApi';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await mockApi.getProducts();
      setProducts(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const createProduct = async (data: Omit<Product, 'id'>): Promise<boolean> => {
    try {
      const response = await mockApi.createProduct(data);
      setProducts(prev => [...prev, response.data]);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create product');
      return false;
    }
  };

  const updateProduct = async (id: number, data: Partial<Product>): Promise<boolean> => {
    try {
      const response = await mockApi.updateProduct(id, data);
      setProducts(prev => prev.map(p => p.id === id ? response.data : p));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update product');
      return false;
    }
  };

  const deleteProduct = async (id: number): Promise<boolean> => {
    try {
      await mockApi.deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete product');
      return false;
    }
  };

  return { products, isLoading, error, fetchProducts, createProduct, updateProduct, deleteProduct };
}
