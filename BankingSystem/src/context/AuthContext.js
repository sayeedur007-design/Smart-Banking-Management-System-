import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkLoggedIn = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const response = await api.get('/users/me');
                    setUser(response.data);
                } catch (error) {
                    localStorage.removeItem('token');
                }
            }
            setLoading(false);
        };
        checkLoggedIn();
    }, []);

    const login = async (email, password, userType, adminCode) => {
        const response = await api.post('/auth/login', { email, password, userType, adminCode });
        const { access_token } = response.data;
        localStorage.setItem('token', access_token);

        // Fetch user details immediately
        const userResponse = await api.get('/users/me');
        setUser(userResponse.data);
        return userResponse.data;
    };

    const register = async (userData) => {
        console.log('AuthContext register called', userData);
        try {
            const response = await fetch('http://localhost:8000/api/v1/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                // eslint-disable-next-line no-throw-literal
                throw { response: { data: errorData } };
            }

            const res = await response.json();
            console.log('Register response:', res);
            return res;
        } catch (err) {
            console.error('Register API error:', err);
            throw err;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
