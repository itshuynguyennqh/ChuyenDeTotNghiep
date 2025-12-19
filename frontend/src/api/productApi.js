import axios from 'axios';

const API_BASE_URL = `http://${window.location.hostname}:8000/api`;

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // Thêm dòng này
});

// Thêm interceptor để tự động gắn token vào header
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const fetchProductsAPI = (params = {}) => {
    return api.get('/products/', { params });
};

export const fetchProductDetailAPI = (id) => {
    return api.get(`/products/${id}/`);
};

export const fetchCategoriesAPI = () => {
    return api.get('/categories/');
};

export const loginAPI = (credentials) => {
    return api.post('/auth/login/', credentials);
};

export const fetchCartAPI = () => {
    return api.get('/cart/');
};

export const addToCartAPI = (data) => {
    return api.post('/cart/items/', data);
};

export const placeOrderAPI = (data) => {
    return api.post('/checkout/', data);
};

export const deleteCartItemAPI = (itemId) => {
    return api.delete(`/cart/items/${itemId}/`);
};

export const updateCartItemAPI = (itemId, data) => {
    return api.put(`/cart/items/${itemId}/`, data);
};

export const fetchOrderHistoryAPI = (customerId) => {
    return api.get(`/proc/view-orders/`,{params: {customerid: customerId}});
};

export const updateAccountAPI = (data) => {
  return api.post(`/proc/manage-account/`, data)
};

export const DangKyTaiKhoanView = (data) => {
    return api.post(`/auth/register/`, data);
};

// Address APIs
export const fetchAddressesAPI = () => {
    return api.get('/addresses/');
};

export const addAddressAPI = (data) => {
    return api.post('/addresses/', data);
};

export const updateAddressAPI = (id, data) => {
    return api.put(`/addresses/${id}/`, data);
};

export const deleteAddressAPI = (id) => {
    return api.delete(`/addresses/${id}/`);
};
