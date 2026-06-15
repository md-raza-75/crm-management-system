import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL + '/api',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle errors
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            window.dispatchEvent(new Event('auth:unauthorized'));
        }
        return Promise.reject(error);
    }
);

// CSRF token fetch for Sanctum
export const fetchCsrfCookie = async () => {
    try {
        await api.get('/sanctum/csrf-cookie');
        return true;
    } catch (error) {
        console.error('Failed to fetch CSRF cookie:', error);
        return false;
    }
};

// Login function with Sanctum
export const login = async (email, password) => {
    await fetchCsrfCookie();
    const response = await api.post('/login', { email, password });
    if (response.data.token) {
        localStorage.setItem('token', response.data.token);
    }
    return response;
};

// Logout function
export const logout = async () => {
    await api.post('/logout');
    localStorage.removeItem('token');
};

export default api;