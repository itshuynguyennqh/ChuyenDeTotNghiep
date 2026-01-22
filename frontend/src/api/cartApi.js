import axiosClient from './axiosClient';

/**
 * @deprecated This file uses legacy endpoints. 
 * Please use storeApi.js instead which uses the correct endpoints from API documentation.
 * 
 * Migration guide:
 * - fetchCartAPI() -> use storeApi.getCart()
 * - addToCartAPI() -> use storeApi.addToCart()
 * - deleteCartItemAPI() -> use storeApi.removeCartItem()
 * - updateCartItemAPI() -> use storeApi.updateCartItem()
 * - checkoutAPI() -> use storeApi.checkout()
 */

// Legacy endpoints - kept for backward compatibility
// These will be removed in future versions. Please migrate to storeApi.js

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

export const checkoutAPI = (data) => {
    return axiosClient.post('/api/checkout', data);
};