import axios from 'axios';
import { Property, Requirement, Advertisement, LocationMetadata } from '../types/types';

export const locationService = {
    getAll: async (params?: { type?: string; parent_id?: number | string }) => {
        const response = await api.get<LocationMetadata[]>('/locations', { params });
        return response.data;
    },
    adminCreate: async (data: Omit<LocationMetadata, 'id'>) => {
        const response = await api.post<LocationMetadata>('/admin/locations', data);
        return response.data;
    },
    adminUpdate: async (id: number | string, data: Partial<LocationMetadata>) => {
        const response = await api.put<LocationMetadata>(`/admin/locations/${id}`, data);
        return response.data;
    },
    adminDelete: async (id: number | string) => {
        await api.delete(`/admin/locations/${id}`);
    },
    adminBulkImport: async (data: any[]) => {
        const response = await api.post('/admin/locations/bulk', data);
        return response.data;
    }
};

const getApiBaseUrl = () => {
    // If it's explicitly set in the env
    const envUrl = (import.meta as any).env?.VITE_API_URL;
    if (envUrl && envUrl !== 'http://localhost:5002') return envUrl;
    
    // Auto-detect based on where the frontend is served from
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        // If we are browsing on a local network IP or other remote host, assume backend is running on the same IP at port 5002
        if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
             return `${window.location.protocol}//${hostname}:5002`;
        }
    }
    
    return 'http://localhost:5002';
};

const API_BASE_URL = getApiBaseUrl();
const API_URL = `${API_BASE_URL}/api`;

export const getImageUrl = (url?: string): string => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
        // If it accidentally hardcoded localhost in database, rewrite it dynamically
        if (url.includes('localhost:5001') || url.includes('localhost:5002') || url.includes('localhost:8080')) {
            const path = new URL(url).pathname;
            return `${API_BASE_URL}${path}`;
        }
        return url;
    }
    // Prefix relative paths with the determined backend URL
    const relativePath = url.startsWith('/') ? url : `/uploads/${url}`;
    return `${API_BASE_URL}${relativePath}`;
};

export { API_URL, API_BASE_URL };

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    }
});

// Add a request interceptor to include the auth token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Add a response interceptor to handle token expiry
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            // Token expired or unauthorized
            localStorage.removeItem('token');
            localStorage.removeItem('userRole');
            localStorage.removeItem('user');
            sessionStorage.removeItem('isAdminAuthenticated');

            // Optional: redirect to home or login
            if (window.location.pathname.startsWith('/admin')) {
                window.location.href = '/admin'; // Force login page
            }
        }
        return Promise.reject(error);
    }
);

export const propertyService = {
    getAll: async (params?: Record<string, any>) => {
        const response = await api.get<Property[]>('/properties', { params });
        return response.data;
    },
    getMyListings: async () => {
        const response = await api.get<Property[]>('/properties/me');
        return response.data;
    },
    getById: async (id: string) => {
        const response = await api.get<Property>(`/properties/${id}`);
        return response.data;
    },
    create: async (property: Omit<Property, 'id'>) => {
        const response = await api.post<Property>('/properties', property);
        return response.data;
    },
    update: async (id: string, property: Partial<Property>) => {
        const response = await api.put(`/properties/${id}`, property);
        return response.data;
    },
    delete: async (id: string) => {
        const response = await api.delete(`/properties/${id}`);
        return response.data;
    },
    toggleActive: async (id: string | number) => {
        const response = await api.patch(`/properties/${id}/toggle-active`);
        return response.data;
    }
};


export const requirementService = {
    getAll: async (params?: any) => {
        const response = await api.get<Requirement[]>('/requirements', { params });
        return response.data;
    },
    getMyRequirements: async () => {
        const response = await api.get<Requirement[]>('/requirements/me');
        return response.data;
    },
    getById: async (id: string | number) => {
        const response = await api.get<Requirement>(`/requirements/${id}`);
        return response.data;
    },
    create: async (requirement: Omit<Requirement, 'id'>) => {
        const response = await api.post<Requirement>('/requirements', requirement);
        return response.data;
    },
    update: async (id: string | number, requirement: Partial<Requirement>) => {
        const response = await api.put<Requirement>(`/requirements/${id}`, requirement);
        return response.data;
    },
    delete: async (id: string) => {
        const response = await api.delete(`/requirements/${id}`);
        return response.data;
    },
    toggleActive: async (id: string | number) => {
        const response = await api.patch(`/requirements/${id}/toggle-active`);
        return response.data;
    }
};


export const notificationService = {
    getAll: async () => {
        const response = await api.get('/notifications');
        return response.data;
    },
    markRead: async (id: string) => {
        const response = await api.patch(`/notifications/${id}/read`);
        return response.data;
    },
    markAllRead: async () => {
        const response = await api.post('/notifications/read-all');
        return response.data;
    }
};


export const adminService = {
    getUsers: async () => {
        const response = await api.get('/admin/users');
        return response.data;
    },
    updateUserRole: async (id: number, role: string) => {
        const response = await api.patch(`/admin/users/${id}/role`, { role });
        return response.data;
    },
    deleteUser: async (id: number) => {
        const response = await api.delete(`/admin/users/${id}`);
        return response.data;
    },
    toggleUserBan: async (id: number) => {
        const response = await api.patch(`/admin/users/${id}/toggle-ban`);
        return response.data;
    },
    updateUserBadge: async (id: number, badge: string) => {
        const response = await api.patch(`/admin/users/${id}/badge`, { badge });
        return response.data;
    },


    getStats: async () => {
        const response = await api.get('/admin/stats');
        return response.data;
    },
    exportData: async () => {
        const response = await api.get('/admin/export', { responseType: 'blob' });
        return response.data;
    },
    getAllProperties: async () => {
        const response = await api.get('/admin/properties');
        return response.data;
    },
    getAllRequirements: async () => {
        const response = await api.get('/admin/requirements');
        return response.data;
    },
    toggleVerification: async (id: number | string) => {
        const response = await api.patch(`/admin/properties/${id}/verify`);
        return response.data;
    },
    toggleFeatured: async (id: number | string) => {
        const response = await api.patch(`/admin/properties/${id}/feature`);
        return response.data;
    },
    toggleRequirementVerification: async (id: number | string) => {
        const response = await api.patch(`/admin/requirements/${id}/verify`);
        return response.data;
    },
    toggleActive: async (id: number | string) => {
        const response = await api.patch(`/admin/properties/${id}/toggle-active`);
        return response.data;
    },
    toggleRequirementActive: async (id: number | string) => {
        const response = await api.patch(`/admin/requirements/${id}/toggle-active`);
        return response.data;
    },

    updateConfig: async (config: any) => {
        const response = await api.put('/admin/cms/config', config);
        return response.data;
    },
    uploadImage: async (formData: FormData) => {
        const response = await api.post('/cms/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },
    getPremiumRequests: async () => {
        const response = await api.get('/admin/premium/requests');
        return response.data;
    },
    updatePremiumRequest: async (id: number | string, status: string) => {
        const response = await api.patch(`/admin/premium/requests/${id}`, { status });
        return response.data;
    },
    toggleUserPremium: async (id: number | string, isPremium: boolean) => {
        const response = await api.patch(`/admin/users/${id}/premium`, { is_premium: isPremium });
        return response.data;
    }
};

export const premiumService = {
    requestPremium: async (message: string) => {
        const response = await api.post('/premium/request', { message });
        return response.data;
    }
};


export const userService = {
    getProfile: async () => {
        const response = await api.get('/user/profile');
        return response.data;
    },
    updateProfile: async (userData: any) => {
        const response = await api.put('/user/profile', userData);
        return response.data;
    },
    deactivateAccount: async () => {
        const response = await api.delete('/user/deactivate');
        return response.data;
    }
};

export const bookmarkService = {
    getAll: async () => {
        const response = await api.get('/bookmarks');
        return response.data;
    },
    toggle: async (targetId: string | number, type: 'property' | 'requirement') => {
        const response = await api.post('/bookmarks/toggle', { target_id: targetId, type });
        return response.data;
    },
    isBookmarked: async (targetId: string | number, type: 'property' | 'requirement') => {
        const response = await api.get(`/bookmarks/check?target_id=${targetId}&type=${type}`);
        return response.data.isBookmarked;
    }
};

export const authService = {
    login: async (credentials: any) => {
        const response = await api.post('/auth/login', credentials);
        if (response.data.token) {
            // GLOBAL FAILSAFE: If email is master admin, force role to admin
            // This safeguards against database role mismatches or accidental demotions
            if (response.data.user.email === 'admin@rjg.com') {
                response.data.user.role = 'admin';
            }

            localStorage.setItem('token', response.data.token);
            localStorage.setItem('userRole', response.data.user.role);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    },
    googleLogin: async (data: { email: string; name: string; token: string }) => {
        const response = await api.post('/auth/google', data);
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('userRole', response.data.user.role || 'seeker');
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    },
    register: async (userData: any) => {
        const response = await api.post('/auth/register', userData);
        return response.data;
    },
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
    }
};

export const advertisementService = {
    getActiveAds: async (): Promise<Advertisement[]> => {
        const response = await api.get<Advertisement[]>('/advertisements');
        return response.data;
    },
    adminGetAds: async (): Promise<Advertisement[]> => {
        const response = await api.get<Advertisement[]>('/admin/advertisements');
        return response.data;
    },
    adminCreateAd: async (adData: Partial<Advertisement>): Promise<Advertisement> => {
        const response = await api.post<Advertisement>('/admin/advertisements', adData);
        return response.data;
    },
    adminUpdateAd: async (id: number | string, adData: Partial<Advertisement>): Promise<Advertisement> => {
        const response = await api.put<Advertisement>(`/admin/advertisements/${id}`, adData);
        return response.data;
    },
    adminDeleteAd: async (id: number | string): Promise<void> => {
        await api.delete(`/admin/advertisements/${id}`);
    }
};

export default api;
