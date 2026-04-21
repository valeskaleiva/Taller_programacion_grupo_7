// src/context/AuthContext.tsx
import { createContext, useContext, useReducer } from 'react';
import type { AuthState, AuthAction, User } from '../types';

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, user: action.payload, isAuthenticated: true, isLoading: false };
    case 'LOGOUT':
      return { ...initialState };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
}

interface AuthContextValue {
  state: AuthState;
  login: (user: User) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const login = (user: User) => dispatch({ type: 'LOGIN', payload: user });
  const logout = () => dispatch({ type: 'LOGOUT' });
  const setLoading = (loading: boolean) => dispatch({ type: 'SET_LOADING', payload: loading });

  return (
    <AuthContext.Provider value={{ state, login, logout, setLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
