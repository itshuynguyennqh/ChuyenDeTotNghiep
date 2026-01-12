import axiosClient from './axiosClient';

// Dashboard APIs
export const getDashboardMetrics = async () => {
  const response = await axiosClient.get('/admin/dashboard');
  // Transform response to match frontend expectations
  const data = response.data.data;
  return {
    data: {
      totalRevenue: data.summary.total_revenue.value,
      revenueChange: data.summary.total_revenue.growth_percentage,
      activeRentals: data.summary.active_rental.value,
      totalCustomers: data.summary.total_customers.value,
      overdueReturns: data.summary.overdue_return.value,
      revenueChart: data.revenue_chart,
      inventoryStatus: data.inventory_status
    }
  };
};

export const getSalesVsRentRevenue = async (period = 'week') => {
  // This endpoint needs to be implemented in the backend
  // For now, return mock data or use dashboard endpoint
  const response = await getDashboardMetrics();
  return {
    data: response.data.revenueChart?.series || []
  };
};

export const getInventoryStatus = async () => {
  const response = await axiosClient.get('/admin/dashboard');
  const breakdown = response.data.data.inventory_status.breakdown;
  return {
    data: {
      available: breakdown.find(b => b.status === 'available')?.value || 0,
      renting: breakdown.find(b => b.status === 'renting')?.value || 0,
      maintenance: breakdown.find(b => b.status === 'maintenance')?.value || 0,
    }
  };
};

export const getRevenueReport = async (startDate, endDate) => {
  const response = await axiosClient.get('/admin/reports', {
    params: { start_date: startDate, end_date: endDate }
  });
  const report = response.data.data.revenue_report;
  return {
    data: {
      reportPeriodRevenue: report.total_revenue,
      totalOrders: report.total_orders,
      avgDailyRevenue: report.avg_daily_revenue,
    }
  };
};

export const getTopSellingProducts = async (startDate, endDate) => {
  const response = await axiosClient.get('/admin/reports', {
    params: { start_date: startDate, end_date: endDate }
  });
  return {
    data: response.data.data.top_selling_products.map(p => ({
      rank: p.rank,
      productName: p.product_name,
      category: p.category_name,
      image: p.image_url,
      quantitySold: p.quantity_sold,
      revenue: p.revenue,
    }))
  };
};

export const getTopRentedProducts = async (startDate, endDate) => {
  const response = await axiosClient.get('/admin/reports', {
    params: { start_date: startDate, end_date: endDate }
  });
  return {
    data: response.data.data.top_rented_products.map(p => ({
      rank: p.rank,
      productName: p.product_name,
      category: p.category_name,
      image: p.image_url,
      timesRented: p.times_rented,
      revenue: p.revenue,
    }))
  };
};

// Product APIs
export const getAdminProducts = async (params = {}) => {
  const response = await axiosClient.get('/admin/products', { params });
  return {
    data: response.data.data.map(p => ({
      id: p.id,
      name: p.name,
      category: p.category_name,
      image: p.image_url,
      sellPrice: p.prices.list_price,
      rentPrice: p.prices.rent_price,
      totalStock: p.stock.total_stock,
      availableStock: p.stock.available_stock,
      status: p.status_label.toLowerCase().replace(' ', '_'),
    })),
    pagination: response.data.pagination
  };
};

export const getAdminProduct = async (id) => {
  const response = await axiosClient.get(`/admin/products/${id}`);
  const p = response.data.data;
  return {
    data: {
      id: p.id,
      name: p.name,
      category: p.category_name,
      image: p.images[0]?.url || '',
      sellPrice: p.prices.list_price,
      rentPrice: p.prices.rent_price,
      description: p.description,
      stock: p.stock,
      attributes: p.attributes,
      rentalConfig: p.rental_config,
      status: p.status_label,
    }
  };
};

export const createAdminProduct = async (data) => {
  const response = await axiosClient.post('/admin/products', data);
  return response;
};

export const updateAdminProduct = async (id, data) => {
  const response = await axiosClient.patch(`/admin/products/${id}`, data);
  return response;
};

export const deleteAdminProduct = async (id) => {
  const response = await axiosClient.delete(`/admin/products/${id}`);
  return response;
};

// Order APIs
export const getAdminOrders = async (type = 'all', params = {}) => {
  const response = await axiosClient.get('/admin/orders', {
    params: { type, ...params }
  });
  return {
    data: response.data.data,
    pagination: response.data.pagination
  };
};

export const getAdminOrder = async (id, type = 'sale') => {
  const response = await axiosClient.get(`/admin/orders/${id}`, {
    params: { type }
  });
  return {
    data: response.data.data
  };
};

export const updateOrderStatus = async (id, status, type = 'sale') => {
  const response = await axiosClient.patch(`/admin/orders/${id}/status`, 
    { status },
    { params: { type } }
  );
  return response;
};

// Customer APIs
export const getAdminCustomers = async (params = {}) => {
  const response = await axiosClient.get('/admin/customers', { params });
  return {
    data: response.data.data,
    pagination: response.data.pagination
  };
};

export const getAdminCustomer = async (id) => {
  const response = await axiosClient.get(`/admin/customers/${id}`);
  return {
    data: response.data.data
  };
};

export const updateCustomerStatus = async (id, status) => {
  const response = await axiosClient.patch(`/admin/customers/${id}`, { status });
  return response;
};

// Category APIs
export const getAdminCategories = async (params = {}) => {
  const response = await axiosClient.get('/admin/categories', { params });
  return {
    data: response.data.data,
    pagination: response.data.pagination
  };
};

export const createAdminCategory = async (data) => {
  const response = await axiosClient.post('/admin/categories', data);
  return response;
};

export const updateAdminCategory = async (id, data) => {
  const response = await axiosClient.patch(`/admin/categories/${id}`, data);
  return response;
};

export const deleteAdminCategory = async (id) => {
  const response = await axiosClient.delete(`/admin/categories/${id}`);
  return response;
};

// Staff APIs
export const getAdminStaff = async (params = {}) => {
  const response = await axiosClient.get('/admin/staffs', { params });
  return {
    data: response.data.data,
    pagination: response.data.pagination
  };
};

export const createAdminStaff = async (data) => {
  const response = await axiosClient.post('/admin/staffs', data);
  return response;
};

export const updateAdminStaff = async (id, data) => {
  const response = await axiosClient.patch(`/admin/staffs/${id}`, data);
  return response;
};

export const deleteAdminStaff = async (id) => {
  const response = await axiosClient.delete(`/admin/staffs/${id}`);
  return response;
};

// Promotion APIs
export const getAdminPromotions = async (params = {}) => {
  const response = await axiosClient.get('/admin/promotions', { params });
  return {
    data: response.data.data,
    pagination: response.data.pagination
  };
};

export const getAdminPromotion = async (id) => {
  const response = await axiosClient.get(`/admin/promotions/${id}`);
  return {
    data: response.data.data
  };
};

export const createAdminPromotion = async (data) => {
  const response = await axiosClient.post('/admin/promotions', data);
  return response;
};

export const updateAdminPromotion = async (id, data) => {
  const response = await axiosClient.patch(`/admin/promotions/${id}`, data);
  return response;
};

export const deleteAdminPromotion = async (id) => {
  const response = await axiosClient.delete(`/admin/promotions/${id}`);
  return response;
};

// Rental Config APIs
export const getRentalConfig = async () => {
  const response = await axiosClient.get('/admin/settings/rental');
  return {
    data: {
      minRentalDays: response.data.data.duration_limits.min_days,
      maxRentalDays: response.data.data.duration_limits.max_days,
      defaultDepositRate: response.data.data.deposit.default_rate,
      overdueFeeRate: response.data.data.penalty.overdue_fee_rate,
      cancellationPolicy: response.data.data.penalty.cancellation_policy,
      rentDeduction: response.data.data.rent_to_own.rent_deduction,
    }
  };
};

export const updateRentalConfig = async (data) => {
  const requestData = {
    duration_limits: {
      min_days: data.minRentalDays,
      max_days: data.maxRentalDays
    },
    deposit: {
      default_rate: data.defaultDepositRate
    },
    penalty: {
      overdue_fee_rate: data.overdueFeeRate,
      cancellation_policy: data.cancellationPolicy
    },
    rent_to_own: {
      rent_deduction: data.rentDeduction
    }
  };
  const response = await axiosClient.patch('/admin/settings/rental', requestData);
  return response;
};

// Chatbot FAQ APIs
export const getAdminFAQs = async (params = {}) => {
  const response = await axiosClient.get('/admin/faqs', { params });
  return {
    data: response.data.data,
    pagination: response.data.pagination
  };
};

export const createAdminFAQ = async (data) => {
  const response = await axiosClient.post('/admin/faqs', data);
  return response;
};

export const updateAdminFAQ = async (id, data) => {
  const response = await axiosClient.patch(`/admin/faqs/${id}`, data);
  return response;
};

export const deleteAdminFAQ = async (id) => {
  const response = await axiosClient.delete(`/admin/faqs/${id}`);
  return response;
};
