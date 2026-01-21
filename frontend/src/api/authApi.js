import axiosClient from './axiosClient';

/**
 * Login API
 * @param {Object} credentials - {identifier: string (email or phone), password: string}
 * @returns {Promise} Response with {access_token, token_type, role, name, id}
 */
export const loginAPI = (credentials) => {
    return axiosClient.post('/auth/login', credentials);
};

/**
 * Register API
 * @param {Object} data - {first_name, last_name, email, phone, password}
 * @returns {Promise} Response with {message}
 */
export const DangKyTaiKhoanView = (data) => {
    return axiosClient.post('/auth/register', data);
};

/**
 * Verify Registration OTP
 * @param {Object} data - {email: string, otp: string}
 * @returns {Promise} Response with {message, customer_id}
 */
export const verifyRegistrationAPI = (data) => {
    return axiosClient.post('/auth/verify-registration', data);
};

/**
 * Forgot Password - Send OTP
 * @param {Object} data - {email: string}
 * @returns {Promise} Response with {message}
 */
export const forgotPasswordAPI = (data) => {
    return axiosClient.post('/auth/forgot-password', data);
};

/**
 * Reset Password with OTP
 * @param {Object} data - {email: string, otp: string, new_password: string}
 * @returns {Promise} Response with {message}
 */
export const resetPasswordAPI = (data) => {
    return axiosClient.post('/auth/reset-password', data);
};

// Aliases for backward compatibility
export const login = loginAPI;
export const register = DangKyTaiKhoanView;
export const verifyRegistration = verifyRegistrationAPI;
export const forgotPassword = forgotPasswordAPI;
export const resetPassword = resetPasswordAPI;

// Legacy endpoint - kept for backward compatibility
export const getAccountDetails = (customerId) => {
    return axiosClient.get(`/account/${customerId}`);
};