import axios from 'axios';

// Logic:
// 1. Nếu có biến môi trường REACT_APP_API_URL (ví dụ từ Ngrok), dùng nó.
// 2. Nếu không, mặc định dùng localhost với cổng 8001 (theo API documentation).
const baseURL = process.env.REACT_APP_API_URL || `http://${window.location.hostname}:8001`;

const axiosClient = axios.create({
    baseURL: baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
    // Auth của dự án đang dùng Bearer token (Authorization header), không dùng cookie.
    // Bật withCredentials thường gây "Network Error" do CORS/credentials mismatch.
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

// Response interceptor để xử lý format response từ backend
axiosClient.interceptors.response.use(
    (response) => {
        // Backend trả về format: {success, data, message, pagination}
        // Giữ nguyên response để các API có thể truy cập đầy đủ thông tin
        return response;
    },
    (error) => {
        // Xử lý error responses từ backend
        if (error.response) {
            // Xử lý 401 Unauthorized - Token hết hạn hoặc không hợp lệ
            if (error.response.status === 401) {
                // Xóa token và user info khỏi localStorage
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                
                // Chỉ redirect nếu không phải đang ở trang login/signup
                const currentPath = window.location.pathname;
                if (!currentPath.includes('/login') && !currentPath.includes('/signup')) {
                    // Redirect đến trang login
                    window.location.href = '/login';
                    return Promise.reject(new Error('Session expired. Please login again.'));
                }
            }
            
            // Backend trả về errors dạng: {detail: "Error message"}
            const errorMessage = error.response.data?.detail || 
                                error.response.data?.message || 
                                error.response.statusText || 
                                'An error occurred';
            
            // Tạo error object với message rõ ràng hơn
            const customError = new Error(errorMessage);
            customError.status = error.response.status;
            customError.data = error.response.data;
            
            return Promise.reject(customError);
        } else if (error.request) {
            // Request được gửi nhưng không nhận được response
            return Promise.reject(new Error('Network error: No response from server'));
        } else {
            // Có lỗi khi setup request
            return Promise.reject(error);
        }
    }
);

export default axiosClient;