import axiosClient from './axiosClient';

/**
 * @deprecated This file uses legacy endpoints.
 * 
 * For customer-facing product APIs, please use storeApi.js:
 * - fetchProductsAPI() -> use storeApi.searchProducts()
 * - fetchProductDetailAPI() -> use storeApi.getProductDetail()
 * 
 * For admin product management, please use adminApi.js:
 * - createProductAPI() -> use adminApi.createAdminProduct()
 * - updateProductAPI() -> use adminApi.updateAdminProduct()
 * - deleteProductAPI() -> use adminApi.deleteAdminProduct()
 * - fetchCategoriesAPI() -> use adminApi.getAdminCategories()
 */

// Legacy endpoints - kept for backward compatibility
// These will be removed in future versions. Please migrate to storeApi.js or adminApi.js

export const fetchProductsAPI = (params = {}) => {
    return axiosClient.get('/api/product/', { params });
};

export const fetchProductDetailAPI = (id) => {
    return axiosClient.get(`/api/product?ProductID=${id}`);
};

export const createProductAPI = (data) => {
    return axiosClient.post('/api/product/', data);
};

export const updateProductAPI = (id, data) => {
    return axiosClient.put(`/api/product/${id}/`, data);
};

export const deleteProductAPI = (id) => {
    return axiosClient.delete(`/api/product/${id}/`);
};

export const fetchCategoriesAPI = () => {
    return axiosClient.get('/api/categories/');
};

export * from './cartApi';
export * from './userApi';
export * from './orderApi';
