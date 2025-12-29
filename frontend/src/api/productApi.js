import axiosClient from './axiosClient';

export const fetchProductsAPI = (params = {}) => {
    return axiosClient.get('/api/product/', { params });
};

export const fetchProductDetailAPI = (id) => {
    return axiosClient.get(`/api/product?ProductID=${id}`);
};

export const fetchCategoriesAPI = () => {
    return axiosClient.get('/api/categories/');
};

export * from './cartApi';
export * from './userApi';
export * from './orderApi';
