import axiosClient from './axiosClient';

export const loginAPI = (credentials) => {
    return axiosClient.post('/auth/login', credentials);
};

export const DangKyTaiKhoanView = (data) => {
    return axiosClient.post(`/auth/register/`, data);
};

export const login = loginAPI;

export const register = DangKyTaiKhoanView;

export const getAccountDetails = (customerId) => {
    return axiosClient.get(`/account/${customerId}`);
};