import React, { createContext, useContext, useEffect, useState } from 'react';
import { API_URL } from '../services/api';

interface SiteConfig {
    [key: string]: string;
}

interface SiteConfigContextType {
    config: SiteConfig;
    loading: boolean;
    refreshConfig: () => Promise<void>;
    updateConfig: (key: string, value: string) => void;
}

const SiteConfigContext = createContext<SiteConfigContextType | undefined>(undefined);

export const SiteConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [config, setConfig] = useState<SiteConfig>({
        site_name: 'RJG Property Connect',
        support_email: 'hq@rjgproperty.com',
        hero_title: 'Property Requirements',
        hero_subtitle: 'Browse what buyers and tenants are looking for in Rajnandgaon, or post your own requirement to connect with property owners.',
        about_text: 'The premier real estate bridge for Rajnandgaon and beyond. Verified community property intelligence.',
        maintenance_mode: 'false', // Default to false
        enable_listings: 'true',
        navbar_dropdown: 'true',
        enable_mortgage: 'true',
        enable_properties: 'true',
        enable_requirements: 'true',
        enable_about: 'true',
        enable_auctions: 'true',
        enable_sdv: 'true',
        enable_search: 'true',
        enable_notifications: 'true',
        enable_navbar_tagline: 'true',
        enable_mortgage_listings: 'true',
        registration_role_selection: 'true',
        dashboard_my_properties: 'true',
        dashboard_my_requirements: 'true',
        dashboard_mortgage: 'true',
        dashboard_saved_list: 'true',
        dashboard_settings: 'true'
    });


    const fetchConfig = async () => {
        if (isRefreshing) {
            console.log('Already refreshing, skipping...');
            return;
        }
        
        setIsRefreshing(true);
        try {
            const response = await fetch(`${API_URL}/config`);
            if (response.ok) {
                const data = await response.json();
                setConfig(prev => ({ ...prev, ...data }));
                console.log('Config refreshed from backend:', data);
            }
        } catch (error) {
            console.error('Failed to fetch site config', error);
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    const updateConfig = async (key: string, value: string) => {
        // Don't update if the value is the same
        if (config[key] === value) {
            console.log('Config value unchanged, skipping update');
            return;
        }
        
        // Update local state immediately
        setConfig(prev => ({ ...prev, [key]: value }));
        
        // Also update on backend
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/admin/cms/config`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ [key]: value }),
            });
            
            if (!response.ok) {
                console.error('Failed to update config on backend');
                // Revert on error
                setConfig(prev => ({ ...prev, [key]: prev[key] || '' }));
            } else {
                console.log('Config updated successfully on backend');
                // Wait a bit then refresh to get latest state
                setTimeout(() => {
                    fetchConfig();
                }, 500);
            }
        } catch (error) {
            console.error('Failed to update config:', error);
            // Revert on error
            setConfig(prev => ({ ...prev, [key]: prev[key] || '' }));
        }
    };

    useEffect(() => {
        fetchConfig();
    }, []);

    return (
        <SiteConfigContext.Provider value={{ config, loading, refreshConfig: fetchConfig, updateConfig }}>
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
