import axiosClient from './axiosClient';

/**
 * Login API - Authenticate user (customer or employee)
 * @param {Object} credentials - { identifier: string, password: string }
 * @returns {Promise} Response with access_token, role, name, id
 */
export const loginAPI = (credentials) => {
    return axiosClient.post('/auth/login', credentials);
};

/**
 * Register API - Register new customer
 * @param {Object} data - { first_name, last_name, email, phone, password }
 * @returns {Promise} Response with message
 */
export const register = (data) => {
    return axiosClient.post('/auth/register', data);
};

/**
 * Verify Registration API - Verify OTP after registration
 * @param {Object} data - { email, otp }
 * @returns {Promise} Response with message and customer_id
 */
export const verifyRegistration = (data) => {
    return axiosClient.post('/auth/verify-registration', data);
};

/**
 * Forgot Password API - Request password reset OTP
 * @param {Object} data - { email }
 * @returns {Promise} Response with message
 */
export const forgotPassword = (data) => {
    return axiosClient.post('/auth/forgot-password', data);
};

/**
 * Reset Password API - Reset password with OTP
 * @param {Object} data - { email, otp, new_password }
 * @returns {Promise} Response with message
 */
export const resetPassword = (data) => {
    return axiosClient.post('/auth/reset-password', data);
};

// Legacy exports for backward compatibility
export const login = loginAPI;
export const DangKyTaiKhoanView = register;
