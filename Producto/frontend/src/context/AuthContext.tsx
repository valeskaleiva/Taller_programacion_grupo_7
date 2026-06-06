import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

type AuthUser = {
    name: string;
    email: string;
};

type AuthContextValue = {
    user: AuthUser | null;
    loading: boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthProviderProps = {
    children: ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Replace with your authentication logic
        const fetchUser = async () => {
            // Simulating an API call
            const userData = await new Promise<AuthUser>((resolve) => setTimeout(() => resolve({ name: 'John Doe', email: 'john.doe@example.com' }), 1000));
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
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};
