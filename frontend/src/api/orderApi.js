import axiosClient from './axiosClient';

/**
 * NOTE: This file contains customer-facing order APIs.
 * Admin order management APIs are in adminApi.js
 * 
 * Some endpoints below may be using legacy paths. 
 * If backend has /users/orders endpoints, update accordingly.
 */

// ==================== Customer Order APIs ====================

/**
 * Place a new order (customer)
 * @param {Object} data - Order data
 * @returns {Promise} Created order
 * 
 * NOTE: This may use legacy endpoint. Check if backend has /users/orders endpoint.
 */
export const placeOrderAPI = (data) => {
  return axiosClient.post('/api/checkout/', data);
};

/**
 * Get customer's order history
 * @param {number} customerId - Customer ID
 * @returns {Promise} List of customer orders
 * 
 * NOTE: This uses legacy endpoint. 
 * Consider using /users/profile to get current user ID,
 * then /admin/customers/{id}/orders if customer can access their own orders.
 */
export const fetchOrderHistoryAPI = (customerId) => {
  return axiosClient.get(`/api/proc/view-orders/`, {
    params: { customerid: customerId }
  });
};

/**
 * Update order status (customer)
 * @param {number} salesOrderID - Sales Order ID
 * @param {string} newStatus - New status
 * @returns {Promise} Success message
 * 
 * NOTE: This uses legacy endpoint. 
 * Order status updates are typically handled by admin/staff via /admin/orders/{id}/status
 */
export const updateOrderStatusAPI = (salesOrderID, newStatus) => {
  return axiosClient.post('/api/proc/update-order-status/', {
    SalesOrderID: salesOrderID,
    NewStatus: newStatus
  });
};

/**
 * Cancel an order (customer)
 * @param {number} orderId - Order ID
 * @param {string} reason - Cancellation reason
 * @returns {Promise} Success message
 * 
 * NOTE: This may use legacy endpoint. 
 * Check if backend has /users/orders/{id}/cancel endpoint.
 */
export const cancelOrderAPI = (orderId, reason) => {
  return axiosClient.post('/api/orders/cancel/', {
    orderId,
    reason
  });
};

/**
 * Request order return (customer)
 * @param {number} orderId - Order ID
 * @param {Object} data - Return request data
 * @returns {Promise} Success message
 * 
 * NOTE: This may use legacy endpoint.
 */
export const returnRequestAPI = (orderId, data) => {
  return axiosClient.post(`/api/orders/${orderId}/return-request/`, data);
};

/**
 * Get invoice for an order
 * @param {number} orderId - Order ID
 * @returns {Promise} Invoice data
 * 
 * NOTE: This may use legacy endpoint.
 */
export const fetchInvoiceAPI = (orderId) => {
  return axiosClient.get(`/api/orders/${orderId}/invoice/`);
};

/**
 * Download invoice PDF
 * @param {number} orderId - Order ID
 * @returns {Promise} PDF blob
 * 
 * NOTE: This may use legacy endpoint.
 */
export const downloadInvoicePDFAPI = (orderId) => {
  return axiosClient.get(`/api/orders/${orderId}/invoice/pdf/`, {
    responseType: 'blob'
  });
};
