import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface AuthContextType {
    isLoginModalOpen: boolean;
    isSignUpModalOpen: boolean;
    openLogin: () => void;
    openSignUp: () => void;
    closeModals: () => void;
    isAuthenticated: boolean;
    isPremium: boolean;
    userRole: string | null;
    user: any | null;
    refreshProfile: () => Promise<void>;
}

import { API_URL } from '../services/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
    const [isPremium, setIsPremium] = useState(localStorage.getItem('isPremium') === 'true');
    const [userRole, setUserRole] = useState<string | null>(localStorage.getItem('userRole'));
    const [user, setUser] = useState<any | null>(null);

    const refreshProfile = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setIsAuthenticated(false);
            setIsPremium(false);
            setUserRole(null);
            setUser(null);
            return;
        }

        try {
            const response = await fetch(`${API_URL}/user/profile`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setUser(data);
                setIsPremium(data.is_premium);
                setUserRole(data.role);
                localStorage.setItem('isPremium', String(data.is_premium));
                localStorage.setItem('userRole', data.role);
                setIsAuthenticated(true);
            } else {
                // If profile fails, token might be invalid
                localStorage.removeItem('token');
                localStorage.removeItem('isPremium');
                localStorage.removeItem('userRole');
                setIsAuthenticated(false);
                setIsPremium(false);
                setUserRole(null);
                setUser(null);
            }
        } catch (error) {
            console.error('Failed to fetch profile:', error);
        }
    };

    useEffect(() => {
        refreshProfile();
    }, [isAuthenticated]);

    const openLogin = () => {
        setIsSignUpModalOpen(false);
        setIsLoginModalOpen(true);
    };

    const openSignUp = () => {
        setIsLoginModalOpen(false);
        setIsSignUpModalOpen(true);
    };

    const closeModals = () => {
        setIsLoginModalOpen(false);
        setIsSignUpModalOpen(false);
        setIsAuthenticated(!!localStorage.getItem('token'));
    };

    // Handle logout from other tabs or components
    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem('token');
            setIsAuthenticated(!!token);
            setIsPremium(localStorage.getItem('isPremium') === 'true');
            setUserRole(localStorage.getItem('userRole'));
        };

        window.addEventListener('storage', checkAuth);
        return () => window.removeEventListener('storage', checkAuth);
    }, []);

    return (
        <AuthContext.Provider value={{
            isLoginModalOpen,
            isSignUpModalOpen,
            openLogin,
            openSignUp,
            closeModals,
            isAuthenticated,
            isPremium,
            userRole,
            user,
            refreshProfile
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
