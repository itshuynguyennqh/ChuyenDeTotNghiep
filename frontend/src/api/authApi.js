import axios from 'axios';

// The base URL for your custom server, not the JSON Server /api prefix
const AUTH_URL = 'http://localhost:8000/auth'; 
const BASE_URL = 'http://localhost:8000';

export const login = async (email, password) => {
    try {
        const response = await axios.post(`${AUTH_URL}/login`, { email, password });
        return response.data;
    } catch (error) {
        console.error('Login failed:', error.response ? error.response.data : error.message);
        throw new Error(error.response?.data?.message || 'Login failed. Please check your credentials.');
    }
};

export const register = async (userData) => {
    try {
        // The userData object already contains everything needed for the backend
        const response = await axios.post(`${AUTH_URL}/register`, userData);
        return response.data;
    } catch (error) {
        console.error('Registration failed:', error.response ? error.response.data : error.message);
        throw new Error(error.response?.data?.message || 'Registration failed. Please try again.');
    }
};

export const getAccountDetails = async (customerId) => {
    try {
        const response = await axios.get(`${BASE_URL}/account/${customerId}`);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch account details:', error);
        throw error;
    }
};
