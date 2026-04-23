import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Replace with your authentication logic
        const fetchUser = async () => {
            // Simulating an API call
            const userData = await new Promise((resolve) => setTimeout(() => resolve({ name: 'John Doe', email: 'john.doe@example.com' }), 1000));
            setUser(userData);
            setLoading(false);
        };

        fetchUser();
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
