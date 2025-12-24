import axios from 'axios';

// The base URL for your custom server, not the JSON Server /api prefix
const AUTH_URL = 'http://localhost:8000/auth'; 

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
