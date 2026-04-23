import React, { createContext, useContext, useReducer } from 'react';

// Initial state
const initialState = {};

// Create context
const AppContext = createContext(initialState);

// Reducer function
const appReducer = (state, action) => {
    switch (action.type) {
        // Define your action cases here
        default:
            return state;
    }
};

// Provider component
export const AppProvider = ({ children }) => {
    const [state, dispatch] = useReducer(appReducer, initialState);

    return (
        <AppContext.Provider value={{ state, dispatch }}>
            {children}
        </AppContext.Provider>
    );
};

// Custom hook to use the AppContext
export const useAppContext = () => {
    return useContext(AppContext);
};