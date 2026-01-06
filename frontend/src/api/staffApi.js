import axiosClient from './axiosClient';

// Order Management APIs
export const fetchOrdersAPI = (params = {}) => {
    return axiosClient.get('/api/proc/view-orders/', { params });
};

export const fetchOrderDetailAPI = (orderId) => {
    return axiosClient.get(`/api/proc/view-orders/`, { 
        params: { salesorderid: orderId } 
    });
};

export const updateOrderStatusAPI = (salesOrderID, newStatus) => {
    return axiosClient.post('/api/proc/update-order-status/', { 
        SalesOrderID: salesOrderID, 
        NewStatus: newStatus 
    });
};

export const cancelOrderAPI = (orderId, reason) => {
    return axiosClient.post('/api/orders/cancel/', { 
        orderId, 
        reason 
    });
};

export const prepareForPickupAPI = (orderId, data) => {
    return axiosClient.post(`/api/orders/${orderId}/prepare-pickup/`, data);
};

export const returnRequestAPI = (orderId, data) => {
    return axiosClient.post(`/api/orders/${orderId}/return-request/`, data);
};

// Category Management APIs
export const fetchCategoriesAPI = () => {
    return axiosClient.get('/api/categories/');
};

export const createCategoryAPI = (data) => {
    return axiosClient.post('/api/categories/', data);
};

export const updateCategoryAPI = (id, data) => {
    return axiosClient.put(`/api/categories/${id}/`, data);
};

export const deleteCategoryAPI = (id) => {
    return axiosClient.delete(`/api/categories/${id}/`);
};

// Product Management APIs (enhanced)
export const fetchProductsWithFiltersAPI = (params = {}) => {
    return axiosClient.get('/api/product/', { params });
};

export const updateProductStatusAPI = (id, status) => {
    return axiosClient.patch(`/api/product/${id}/`, { status });
};

// Invoice APIs
export const fetchInvoiceAPI = (orderId) => {
    return axiosClient.get(`/api/orders/${orderId}/invoice/`);
};

export const downloadInvoicePDFAPI = (orderId) => {
    return axiosClient.get(`/api/orders/${orderId}/invoice/pdf/`, {
        responseType: 'blob'
    });
};
