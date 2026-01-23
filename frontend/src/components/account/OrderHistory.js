import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Tabs, Tab, TextField, Select, MenuItem,
    InputAdornment, Chip, IconButton, Divider, Button, CircularProgress, Alert
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { getUserOrders } from '../../api/userApi';
import { getAdminOrder } from '../../api/adminApi';

const OrderHistory = ({ onOrderSelect }) => {
    const [activeTab, setActiveTab] = useState(1); // Default to Rental tab
    const [statusFilter, setStatusFilter] = useState('All');
    const [allOrders, setAllOrders] = useState([]); // All orders from API
    const [orders, setOrders] = useState([]); // Filtered orders to display
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [orderDetails, setOrderDetails] = useState({}); // Cache order details

    // Danh sách trạng thái dựa trên Frame 1617.png
    const orderStatuses = [
        "All", "pending", "confirmed", "preparing", "shipped",
        "delivered", "cancel request", "cancelled",
        "return requested", "returning"
    ];

    useEffect(() => {
        loadOrders();
    }, [activeTab, statusFilter]);

    useEffect(() => {
        // Filter orders when search query changes
        filterOrders();
    }, [searchQuery, allOrders, statusFilter]);

    const filterOrders = (ordersList = allOrders) => {
        let filtered = [...ordersList];
        
        // Filter by status if not 'All'
        if (statusFilter !== 'All') {
            filtered = filtered.filter(order => 
                order.status.toLowerCase() === statusFilter.toLowerCase() ||
                order.status_label?.toLowerCase() === statusFilter.toLowerCase()
            );
        }
        
        // Filter by search query
        if (searchQuery) {
            filtered = filtered.filter(order => 
                order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                order.customer_name?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        
        setOrders(filtered);
    };

    const loadOrders = async () => {
        try {
            setLoading(true);
            setError('');
            const type = activeTab === 0 ? 'sale' : activeTab === 1 ? 'rental' : 'all';
            const response = await getUserOrders({ type, page: 1, limit: 50 });
            const ordersList = response.data.data || [];
            
            setAllOrders(ordersList);
            filterOrders(ordersList); // Filter immediately after loading
            
            // Pre-fetch details for first few orders to display product info
            const ordersToFetch = ordersList.slice(0, 5);
            for (const order of ordersToFetch) {
                if (!orderDetails[order.id]) {
                    fetchOrderDetail(order);
                }
            }
        } catch (err) {
            setError(err.response?.data?.detail || err.message || 'Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const fetchOrderDetail = async (order) => {
        if (orderDetails[order.id]) return; // Already fetched
        
        try {
            const response = await getAdminOrder(order.db_id, order.type);
            setOrderDetails(prev => ({
                ...prev,
                [order.id]: response.data.data
            }));
        } catch (err) {
            console.error(`Failed to fetch detail for order ${order.id}:`, err);
        }
    };

    // Style cho nhãn trạng thái (Chips) dựa trên hình ảnh
    const getStatusStyle = (status) => {
        const statusColors = {
            'preparing': { bg: '#FEF9C3', color: '#854D0E' },
            'renting': { bg: '#DBEAFE', color: '#1E40AF' },
            'active': { bg: '#DBEAFE', color: '#1E40AF' },
            'inspecting': { bg: '#F3E8DB', color: '#78350F' },
            'pending': { bg: '#FEF9C3', color: '#854D0E' },
            'confirmed': { bg: '#DBEAFE', color: '#1E40AF' },
            'shipped': { bg: '#D1FAE5', color: '#065F46' },
            'delivered': { bg: '#D1FAE5', color: '#065F46' },
            'completed': { bg: '#D1FAE5', color: '#065F46' },
            'cancelled': { bg: '#FEE2E2', color: '#991B1B' },
            'overdue': { bg: '#FEE2E2', color: '#991B1B' }
        };
        const style = statusColors[status.toLowerCase()] || { bg: '#F5EFE6', color: '#4D4D4D' };
        return {
            backgroundColor: style.bg,
            color: style.color,
            fontWeight: 'bold',
            borderRadius: '12px',
            textTransform: 'lowercase',
            height: '24px',
            fontSize: '0.75rem',
            px: 1.5
        };
    };

    const handleOrderClick = async (order) => {
        // Fetch detail if not already cached
        if (!orderDetails[order.id]) {
            await fetchOrderDetail(order);
        }
        
        if (onOrderSelect) {
            const detail = orderDetails[order.id] || order;
            onOrderSelect({
                ...order,
                detail: detail
            });
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const formatRentalDateRange = (order) => {
        const detail = orderDetails[order.id];
        if (detail && detail.rental_start && detail.rental_end) {
            const start = formatDate(detail.rental_start);
            const end = formatDate(detail.rental_end);
            return `${start} - ${end}`;
        }
        return formatDate(order.created_at);
    };

    const getFirstProduct = (order) => {
        const detail = orderDetails[order.id];
        if (detail && detail.items && detail.items.length > 0) {
            return detail.items[0];
        }
        return null;
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(amount);
    };

    return (
        <Box>
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>My Order</Typography>

            <Paper variant="outlined" sx={{ borderRadius: '20px', overflow: 'hidden', border: '1px solid #E0E0E0' }}>
                {/* Tabs: Purchases / Rental */}
                <Box sx={{ px: 2, pt: 1 }}>
                    <Tabs
                        value={activeTab}
                        onChange={(e, v) => {
                            setActiveTab(v);
                            // loadOrders will be triggered by useEffect
                        }}
                        TabIndicatorProps={{ sx: { bgcolor: '#FF8C00', height: 3 } }}
                    >
                        <Tab label="Purchases" sx={{ textTransform: 'none', fontWeight: 'bold', fontSize: '1rem', color: activeTab === 0 ? '#FF8C00' : '#888' }} />
                        <Tab label="Rental" sx={{ textTransform: 'none', fontWeight: 'bold', fontSize: '1rem', color: activeTab === 1 ? '#FF8C00' : '#888' }} />
                    </Tabs>
                </Box>
                <Divider />

                {/* Filter Bar: Search + Status Dropdown */}
                <Box sx={{ p: 2, display: 'flex', gap: 2, bgcolor: '#F9F9F9' }}>
                    <TextField
                        fullWidth
                        size="small"
                        placeholder="Search your order here"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        InputProps={{
                            startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
                            sx: { borderRadius: '10px', bgcolor: '#fff' }
                        }}
                    />

                    {/* Dropdown Status thả xuống */}
                    <Select
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            // loadOrders will be triggered by useEffect
                        }}
                        size="small"
                        IconComponent={KeyboardArrowDownIcon}
                        sx={{
                            minWidth: 160,
                            borderRadius: '10px',
                            bgcolor: '#fff',
                            '& .MuiSelect-select': { fontWeight: '500' }
                        }}
                    >
                        {orderStatuses.map((status) => (
                            <MenuItem key={status} value={status}>
                                {status === 'All' ? 'Status: All' : status.charAt(0).toUpperCase() + status.slice(1)}
                            </MenuItem>
                        ))}
                    </Select>
                </Box>

                {/* Order List */}
                <Box sx={{ p: 2 }}>
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : error ? (
                        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
                    ) : orders.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                            <Typography variant="body1" color="text.secondary">
                                No orders found
                            </Typography>
                        </Box>
                    ) : (
                        orders.map((order, index) => {
                            const product = getFirstProduct(order);
                            const isRental = order.type === 'rental';
                            
                            return (
                                <Box 
                                    key={order.id}
                                    onClick={() => handleOrderClick(order)} 
                                    sx={{ 
                                        cursor: 'pointer', 
                                        display: 'flex', 
                                        gap: 2, 
                                        p: 2, 
                                        borderBottom: index < orders.length - 1 ? '1px solid #EEE' : 'none',
                                        '&:hover': { bgcolor: '#fafafa' } 
                                    }}
                                >
                                    <Box 
                                        component="img" 
                                        src={product?.product_image || "https://via.placeholder.com/100"} 
                                        sx={{ 
                                            width: 100, 
                                            height: 100, 
                                            borderRadius: '10px', 
                                            border: '1px solid #EEE', 
                                            objectFit: 'contain', 
                                            bgcolor: '#fff' 
                                        }} 
                                    />
                                    <Box sx={{ flexGrow: 1 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                            <Typography fontWeight="bold" variant="subtitle1">
                                                {product?.product_name || order.id}
                                            </Typography>
                                            <Chip label={order.status_label || order.status} sx={getStatusStyle(order.status)} />
                                        </Box>
                                        {product && (
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                                Order ID: {order.id}
                                            </Typography>
                                        )}
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                            {isRental ? formatRentalDateRange(order) : formatDate(order.created_at)}
                                        </Typography>
                                        <Button 
                                            variant="outlined" 
                                            size="small"
                                            sx={{ 
                                                bgcolor: '#EEEEEE', 
                                                color: '#666',
                                                border: 'none',
                                                textTransform: 'none',
                                                borderRadius: '4px',
                                                px: 2,
                                                '&:hover': { bgcolor: '#E0E0E0', border: 'none' }
                                            }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                // Handle rate product
                                            }}
                                        >
                                            Rate this product
                                        </Button>
                                    </Box>
                                    <Box sx={{ textAlign: 'right', minWidth: 200 }}>
                                        {isRental ? (
                                            <>
                                                <Typography variant="body2" fontWeight="bold" color="#D32F2F" sx={{ mb: 0.5 }}>
                                                    TOTAL RENTAL FEE
                                                </Typography>
                                                <Typography variant="h6" fontWeight="bold" color="#D32F2F" sx={{ mb: 2 }}>
                                                    {formatCurrency(order.total_amount)}
                                                </Typography>
                                                <Typography variant="body2" fontWeight="bold" color="#D32F2F" sx={{ mb: 0.5 }}>
                                                    SECURITY DEPOSIT
                                                </Typography>
                                                <Typography variant="h6" fontWeight="bold" color="#D32F2F">
                                                    {product ? formatCurrency(product.unit_price * 10) : 'N/A'}
                                                </Typography>
                                            </>
                                        ) : (
                                            <>
                                                <Typography variant="body2" fontWeight="bold" color="#D32F2F" sx={{ mb: 0.5 }}>
                                                    TOTAL AMOUNT
                                                </Typography>
                                                <Typography variant="h6" fontWeight="bold" color="#D32F2F">
                                                    {formatCurrency(order.total_amount)}
                                                </Typography>
                                            </>
                                        )}
                                    </Box>
                                </Box>
                            );
                        })
                    )}
                </Box>

                {/* Nút xem thêm dưới cùng */}
                <Box sx={{ textAlign: 'center', py: 1, borderTop: '1px solid #EEE' }}>
                    <IconButton size="small"><KeyboardArrowDownIcon /></IconButton>
                </Box>
            </Paper>
        </Box>
    );
};

export default OrderHistory;