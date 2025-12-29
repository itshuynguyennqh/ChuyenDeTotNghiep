import axiosClient from './axiosClient';

export const fetchCartAPI = () => {
    return axiosClient.get('/api/cart/');
};

export const addToCartAPI = (data) => {
    return axiosClient.post('/api/cart/items/', data);
};

export const deleteCartItemAPI = (itemId) => {
    return axiosClient.delete(`/api/cart/items/${itemId}/`);
};

export const updateCartItemAPI = (itemId, data) => {
    return axiosClient.put(`/api/cart/items/${itemId}/`, data);
};