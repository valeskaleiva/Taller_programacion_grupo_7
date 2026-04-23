import { useState, useEffect } from 'react';

const useAuth = () => {
    const [user, setUser] = useState(null);

    const login = async (credentials) => {
        // Replace with your authentication logic
        const userData = await fakeAuthApi.login(credentials);
        setUser(userData);
    };

    const logout = async () => {
        // Replace with your logout logic
        await fakeAuthApi.logout();
        setUser(null);
    };

    useEffect(() => {
        const fetchUser = async () => {
            const userData = await fakeAuthApi.getCurrentUser();
            setUser(userData);
        };
        fetchUser();
    }, []);

    return { user, login, logout };
};

export default useAuth;
