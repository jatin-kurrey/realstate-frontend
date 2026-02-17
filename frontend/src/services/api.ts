import axios from 'axios';
import { Property, Requirement } from '../types/types';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5002';
const API_URL = `${API_BASE_URL}/api`;
export { API_URL };

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
    getAll: async () => {
        const response = await api.get<Property[]>('/properties');
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
};


export const requirementService = {
    getAll: async () => {
        const response = await api.get<Requirement[]>('/requirements');
        return response.data;
    },
    create: async (requirement: Omit<Requirement, 'id'>) => {
        const response = await api.post<Requirement>('/requirements', requirement);
        return response.data;
    },
    delete: async (id: string) => {
        const response = await api.delete(`/requirements/${id}`);
        return response.data;
    },
};

export const inquiryService = {
    create: async (inquiryData: any) => {
        const response = await api.post('/inquiries', inquiryData);
        return response.data;
    },
    getMyInquiries: async () => {
        const response = await api.get('/inquiries/me');
        return response.data;
    },
    getInquiryDetail: async (id: string) => {
        const response = await api.get(`/inquiries/${id}`);
        return response.data;
    },
    sendMessage: async (id: string, message: string) => {
        const response = await api.post(`/inquiries/${id}/messages`, { message });
        return response.data;
    },
    updateStatus: async (id: string, status: string) => {
        const response = await api.patch(`/inquiries/${id}/status`, { status });
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

export const paymentService = {
    getMyPayments: async () => {
        const response = await api.get('/payments/me');
        return response.data;
    },
    create: async (paymentData: any) => {
        const response = await api.post('/payments', paymentData);
        return response.data;
    },
    processListingPayment: async (paymentInfo: { property_id: number | string, amount: number, plan?: string }) => {
        const response = await api.post('/payments/process', paymentInfo);
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

    getPayments: async () => {
        const response = await api.get('/admin/payments');
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
        localStorage.removeItem('user');
    }
};

export default api;
