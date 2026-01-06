import axiosClient from './axiosClient';

// Mock data - replace with actual API calls when backend is ready
const MOCK_DELAY = 500; // Simulate network delay

// Dashboard APIs
export const getDashboardMetrics = async () => {
  // TODO: Replace with: return axiosClient.get('/api/admin/dashboard/metrics');
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  return {
    data: {
      totalRevenue: 428000,
      revenueChange: 15,
      activeRentals: 18,
      totalCustomers: 1250,
      overdueReturns: 3,
    }
  };
};

export const getSalesVsRentRevenue = async (period = 'week') => {
  // TODO: Replace with: return axiosClient.get(`/api/admin/dashboard/sales-vs-rent?period=${period}`);
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  return {
    data: [
      { day: 'Mon', sell: 12000, rent: 8000 },
      { day: 'Tue', sell: 15000, rent: 9000 },
      { day: 'Wed', sell: 18000, rent: 10000 },
      { day: 'Thu', sell: 14000, rent: 8500 },
      { day: 'Fri', sell: 20000, rent: 12000 },
      { day: 'Sat', sell: 25000, rent: 15000 },
      { day: 'Sun', sell: 22000, rent: 13000 },
    ]
  };
};

export const getInventoryStatus = async () => {
  // TODO: Replace with: return axiosClient.get('/api/admin/dashboard/inventory-status');
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  return {
    data: {
      available: 89,
      renting: 9,
      maintenance: 2,
    }
  };
};

export const getRevenueReport = async (startDate, endDate) => {
  // TODO: Replace with: return axiosClient.get(`/api/admin/reports/revenue?start=${startDate}&end=${endDate}`);
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  return {
    data: {
      reportPeriodRevenue: 45231.00,
      totalOrders: 342,
      avgDailyRevenue: 1459.06,
    }
  };
};

export const getTopSellingProducts = async (startDate, endDate) => {
  // TODO: Replace with: return axiosClient.get(`/api/admin/reports/top-selling?start=${startDate}&end=${endDate}`);
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  return {
    data: [
      {
        rank: 1,
        productName: 'Mountain Trek X500',
        category: 'Mountain Bikes',
        image: '/api/placeholder/150/150',
        quantitySold: 342,
        revenue: 45231.00,
      },
      // Add more mock data as needed
    ]
  };
};

export const getTopRentedProducts = async (startDate, endDate) => {
  // TODO: Replace with: return axiosClient.get(`/api/admin/reports/top-rented?start=${startDate}&end=${endDate}`);
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  return {
    data: [
      {
        rank: 1,
        productName: 'Mountain Trek X500',
        category: 'Mountain Bikes',
        image: '/api/placeholder/150/150',
        timesRented: 342,
        revenue: 45231.00,
      },
      // Add more mock data as needed
    ]
  };
};

// Product APIs
export const getAdminProducts = async (params = {}) => {
  // TODO: Replace with: return axiosClient.get('/api/admin/products', { params });
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  return {
    data: [
      {
        id: 1,
        name: 'Touring-1000 Blue, 46',
        category: 'Touring Bike',
        image: '/api/placeholder/150/150',
        sellPrice: 2384.07,
        rentPrice: 20,
        rate: 4.8,
        totalStock: 142,
        availableStock: 105,
        status: 'in_stock',
      },
      // Add more mock data
    ]
  };
};

export const getAdminProduct = async (id) => {
  // TODO: Replace with: return axiosClient.get(`/api/admin/products/${id}`);
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  return {
    data: {
      id,
      name: 'Touring-1000 Blue, 46',
      category: 'Touring Bike',
      // Full product data
    }
  };
};

export const createAdminProduct = async (data) => {
  // TODO: Replace with: return axiosClient.post('/api/admin/products', data);
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  return { data: { id: Date.now(), ...data } };
};

export const updateAdminProduct = async (id, data) => {
  // TODO: Replace with: return axiosClient.put(`/api/admin/products/${id}`, data);
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  return { data: { id, ...data } };
};

export const deleteAdminProduct = async (id) => {
  // TODO: Replace with: return axiosClient.delete(`/api/admin/products/${id}`);
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  return { data: { success: true } };
};

// Order APIs
export const getAdminOrders = async (type = 'purchase', params = {}) => {
  // TODO: Replace with: return axiosClient.get(`/api/admin/orders?type=${type}`, { params });
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  return {
    data: [
      {
        id: 'ORD-2023-1001',
        type: type,
        total: 145.00,
        status: type === 'rental' ? 'preparing' : 'shipping',
        rentalPeriod: type === 'rental' ? { start: '2023-10-10', end: '2023-10-15' } : null,
        createdAt: '2023-10-24T10:45:00Z',
      },
      // Add more mock data
    ]
  };
};

export const getAdminOrder = async (id) => {
  // TODO: Replace with: return axiosClient.get(`/api/admin/orders/${id}`);
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  return {
    data: {
      id,
      type: 'purchase',
      status: 'pending',
      // Full order data
    }
  };
};

export const updateOrderStatus = async (id, status) => {
  // TODO: Replace with: return axiosClient.patch(`/api/admin/orders/${id}/status`, { status });
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  return { data: { id, status } };
};

// Customer APIs
export const getAdminCustomers = async (params = {}) => {
  // TODO: Replace with: return axiosClient.get('/api/admin/customers', { params });
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  return {
    data: [
      {
        id: 1,
        name: 'Jane Cooper',
        phone: '+1 (555) 123-4567',
        status: 'active',
      },
      // Add more mock data
    ]
  };
};

export const getAdminCustomer = async (id) => {
  // TODO: Replace with: return axiosClient.get(`/api/admin/customers/${id}`);
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  return {
    data: {
      id,
      name: 'Jane Cooper',
      phone: '+1 (555) 123-4567',
      status: 'active',
      memberTier: 'Gold',
      totalSpending: 4250.00,
      totalOrders: 12,
      orders: [],
    }
  };
};

export const updateCustomerStatus = async (id, status) => {
  // TODO: Replace with: return axiosClient.patch(`/api/admin/customers/${id}/status`, { status });
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  return { data: { id, status } };
};

// Category APIs
export const getAdminCategories = async () => {
  // TODO: Replace with: return axiosClient.get('/api/admin/categories');
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  return {
    data: [
      { id: 1, name: 'Mountain Bikes' },
      { id: 2, name: 'Road Bikes' },
      { id: 3, name: 'Touring Bikes' },
      { id: 4, name: 'Gloves' },
      { id: 5, name: 'Bib-shorts' },
      { id: 6, name: 'Socks' },
    ]
  };
};

export const createAdminCategory = async (data) => {
  // TODO: Replace with: return axiosClient.post('/api/admin/categories', data);
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  return { data: { id: Date.now(), ...data } };
};

export const updateAdminCategory = async (id, data) => {
  // TODO: Replace with: return axiosClient.put(`/api/admin/categories/${id}`, data);
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  return { data: { id, ...data } };
};

export const deleteAdminCategory = async (id) => {
  // TODO: Replace with: return axiosClient.delete(`/api/admin/categories/${id}`);
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  return { data: { success: true } };
};

// Staff APIs
export const getAdminStaff = async (params = {}) => {
  // TODO: Replace with: return axiosClient.get('/api/admin/staff', { params });
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  return {
    data: [
      {
        id: 1,
        fullName: 'Nguyen Van A',
        phone: '+84 909 123 456',
        email: 'anv@cycle-shop.com',
        role: 'Order Staff',
        status: 'active',
      },
      // Add more mock data
    ]
  };
};

export const createAdminStaff = async (data) => {
  // TODO: Replace with: return axiosClient.post('/api/admin/staff', data);
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  return { data: { id: Date.now(), ...data } };
};

export const updateAdminStaff = async (id, data) => {
  // TODO: Replace with: return axiosClient.put(`/api/admin/staff/${id}`, data);
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  return { data: { id, ...data } };
};

export const deleteAdminStaff = async (id) => {
  // TODO: Replace with: return axiosClient.delete(`/api/admin/staff/${id}`);
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  return { data: { success: true } };
};

// Promotion APIs
export const getAdminPromotions = async (params = {}) => {
  // TODO: Replace with: return axiosClient.get('/api/admin/promotions', { params });
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  return {
    data: [
      {
        id: 1,
        name: 'Summer Sale 2025',
        code: 'SUMMER25',
        value: 20,
        valueType: 'percentage',
        quantityLimit: 100,
        duration: { from: '2025-06-01', to: '2025-08-31' },
        condition: 'Diamond',
        status: 'active',
        scope: 'All',
      },
      // Add more mock data
    ]
  };
};

export const getAdminPromotion = async (id) => {
  // TODO: Replace with: return axiosClient.get(`/api/admin/promotions/${id}`);
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  return {
    data: {
      id,
      name: 'Summer Sale 2025',
      // Full promotion data
    }
  };
};

export const createAdminPromotion = async (data) => {
  // TODO: Replace with: return axiosClient.post('/api/admin/promotions', data);
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  return { data: { id: Date.now(), ...data } };
};

export const updateAdminPromotion = async (id, data) => {
  // TODO: Replace with: return axiosClient.put(`/api/admin/promotions/${id}`, data);
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  return { data: { id, ...data } };
};

export const deleteAdminPromotion = async (id) => {
  // TODO: Replace with: return axiosClient.delete(`/api/admin/promotions/${id}`);
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  return { data: { success: true } };
};

// Rental Config APIs
export const getRentalConfig = async () => {
  // TODO: Replace with: return axiosClient.get('/api/admin/rental-config');
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  return {
    data: {
      minRentalDays: 1,
      maxRentalDays: 30,
      defaultDepositRate: 80,
      overdueFeeRate: 150,
      cancellationPolicy: 'Flexible',
      rentDeduction: 100,
    }
  };
};

export const updateRentalConfig = async (data) => {
  // TODO: Replace with: return axiosClient.put('/api/admin/rental-config', data);
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  return { data };
};

// Chatbot FAQ APIs
export const getAdminFAQs = async (params = {}) => {
  // TODO: Replace with: return axiosClient.get('/api/admin/faqs', { params });
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  return {
    data: [
      {
        id: 1,
        question: 'How is the rental deposit calculated?',
        answer: 'The deposit is calculated based on the bike\'s value and the rental...',
        keywords: 'deposit, calculation, fee',
        status: 'active',
      },
      // Add more mock data
    ]
  };
};

export const createAdminFAQ = async (data) => {
  // TODO: Replace with: return axiosClient.post('/api/admin/faqs', data);
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  return { data: { id: Date.now(), ...data } };
};

export const updateAdminFAQ = async (id, data) => {
  // TODO: Replace with: return axiosClient.put(`/api/admin/faqs/${id}`, data);
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  return { data: { id, ...data } };
};

export const deleteAdminFAQ = async (id) => {
  // TODO: Replace with: return axiosClient.delete(`/api/admin/faqs/${id}`);
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  return { data: { success: true } };
};
