import { useState, useEffect, useCallback } from 'react';
import { Sale } from '../types';
import { mockApi } from '../services/mockApi';

export function useSales() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSales = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await mockApi.getSales();
      setSales(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sales');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  const createSale = async (data: Omit<Sale, 'id'>): Promise<boolean> => {
    try {
      const response = await mockApi.createSale(data);
      setSales(prev => [...prev, response.data]);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create sale');
      return false;
    }
  };

  return { sales, isLoading, error, fetchSales, createSale };
}
