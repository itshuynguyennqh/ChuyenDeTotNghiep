import axiosClient from './axiosClient';

// Dashboard APIs
export const getDashboardMetrics = () => {
  return axiosClient.get('/admin/dashboard');
};

// Reports APIs
export const getRevenueReport = (startDate, endDate, page = 1, limit = 5) => {
  return axiosClient.get('/admin/reports', {
    params: {
      start_date: startDate,
      end_date: endDate,
      page,
      limit
    }
  });
};

// Product APIs
export const getAdminProducts = (params = {}) => {
  return axiosClient.get('/admin/products', { params });
};

export const getAdminProduct = (productId) => {
  return axiosClient.get(`/admin/products/${productId}`);
};

export const createAdminProduct = (data) => {
  return axiosClient.post('/admin/products', data);
};

export const updateAdminProduct = (productId, data) => {
  return axiosClient.patch(`/admin/products/${productId}`, data);
};

export const deleteAdminProduct = (productId) => {
  return axiosClient.delete(`/admin/products/${productId}`);
};

// Product Reviews APIs
export const getProductReviews = (productId, params = {}) => {
  return axiosClient.get(`/admin/reviews/${productId}`, { params });
};

// Order APIs
export const getAdminOrders = (params = {}) => {
  return axiosClient.get('/admin/orders', { params });
};

export const getAdminOrder = (orderId, type) => {
  return axiosClient.get(`/admin/orders/${orderId}`, {
    params: { type }
  });
};

export const updateOrderStatus = (orderId, type, status) => {
  return axiosClient.patch(`/admin/orders/${orderId}/status`, { status }, {
    params: { type }
  });
};

export const reviewOrderCancellationRequest = (orderId, type, decision, reason) => {
  return axiosClient.post(`/admin/orders/${orderId}/request-review`, {
    decision,
    reason
  }, {
    params: { type }
  });
};

export const prepareRentalOrder = (orderId, data) => {
  return axiosClient.post(`/admin/orders/${orderId}/rental-preparation`, data);
};

// Customer APIs
export const getAdminCustomers = (params = {}) => {
  return axiosClient.get('/admin/customers', { params });
};

export const getAdminCustomer = (customerId) => {
  return axiosClient.get(`/admin/customers/${customerId}`);
};

export const getCustomerOrders = (customerId, params = {}) => {
  return axiosClient.get(`/admin/customers/${customerId}/orders`, { params });
};

export const updateCustomerStatus = (customerId, status) => {
  return axiosClient.patch(`/admin/customers/${customerId}`, { status });
};

// Category APIs
export const getAdminCategories = (params = {}) => {
  return axiosClient.get('/admin/categories', { params });
};

export const getAdminCategory = (categoryId) => {
  return axiosClient.get(`/admin/categories/${categoryId}`);
};

export const createAdminCategory = (data) => {
  return axiosClient.post('/admin/categories', data);
};

export const updateAdminCategory = (categoryId, data) => {
  return axiosClient.patch(`/admin/categories/${categoryId}`, data);
};

export const deleteAdminCategory = (categoryId) => {
  return axiosClient.delete(`/admin/categories/${categoryId}`);
};

// Staff APIs
export const getAdminStaff = (params = {}) => {
  return axiosClient.get('/admin/staffs', { params });
};

export const getAdminStaffDetail = (staffId) => {
  return axiosClient.get(`/admin/staffs/${staffId}`);
};

export const createAdminStaff = (data) => {
  return axiosClient.post('/admin/staffs', data);
};

export const updateAdminStaff = (staffId, data) => {
  return axiosClient.patch(`/admin/staffs/${staffId}`, data);
};

export const deleteAdminStaff = (staffId) => {
  return axiosClient.delete(`/admin/staffs/${staffId}`);
};

// Promotion APIs
export const getAdminPromotions = (params = {}) => {
  return axiosClient.get('/admin/promotions', { params });
};

export const getAdminPromotion = (promotionId) => {
  return axiosClient.get(`/admin/promotions/${promotionId}`);
};

export const createAdminPromotion = (data) => {
  return axiosClient.post('/admin/promotions', data);
};

export const updateAdminPromotion = (promotionId, data) => {
  return axiosClient.patch(`/admin/promotions/${promotionId}`, data);
};

export const deleteAdminPromotion = (promotionId) => {
  return axiosClient.delete(`/admin/promotions/${promotionId}`);
};

// Rental Settings APIs
export const getRentalConfig = () => {
  return axiosClient.get('/admin/settings/rental');
};

export const updateRentalConfig = (data) => {
  return axiosClient.patch('/admin/settings/rental', data);
};

// FAQ APIs
export const getAdminFAQs = (params = {}) => {
  return axiosClient.get('/admin/faqs', { params });
};

export const getAdminFAQ = (faqId) => {
  return axiosClient.get(`/admin/faqs/${faqId}`);
};

export const createAdminFAQ = (data) => {
  return axiosClient.post('/admin/faqs', data);
};

export const updateAdminFAQ = (faqId, data) => {
  return axiosClient.patch(`/admin/faqs/${faqId}`, data);
};

export const deleteAdminFAQ = (faqId) => {
  return axiosClient.delete(`/admin/faqs/${faqId}`);
};

// Backward compatibility aliases (keeping old function names for existing code)
export const getSalesVsRentRevenue = getRevenueReport;
export const getInventoryStatus = () => {
  // This data is now included in dashboard response
  return getDashboardMetrics().then(response => {
    if (response.data?.success && response.data?.data?.inventory_status) {
      return { data: response.data.data.inventory_status };
    }
    return { data: { total_items: 0, breakdown: [] } };
  });
};

export const getTopSellingProducts = (startDate, endDate) => {
  return getRevenueReport(startDate, endDate).then(response => {
    if (response.data?.success && response.data?.data?.top_selling_products) {
      return { data: response.data.data.top_selling_products };
    }
    return { data: [] };
  });
};

export const getTopRentedProducts = (startDate, endDate) => {
  return getRevenueReport(startDate, endDate).then(response => {
    if (response.data?.success && response.data?.data?.top_rented_products) {
      return { data: response.data.data.top_rented_products };
    }
    return { data: [] };
  });
};
