import axios from 'axios';

// FastAPI Backend Base URL
// 1. Nếu có biến môi trường REACT_APP_API_URL (ví dụ từ Ngrok), dùng nó.
// 2. Nếu không, mặc định dùng localhost với cổng 8000 (FastAPI default).
const baseURL = process.env.REACT_APP_API_URL || `http://${window.location.hostname}:8000`;

const axiosClient = axios.create({
    baseURL: baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
    // Note: FastAPI CORS is configured, withCredentials may not be needed
    withCredentials: false,
});

// Interceptor để tự động gắn token vào mọi request
axiosClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        
        // Fix lỗi ngrok "browser warning" (nếu dùng ngrok free)
        config.headers['ngrok-skip-browser-warning'] = 'true';

        return config;
    },
    (error) => Promise.reject(error)
);

export default axiosClient;