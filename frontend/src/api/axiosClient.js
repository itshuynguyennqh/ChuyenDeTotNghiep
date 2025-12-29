import axios from 'axios';

const axiosClient = axios.create({
    baseURL: `http://${window.location.hostname}:8000`,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// Interceptor để tự động gắn token vào mọi request
axiosClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default axiosClient;