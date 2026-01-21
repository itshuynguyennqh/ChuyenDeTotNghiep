import axios from 'axios';

// Logic:
// 1. Nếu có biến môi trường REACT_APP_API_URL (ví dụ từ Ngrok), dùng nó.
// 2. Nếu không, mặc định dùng localhost hoặc IP mạng LAN hiện tại với cổng 8000.
const baseURL = process.env.REACT_APP_API_URL || `http://${window.location.hostname}:8000`;

const axiosClient = axios.create({
    baseURL: baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
    // Lưu ý: Khi dùng Ngrok bản free, đôi khi withCredentials gây lỗi CORS hoặc browser chặn cookie,
    // nhưng với setup hiện tại cứ giữ nguyên.
    withCredentials: true,
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