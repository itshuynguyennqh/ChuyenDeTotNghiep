import axiosClient from './axiosClient';

/**
 * NOTE: This file contains staff-specific order management APIs.
 * Admin staff management (CRUD) is in adminApi.js
 * Category and Product management for staff should use adminApi.js
 */

// ==================== Staff Order Management APIs ====================

/**
 * Fetch orders (for staff view)
 * This is similar to admin orders but may have different permissions/filtering
 * @param {Object} params - Query parameters
 * @returns {Promise} List of orders
 * 
 * NOTE: This uses legacy endpoint. 
 * Consider using /admin/orders with appropriate staff permissions.
 */
export const fetchOrdersAPI = (params = {}) => {
  return axiosClient.get('/api/proc/view-orders/', { params });
};

/**
 * Fetch order details (for staff view)
 * @param {number} orderId - Order ID
 * @returns {Promise} Order details
 * 
 * NOTE: This uses legacy endpoint.
 * Consider using /admin/orders/{id}?type={sale|rental}
 */
export const fetchOrderDetailAPI = (orderId) => {
  return axiosClient.get(`/api/proc/view-orders/`, {
    params: { salesorderid: orderId }
  });
};

/**
 * Update order status (for staff)
 * @param {number} salesOrderID - Sales Order ID
 * @param {string} newStatus - New status
 * @returns {Promise} Success message
 * 
 * NOTE: This uses legacy endpoint.
 * Consider using /admin/orders/{id}/status?type={sale|rental}
 */
export const updateOrderStatusAPI = (salesOrderID, newStatus) => {
  return axiosClient.post('/api/proc/update-order-status/', {
    SalesOrderID: salesOrderID,
    NewStatus: newStatus
  });
};

/**
 * Prepare rental order for pickup (for staff)
 * @param {number} orderId - Order ID
 * @param {Object} data - Preparation data
 * @returns {Promise} Success message
 * 
 * NOTE: This may use legacy endpoint.
 * Consider using /admin/orders/{id}/rental-preparation
 */
export const prepareForPickupAPI = (orderId, data) => {
  return axiosClient.post(`/api/orders/${orderId}/prepare-pickup/`, data);
};

/**
 * Review cancellation request (for staff)
 * This might be handled via adminApi.reviewCancellationRequest
 * but keeping here for staff-specific workflow if needed
 */
export const reviewCancellationRequestAPI = async (orderId, type, decision, reason = '') => {
  // Use admin API endpoint if available
  const { reviewCancellationRequest } = await import('./adminApi');
  return reviewCancellationRequest(orderId, type, decision, reason);
};
