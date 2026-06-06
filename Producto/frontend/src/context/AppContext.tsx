import { createContext, useContext, useReducer, type ReactNode } from 'react';

// Initial state
type AppState = Record<string, unknown>;
type AppAction = { type: string; payload?: unknown };
type AppContextValue = {
    state: AppState;
    dispatch: React.Dispatch<AppAction>;
};

const initialState: AppState = {};

// Create context
const AppContext = createContext<AppContextValue | undefined>(undefined);

// Reducer function
const appReducer = (state: AppState, action: AppAction): AppState => {
    switch (action.type) {
        // Define your action cases here
        default:
            return state;
    }
};

// Provider component
type AppProviderProps = {
    children: ReactNode;
};

export const AppProvider = ({ children }: AppProviderProps) => {
    const [state, dispatch] = useReducer(appReducer, initialState);

    return (
        <AppContext.Provider value={{ state, dispatch }}>
            {children}
        </AppContext.Provider>
    );
};

// Custom hook to use the AppContext
export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext must be used within AppProvider');
    }
    return context;
};