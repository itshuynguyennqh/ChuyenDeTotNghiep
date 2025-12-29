import axiosClient from './axiosClient';

export const updateAccountAPI = (data) => {
  return axiosClient.post(`/api/proc/manage-account/`, data)
};

// Address APIs
export const fetchAddressesAPI = () => {
    return axiosClient.get('/api/addresses/');
};

export const addAddressAPI = (data) => {
    return axiosClient.post('/api/addresses/', data);
};

export const updateAddressAPI = (id, data) => {
    return axiosClient.put(`/api/addresses/${id}/`, data);
};

export const deleteAddressAPI = (id) => {
    return axiosClient.delete(`/api/addresses/${id}/`);
};