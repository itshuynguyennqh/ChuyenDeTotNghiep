/**
 * API Index - Centralized export for all API modules
 * 
 * This file exports all APIs according to API_DOCUMENTATION.md
 * All APIs are organized by their base paths:
 * - /auth - Authentication APIs
 * - /store - Store/Product/Cart APIs  
 * - /user - User Profile/Address APIs
 * - /admin - Admin Management APIs
 * - /chatbot - Chatbot APIs
 */

// ===================================================================
// Authentication APIs (/auth)
// ===================================================================
export {
    loginAPI,
    login,
    DangKyTaiKhoanView,
    register,
    verifyRegistrationAPI,
    verifyRegistration,
    forgotPasswordAPI,
    forgotPassword,
    resetPasswordAPI,
    resetPassword,
    getAccountDetails // Legacy
} from './authApi';

// ===================================================================
// Store APIs (/store)
// ===================================================================
export {
    // Product APIs
    getFeaturedProducts,
    searchProducts,
    getProductDetail,
    getProductReviews,
    getSimilarProducts,
    
    // Cart APIs
    getCart,
    addToCart,
    updateCartItem,
    removeCartItem,
    
    // Voucher APIs
    getVouchers,
    
    // Checkout APIs
    checkout
} from './storeApi';

// ===================================================================
// User APIs (/user)
// ===================================================================
export {
    // Profile APIs
    getUserProfile,
    updateUserProfile,
    updateAccountAPI, // Alias
    
    // Address APIs
    fetchAddressesAPI,
    addAddressAPI,
    updateAddressAPI,
    deleteAddressAPI
} from './userApi';

// ===================================================================
// Admin APIs (/admin)
// ===================================================================
export {
    // Dashboard APIs
    getDashboardMetrics,
    
    // Reports APIs
    getRevenueReport,
    getSalesVsRentRevenue, // Alias
    getTopSellingProducts, // Alias
    getTopRentedProducts, // Alias
    getInventoryStatus, // Alias
    
    // Product Management APIs
    getAdminProducts,
    getAdminProduct,
    createAdminProduct,
    updateAdminProduct,
    deleteAdminProduct,
    
    // Product Reviews APIs (Admin)
    getAdminProductReviews,
    getProductReviews as getAdminProductReviewsLegacy, // Legacy alias from adminApi
    
    // Order Management APIs
    getAdminOrders,
    getAdminOrder,
    updateOrderStatus,
    reviewOrderCancellationRequest,
    prepareRentalOrder,
    
    // Customer Management APIs
    getAdminCustomers,
    getAdminCustomer,
    getCustomerOrders,
    updateCustomerStatus,
    
    // Category Management APIs
    getAdminCategories,
    getAdminCategory,
    createAdminCategory,
    updateAdminCategory,
    deleteAdminCategory,
    
    // Staff Management APIs
    getAdminStaff,
    getAdminStaffDetail,
    createAdminStaff,
    updateAdminStaff,
    deleteAdminStaff,
    
    // Promotion/Voucher Management APIs
    getAdminPromotions,
    getAdminPromotion,
    createAdminPromotion,
    updateAdminPromotion,
    deleteAdminPromotion,
    
    // Rental Settings APIs
    getRentalConfig,
    updateRentalConfig,
    
    // FAQ Management APIs
    getAdminFAQs,
    getAdminFAQ,
    createAdminFAQ,
    updateAdminFAQ,
    deleteAdminFAQ
} from './adminApi';

// ===================================================================
// Chatbot APIs (/chatbot)
// ===================================================================
export {
    sendChatbotMessage,
    chatWithBot
} from './chatbotApi';

// ===================================================================
// Legacy APIs (Deprecated - for backward compatibility only)
// ===================================================================
export {
    fetchCartAPI,
    addToCartAPI,
    deleteCartItemAPI,
    updateCartItemAPI,
    checkoutAPI
} from './cartApi';

export {
    fetchProductsAPI,
    fetchProductDetailAPI,
    createProductAPI,
    updateProductAPI,
    deleteProductAPI,
    fetchCategoriesAPI
} from './productApi';

export {
    placeOrderAPI,
    fetchOrderHistoryAPI,
    updateOrderStatusAPI,
    cancelOrderAPI,
    returnRequestAPI,
    fetchInvoiceAPI,
    downloadInvoicePDFAPI
} from './orderApi';

export {
    fetchOrdersAPI,
    fetchOrderDetailAPI,
    updateOrderStatusAPI as updateOrderStatusStaffAPI,
    prepareForPickupAPI,
    reviewCancellationRequestAPI
} from './staffApi';

// ===================================================================
// Axios Client (for custom API calls)
// ===================================================================
export { default as axiosClient } from './axiosClient';
