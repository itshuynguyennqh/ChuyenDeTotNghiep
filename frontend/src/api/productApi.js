import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

/**
 * Lấy danh sách sản phẩm từ API, có hỗ trợ filter.
 * @param {object} params - Các tham số để lọc (ví dụ: { productsubcategoryid: 1 })
 * @returns {Promise}
 */
export const fetchProductsAPI = (params = {}) => {
    return axios.get(`${API_BASE_URL}/products/`, { params });
};

/**
 * Lấy danh sách tất cả danh mục.
 * @returns {Promise}
 */
export const fetchCategoriesAPI = () => {
    return axios.get(`${API_BASE_URL}/categories/`);
};
