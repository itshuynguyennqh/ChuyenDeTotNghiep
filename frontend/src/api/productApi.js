import axiosClient from './axiosClient';

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
