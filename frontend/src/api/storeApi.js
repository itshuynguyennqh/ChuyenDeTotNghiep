import axiosClient from './axiosClient';

// ===================================================================
// STORE API - Product Endpoints
// ===================================================================

/**
 * Get featured products
 * @returns {Promise} List of featured products
 */
export const getFeaturedProducts = () => {
    return axiosClient.get('/store/products/featured');
};

/**
 * Search products with filters
 * @param {Object} params - Search parameters
 * @param {number} params.category_id - Category ID filter
 * @param {string} params.condition - Condition filter
 * @param {string} params.price_range - Price range (under 1000, 1000-2000, 2000-3000, above 3000)
 * @param {string[]} params.size - Size filters
 * @param {string[]} params.color - Color filters
 * @param {number} params.min_rating - Minimum rating (0-5)
 * @param {string} params.search - Search keyword
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.limit - Items per page (default: 12)
 * @returns {Promise} Paginated list of products
 */
export const searchProducts = (params = {}) => {
    // FastAPI expects array parameters as ?color=Blue&color=Red (multiple same param names)
    // Axios by default may serialize as ?color[]=Blue, so we need to configure paramsSerializer
    return axiosClient.get('/store/products/search', { 
        params,
        paramsSerializer: {
            indexes: null // Don't use brackets, use multiple same param names: ?color=Blue&color=Red
        }
    });
};

/**
 * Get product detail
 * @param {number} productId - Product ID
 * @returns {Promise} Product detail with variants, images, specs, rental info
 */
export const getProductDetail = (productId) => {
    return axiosClient.get(`/store/products/${productId}/detail`);
};

/**
 * Get product reviews
 * @param {number} productId - Product ID
 * @param {number} page - Page number (default: 1)
 * @param {number} limit - Items per page (default: 5)
 * @returns {Promise} Paginated reviews with average rating
 */
export const getProductReviews = (productId, page = 1, limit = 5) => {
    return axiosClient.get(`/store/products/${productId}/reviews`, {
        params: { page, limit }
    });
};

/**
 * Get similar products
 * @param {number} productId - Product ID
 * @returns {Promise} List of similar products
 */
export const getSimilarProducts = (productId) => {
    return axiosClient.get(`/store/products/${productId}/similar`);
};

// ===================================================================
// STORE API - Cart Endpoints
// ===================================================================

/**
 * Get cart summary
 * @param {Object} params - Optional parameters
 * @param {string} params.buy_voucher_code - Voucher code for buy items
 * @param {string} params.rent_voucher_code - Voucher code for rent items
 * @returns {Promise} Cart summary with items, totals for buy and rent, and discounted amounts
 */
export const getCart = (params = {}) => {
    return axiosClient.get('/store/cart', { params });
};

/**
 * Add item to cart
 * @param {Object} data - Cart item data
 * @param {number} data.product_id - Product ID
 * @param {number} data.quantity - Quantity
 * @param {string} data.transaction_type - 'buy' or 'rent'
 * @param {number} data.rental_days - Rental days (required if transaction_type is 'rent')
 * @returns {Promise} Success response
 */
export const addToCart = (data) => {
    return axiosClient.post('/store/cart/items', data);
};

/**
 * Update cart item
 * @param {number} cartItemId - Cart item ID
 * @param {Object} data - Update data
 * @param {number} data.quantity - New quantity
 * @param {number} data.rental_days - New rental days (only for rent items)
 * @returns {Promise} Success response
 */
export const updateCartItem = (cartItemId, data) => {
    return axiosClient.patch(`/store/cart/items/${cartItemId}`, data);
};

/**
 * Remove item from cart
 * @param {number} cartItemId - Cart item ID
 * @returns {Promise} Success response
 */
export const removeCartItem = (cartItemId) => {
    return axiosClient.delete(`/store/cart/items/${cartItemId}`);
};

// ===================================================================
// STORE API - Voucher Endpoints
// ===================================================================

/**
 * Get available vouchers
 * @param {string} scope - Filter by scope: 'buy', 'rent', or 'all' (optional)
 * @returns {Promise} List of available vouchers
 */
export const getVouchers = (scope = null) => {
    const params = scope ? { scope } : {};
    return axiosClient.get('/store/vouchers', { params });
};

// ===================================================================
// STORE API - Checkout Endpoints
// ===================================================================

/**
 * Checkout and create order
 * @param {Object} data - Checkout data
 * @param {number} data.address_id - Address ID
 * @param {string} data.payment_method - Payment method
 * @param {string} data.voucher_code - Voucher code (optional)
 * @param {string} data.note - Order note (optional)
 * @returns {Promise} Checkout response with order IDs
 */
export const checkout = (data) => {
    return axiosClient.post('/store/order/checkout', data);
};

