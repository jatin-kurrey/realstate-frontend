import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface AuthContextType {
    isLoginModalOpen: boolean;
    isSignUpModalOpen: boolean;
    openLogin: () => void;
    openSignUp: () => void;
    closeModals: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

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
    };

    // Re-check auth status when modals close (often after login)
    useEffect(() => {
        const checkAuth = () => {
            const token = !!localStorage.getItem('token');
            if (token !== isAuthenticated) {
                setIsAuthenticated(token);
            }
        };

        if (!isLoginModalOpen && !isSignUpModalOpen) {
            checkAuth();
        }

        // Handle logout from other tabs or components
        window.addEventListener('storage', checkAuth);
        return () => window.removeEventListener('storage', checkAuth);
    }, [isLoginModalOpen, isSignUpModalOpen, isAuthenticated]);

    return (
        <AuthContext.Provider value={{
            isLoginModalOpen,
            isSignUpModalOpen,
            openLogin,
            openSignUp,
            closeModals,
            isAuthenticated
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
