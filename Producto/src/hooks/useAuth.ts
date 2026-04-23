import { useState } from 'react';
import { useAuthContext } from '../context/AuthContext';
import { LoginCredentials } from '../types';

export function useAuth() {
  const { user, isLoading, login, logout, isAuthenticated } = useAuthContext();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (credentials: LoginCredentials): Promise<boolean> => {
    setError(null);
    setIsSubmitting(true);
    try {
      await login(credentials);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { user, isLoading, isAuthenticated, error, isSubmitting, handleLogin, logout };
}
