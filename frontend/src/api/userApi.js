import axiosClient from './axiosClient';

// Profile APIs
export const getUserProfile = () => {
  return axiosClient.get('/users/profile');
};

export const updateUserProfile = (data) => {
  return axiosClient.patch('/users/profile', data);
};

// Password APIs
export const changePassword = (currentPassword, newPassword, confirmPassword) => {
  return axiosClient.post('/users/change-password', {
    current_password: currentPassword,
    new_password: newPassword,
    confirm_password: confirmPassword
  });
};

// Address APIs
export const fetchAddressesAPI = () => {
  return axiosClient.get('/users/addresses');
};

export const addAddressAPI = (data) => {
  return axiosClient.post('/users/addresses', data);
};

export const updateAddressAPI = (addressId, data) => {
  return axiosClient.patch(`/users/addresses/${addressId}`, data);
};

export const deleteAddressAPI = (addressId) => {
  return axiosClient.delete(`/users/addresses/${addressId}`);
};

// Wishlist APIs
export const getWishlists = (params = {}) => {
  return axiosClient.get('/users/wishlists', { params });
};

export const addToWishlist = (productId) => {
  return axiosClient.post('/users/wishlists', { product_id: productId });
};

export const removeFromWishlist = (productId) => {
  return axiosClient.delete(`/users/wishlists/${productId}`);
};

// Notification APIs
export const getNotifications = (params = {}) => {
  return axiosClient.get('/users/notifications', { params });
};

export const markNotificationAsRead = (notificationId) => {
  return axiosClient.patch(`/users/notifications/${notificationId}/read`);
};

// Settings APIs
export const getUserSettings = () => {
  return axiosClient.get('/users/settings');
};

export const updateUserSettings = (data) => {
  return axiosClient.patch('/users/settings', data);
};

// Logout API
export const logoutAPI = () => {
  return axiosClient.post('/users/logout');
};

// Backward compatibility aliases
export const updateAccountAPI = updateUserProfile;
