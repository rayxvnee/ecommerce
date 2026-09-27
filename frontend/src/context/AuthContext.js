import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser } from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() =>
        JSON.parse(localStorage.getItem('user') || 'null')
    );
    const [loading, setLoading] = useState(false);

    const login = async (email, password) => {
        setLoading(true);
        const { data } = await loginUser({ email, password });
        setUser(data.data);
        localStorage.setItem('user', JSON.stringify(data.data));
        setLoading(false);
        return data.data;
    };

    const register = async (name, email, password, role) => {
        setLoading(true);
        const { data } = await registerUser({ name, email, password, role });
        setUser(data.data);
        localStorage.setItem('user', JSON.stringify(data.data));
        setLoading(false);
        return data.data;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
