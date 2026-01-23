import axiosClient from './axiosClient';

// ===================================================================
// USER API - Profile Endpoints
// ===================================================================

/**
 * Get user profile
 * @returns {Promise} User profile data
 */
export const getUserProfile = () => {
  return axiosClient.get('/user/profile');
};

/**
 * Update user profile
 * @param {Object} data - Profile update data (first_name, last_name, phone, avatar_url - all optional)
 * @returns {Promise} Success response
 */
export const updateUserProfile = (data) => {
  return axiosClient.patch('/user/profile', data);
};

// ===================================================================
// USER API - Address Endpoints
// ===================================================================

/**
 * Get user addresses
 * @returns {Promise} List of user addresses
 */
export const fetchAddressesAPI = () => {
  return axiosClient.get('/user/addresses');
};

/**
 * Add new address
 * @param {Object} data - Address data (address_line1, city, postal_code, phone_number, is_default)
 * @returns {Promise} Created address data
 */
export const addAddressAPI = (data) => {
  return axiosClient.post('/user/addresses', data);
};

/**
 * Update address
 * @param {number} addressId - Address ID
 * @param {Object} data - Address update data (all fields optional)
 * @returns {Promise} Success response
 */
export const updateAddressAPI = (addressId, data) => {
  return axiosClient.patch(`/user/addresses/${addressId}`, data);
};

/**
 * Delete address
 * @param {number} addressId - Address ID
 * @returns {Promise} Success response
 */
export const deleteAddressAPI = (addressId) => {
  return axiosClient.delete(`/user/addresses/${addressId}`);
};

// ===================================================================
// USER API - Order Endpoints
// ===================================================================

/**
 * Get user's orders
 * @param {Object} params - Query parameters (page, limit, type: 'all'|'sale'|'rental')
 * @returns {Promise} List of user orders
 */
export const getUserOrders = (params = {}) => {
  // Get customer ID from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const customerId = user.id;
  
  if (!customerId) {
    return Promise.reject(new Error('User not logged in'));
  }
  
  return axiosClient.get(`/admin/customers/${customerId}/orders`, { params });
};

// Backward compatibility aliases
export const updateAccountAPI = updateUserProfile;
