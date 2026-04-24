// src/context/AppContext.tsx
import { createContext, useContext, useReducer } from 'react';
import type { AppState, AppAction, Notification } from '../types';

const initialState: AppState = {
  notifications: [],
  sidebarOpen: false,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'ADD_NOTIFICATION':
      return { ...state, notifications: [...state.notifications, action.payload] };
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter((n) => n.id !== action.payload),
      };
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarOpen: !state.sidebarOpen };
    default:
      return state;
  }
}

interface AppContextValue {
  state: AppState;
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  toggleSidebar: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

interface AppProviderProps {
  children: React.ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Date.now().toString();
    dispatch({ type: 'ADD_NOTIFICATION', payload: { ...notification, id } });
    setTimeout(() => dispatch({ type: 'REMOVE_NOTIFICATION', payload: id }), 4000);
  };

  const removeNotification = (id: string) =>
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });

  const toggleSidebar = () => dispatch({ type: 'TOGGLE_SIDEBAR' });

  return (
    <AppContext.Provider value={{ state, addNotification, removeNotification, toggleSidebar }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
