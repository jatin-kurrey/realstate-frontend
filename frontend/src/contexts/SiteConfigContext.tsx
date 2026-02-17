import React, { createContext, useContext, useEffect, useState } from 'react';
import { API_URL } from '../services/api';

interface SiteConfig {
    [key: string]: string;
}

interface SiteConfigContextType {
    config: SiteConfig;
    refreshConfig: () => Promise<void>;
    updateConfig: (key: string, value: string) => void;
}

const SiteConfigContext = createContext<SiteConfigContextType | undefined>(undefined);

export const SiteConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [config, setConfig] = useState<SiteConfig>({
        site_name: 'RJG Property Connect',
        support_email: 'hq@rjgproperty.com',
        hero_title: 'Property Requirements',
        hero_subtitle: 'Browse what buyers and tenants are looking for in Rajnandgaon, or post your own requirement to connect with property owners.',
        about_text: 'The premier real estate bridge for Rajnandgaon and beyond. Verified community property intelligence.'
    });

    const fetchConfig = async () => {
        try {
            const response = await fetch(`${API_URL}/config`);
            if (response.ok) {
                const data = await response.json();
                setConfig(prev => ({ ...prev, ...data }));
            }
        } catch (error) {
            console.error('Failed to fetch site config', error);
        }
    };

    const updateConfig = (key: string, value: string) => {
        setConfig(prev => ({ ...prev, [key]: value }));
    };

    useEffect(() => {
        fetchConfig();
    }, []);

    return (
        <SiteConfigContext.Provider value={{ config, refreshConfig: fetchConfig, updateConfig }}>
            {children}
        </SiteConfigContext.Provider>
    );
};

export const useSiteConfig = () => {
    const context = useContext(SiteConfigContext);
    if (context === undefined) {
        throw new Error('useSiteConfig must be used within a SiteConfigProvider');
    }
    return context;
};
