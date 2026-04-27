import { API_URL, ADMIN_SECRET_KEY } from '../config';

/**
 * Enhanced fetch wrapper for admin operations
 * Automatically adds Authorization and X-Admin-Secret headers
 */
export const adminFetch = async (endpoint, options = {}) => {
    const token = localStorage.getItem('token');
    
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    if (ADMIN_SECRET_KEY) {
        headers['X-Admin-Secret'] = ADMIN_SECRET_KEY;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    return response;
};
