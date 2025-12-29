import axiosClient from './axiosClient';

export const placeOrderAPI = (data) => {
    return axiosClient.post('/api/checkout/', data);
};

export const fetchOrderHistoryAPI = (customerId) => {
    return axiosClient.get(`/api/proc/view-orders/`,{params: {customerid: customerId}});
};

export const updateOrderStatusAPI = (salesOrderID, newStatus) => {
    return axiosClient.post('/api/proc/update-order-status/', { SalesOrderID: salesOrderID, NewStatus: newStatus });
};