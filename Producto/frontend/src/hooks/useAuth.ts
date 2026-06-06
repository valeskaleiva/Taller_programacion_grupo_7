import { useState, useEffect } from 'react';

type Credentials = {
    username: string;
    password: string;
};

type HookUser = {
    username: string;
};

const useAuth = () => {
    const [user, setUser] = useState<HookUser | null>(null);

    const login = async (credentials: Credentials) => {
        // Stub mínimo tipado para evitar dependencia faltante.
        const userData: HookUser = { username: credentials.username };
        setUser(userData);
    };

    const logout = async () => {
        await Promise.resolve();
        setUser(null);
    };

    useEffect(() => {
        const fetchUser = async () => {
            const userData = await Promise.resolve<HookUser | null>(null);
            setUser(userData);
        };
        void fetchUser();
    }, []);

    return { user, login, logout };
};

export default useAuth;
