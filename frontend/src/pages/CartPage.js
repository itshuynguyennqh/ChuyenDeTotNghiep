import React, { useEffect, useState } from 'react';
import {
    Container, Grid, Typography, Box, Paper, Button, IconButton,
    Checkbox, Divider, TextField, InputAdornment, MenuItem, Select, FormControl,
    CircularProgress, Alert
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag'; // Icon cho Buy
import HomeRepairServiceIcon from '@mui/icons-material/HomeRepairService'; // Icon cho Rent
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { useNavigate } from 'react-router-dom';
import { getCart, updateCartItem, removeCartItem, checkout, getVouchers } from '../api/storeApi';
import { fetchAddressesAPI } from '../api/userApi';

const CartPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [buyItems, setBuyItems] = useState([]);
    const [rentItems, setRentItems] = useState([]);
    
    // Helper function to get product image URL
    const getProductImage = (productId, thumbnail) => {
        if (productId) {
            // Use dynamic URL with ProductID (same as ProductCard)
            return `https://demo.componentone.com/ASPNET/AdventureWorks/ProductImage.ashx?ProductID=${productId}&size=large`;
        }
        // Fallback to thumbnail from API
        return thumbnail || 'https://via.placeholder.com/300x200?text=No+Image';
    };
    const [cartSummary, setCartSummary] = useState({
        total_buy_amount: 0,
        total_rent_amount: 0,
        discounted_buy_amount: 0,
        discounted_rent_amount: 0,
        grand_total: 0,
        total_items: 0
    });
    const [updatingItems, setUpdatingItems] = useState(new Set());
    const [rentalDates, setRentalDates] = useState({}); // {cart_item_id: {start: 'YYYY-MM-DD', end: 'YYYY-MM-DD'}}
    const [selectedBuyItems, setSelectedBuyItems] = useState(new Set()); // Set of cart_item_id for buy items
    const [selectedRentItems, setSelectedRentItems] = useState(new Set()); // Set of cart_item_id for rent items
    const [buyVouchers, setBuyVouchers] = useState([]);
    const [rentVouchers, setRentVouchers] = useState([]);
    const [selectedBuyVoucher, setSelectedBuyVoucher] = useState(null);
    const [selectedRentVoucher, setSelectedRentVoucher] = useState(null);
    const [voucherLoading, setVoucherLoading] = useState(false);

    // Fetch cart data
    useEffect(() => {
        fetchCartData();
        
        // Listen for cart updates from other pages
        const handleCartUpdate = () => {
            fetchCartData();
        };
        
        window.addEventListener('cartUpdated', handleCartUpdate);
        
        return () => {
            window.removeEventListener('cartUpdated', handleCartUpdate);
        };
    }, []);

    // Fetch vouchers when buy or rent items change
    useEffect(() => {
        const fetchVouchers = async () => {
            if (buyItems.length > 0 || rentItems.length > 0) {
                setVoucherLoading(true);
                try {
                    const [buyResponse, rentResponse] = await Promise.all([
                        buyItems.length > 0 ? getVouchers('buy') : Promise.resolve({ data: { data: [] } }),
                        rentItems.length > 0 ? getVouchers('rent') : Promise.resolve({ data: { data: [] } })
                    ]);
                    
                    const buyVouchersData = buyResponse.data?.data || buyResponse.data || [];
                    const rentVouchersData = rentResponse.data?.data || rentResponse.data || [];
                    
                    setBuyVouchers(Array.isArray(buyVouchersData) ? buyVouchersData : []);
                    setRentVouchers(Array.isArray(rentVouchersData) ? rentVouchersData : []);
                } catch (error) {
                    console.error('Error fetching vouchers:', error);
                    setBuyVouchers([]);
                    setRentVouchers([]);
                } finally {
                    setVoucherLoading(false);
                }
            } else {
                setBuyVouchers([]);
                setRentVouchers([]);
            }
        };
        
        fetchVouchers();
    }, [buyItems.length, rentItems.length]);

    // Sync selected items when items change (remove items that no longer exist)
    useEffect(() => {
        const buyItemIds = new Set(buyItems.map(item => item.cart_item_id));
        setSelectedBuyItems(prev => {
            const next = new Set();
            prev.forEach(id => {
                if (buyItemIds.has(id)) {
                    next.add(id);
                }
            });
            return next;
        });
    }, [buyItems]);

    useEffect(() => {
        const rentItemIds = new Set(rentItems.map(item => item.cart_item_id));
        setSelectedRentItems(prev => {
            const next = new Set();
            prev.forEach(id => {
                if (rentItemIds.has(id)) {
                    next.add(id);
                }
            });
            return next;
        });
    }, [rentItems]);

    const fetchCartData = async () => {
        setLoading(true);
        setError('');
        try {
            // Pass voucher codes to API to calculate discounted amounts
            const params = {};
            if (selectedBuyVoucher?.code) {
                params.buy_voucher_code = selectedBuyVoucher.code;
            }
            if (selectedRentVoucher?.code) {
                params.rent_voucher_code = selectedRentVoucher.code;
            }
            
            const response = await getCart(params);
            console.log('Cart API Response:', response);
            
            // Axios response structure: response.data is the response body
            // Backend returns: {status: "success", code: 200, data: {...}}
            // So we need: response.data.data to get the actual cart data
            const responseBody = response.data || response;
            const data = responseBody.data || responseBody;
            
            console.log('Parsed cart data:', data);
            
            // Check if data exists and has items array
            if (!data) {
                throw new Error('No cart data received');
            }
            
            // Separate buy and rent items - handle case where items might be undefined
            const items = data.items || [];
            console.log('Cart items:', items);
            
            const buy = items.filter(item => item.transaction_type === 'buy');
            const rent = items.filter(item => item.transaction_type === 'rent');
            
            console.log('Buy items:', buy);
            console.log('Rent items:', rent);
            
            setBuyItems(buy);
            setRentItems(rent);
            
            // Initialize rental dates for rent items
            const datesMap = {};
            rent.forEach(item => {
                if (item.rental_days) {
                    const startDate = new Date();
                    const endDate = new Date();
                    endDate.setDate(endDate.getDate() + item.rental_days);
                    datesMap[item.cart_item_id] = {
                        start: startDate.toISOString().split('T')[0],
                        end: endDate.toISOString().split('T')[0],
                        startDate: startDate,
                        endDate: endDate
                    };
                }
            });
            setRentalDates(datesMap);
            
            setCartSummary({
                total_buy_amount: parseFloat(data.total_buy_amount || 0),
                total_rent_amount: parseFloat(data.total_rent_amount || 0),
                discounted_buy_amount: parseFloat(data.discounted_buy_amount || data.total_buy_amount || 0),
                discounted_rent_amount: parseFloat(data.discounted_rent_amount || data.total_rent_amount || 0),
                grand_total: parseFloat(data.grand_total || 0),
                total_items: data.total_items || items.length || 0
            });
        } catch (err) {
            console.error('Error fetching cart:', err);
            console.error('Error details:', err?.response?.data);
            if (err?.response?.status === 401 || err?.status === 401) {
                setError('Please log in to view your cart.');
                setTimeout(() => navigate('/login'), 2000);
            } else {
                setError(err?.response?.data?.detail || err?.message || 'Failed to load cart. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    // Update quantity
    const handleQuantityChange = async (itemId, newQuantity, transactionType) => {
        if (newQuantity < 1) return;
        
        setUpdatingItems(prev => new Set(prev).add(itemId));
        try {
            await updateCartItem(itemId, { quantity: newQuantity });
            await fetchCartData(); // Refresh cart
        } catch (err) {
            console.error('Error updating quantity:', err);
            alert(err?.message || 'Failed to update quantity');
        } finally {
            setUpdatingItems(prev => {
                const next = new Set(prev);
                next.delete(itemId);
                return next;
            });
        }
    };

    // Remove item
    const handleRemoveItem = async (itemId) => {
        if (!window.confirm('Are you sure you want to remove this item?')) return;
        
        setUpdatingItems(prev => new Set(prev).add(itemId));
        try {
            await removeCartItem(itemId);
            await fetchCartData(); // Refresh cart
        } catch (err) {
            console.error('Error removing item:', err);
            alert(err?.message || 'Failed to remove item');
        } finally {
            setUpdatingItems(prev => {
                const next = new Set(prev);
                next.delete(itemId);
                return next;
            });
        }
    };

    // Format variant info for display
    const formatVariantInfo = (variant) => {
        const parts = [];
        if (variant.color) parts.push(variant.color);
        if (variant.size) parts.push(variant.size);
        return parts.join(', ') || 'N/A';
    };

    // Format currency with comma separators
    const formatCurrency = (amount) => {
        return parseFloat(amount).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    // Handle select all for buy items
    const handleSelectAllBuy = (checked) => {
        if (checked) {
            setSelectedBuyItems(new Set(buyItems.map(item => item.cart_item_id)));
        } else {
            setSelectedBuyItems(new Set());
        }
    };

    // Handle individual buy item selection
    const handleBuyItemSelect = (itemId, checked) => {
        setSelectedBuyItems(prev => {
            const next = new Set(prev);
            if (checked) {
                next.add(itemId);
            } else {
                next.delete(itemId);
            }
            return next;
        });
    };

    // Handle select all for rent items
    const handleSelectAllRent = (checked) => {
        if (checked) {
            setSelectedRentItems(new Set(rentItems.map(item => item.cart_item_id)));
        } else {
            setSelectedRentItems(new Set());
        }
    };

    // Handle individual rent item selection
    const handleRentItemSelect = (itemId, checked) => {
        setSelectedRentItems(prev => {
            const next = new Set(prev);
            if (checked) {
                next.add(itemId);
            } else {
                next.delete(itemId);
            }
            return next;
        });
    };

    // Check if all buy items are selected
    const areAllBuyItemsSelected = buyItems.length > 0 && buyItems.every(item => selectedBuyItems.has(item.cart_item_id));
    const areSomeBuyItemsSelected = buyItems.some(item => selectedBuyItems.has(item.cart_item_id));

    // Check if all rent items are selected
    const areAllRentItemsSelected = rentItems.length > 0 && rentItems.every(item => selectedRentItems.has(item.cart_item_id));
    const areSomeRentItemsSelected = rentItems.some(item => selectedRentItems.has(item.cart_item_id));

    // Handle checkout for buy items
    const handleBuyCheckout = async () => {
        // Check if any items are selected
        if (selectedBuyItems.size === 0) {
            alert('Please select items to order');
            return;
        }

        if (buyItems.length === 0) {
            alert('No items to order');
            return;
        }

        // Navigate to payment page with cart data and voucher info
        navigate('/payment', { 
            state: { 
                type: 'buy',
                fromCart: true,
                voucherCode: selectedBuyVoucher?.code || null
            } 
        });
    };

    // Handle checkout for rent items
    const handleRentCheckout = async () => {
        // Check if any items are selected
        if (selectedRentItems.size === 0) {
            alert('Please select items to rent');
            return;
        }

        if (rentItems.length === 0) {
            alert('No items to rent');
            return;
        }

        // Navigate to payment page with cart data and voucher info
        navigate('/payment', { 
            state: { 
                type: 'rent',
                fromCart: true,
                voucherCode: selectedRentVoucher?.code || null
            } 
        });
    };

    // Handle rental date change
    const handleRentalDateChange = async (itemId, dateType, newDate) => {
        if (!newDate) return;
        
        const currentDates = rentalDates[itemId] || {};
        let startDate = currentDates.startDate ? new Date(currentDates.startDate) : new Date();
        let endDate = currentDates.endDate ? new Date(currentDates.endDate) : new Date();
        
        // Normalize dates to start of day to avoid timezone issues
        const normalizeDate = (date) => {
            const normalized = new Date(date);
            normalized.setHours(0, 0, 0, 0);
            return normalized;
        };
        
        if (dateType === 'start') {
            startDate = normalizeDate(newDate);
            // Ensure end date is after start date
            if (endDate <= startDate) {
                endDate = new Date(startDate);
                endDate.setDate(endDate.getDate() + 1);
                endDate = normalizeDate(endDate);
            }
        } else if (dateType === 'end') {
            endDate = normalizeDate(newDate);
            // Ensure start date is before end date
            if (startDate >= endDate) {
                startDate = new Date(endDate);
                startDate.setDate(startDate.getDate() - 1);
                startDate = normalizeDate(startDate);
            }
        }
        
        // Calculate rental days: difference in days + 1 (to include both start and end days)
        // Use Math.floor instead of Math.ceil to avoid rounding issues
        const timeDiff = endDate.getTime() - startDate.getTime();
        const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        const days = daysDiff + 1; // +1 to include both start and end days
        
        if (days < 1) {
            alert('End date must be after start date');
            return;
        }
        
        // Convert to ISO string format for storage
        const startDateStr = startDate.toISOString().split('T')[0];
        const endDateStr = endDate.toISOString().split('T')[0];
        
        // Update local state immediately for better UX
        setRentalDates(prev => ({
            ...prev,
            [itemId]: { start: startDateStr, end: endDateStr, startDate: startDate, endDate: endDate }
        }));
        
        // Update cart item via API
        setUpdatingItems(prev => new Set(prev).add(itemId));
        try {
            await updateCartItem(itemId, { rental_days: days });
            // Refresh cart summary without recalculating dates
            // Pass voucher codes to get updated discounted amounts
            const params = {};
            if (selectedBuyVoucher?.code) {
                params.buy_voucher_code = selectedBuyVoucher.code;
            }
            if (selectedRentVoucher?.code) {
                params.rent_voucher_code = selectedRentVoucher.code;
            }
            const response = await getCart(params);
            const responseBody = response.data || response;
            const data = responseBody.data || responseBody;
            if (data) {
                const items = data.items || [];
                const rent = items.filter(item => item.transaction_type === 'rent');
                // Update rent items but preserve the dates we just set
                setRentItems(rent);
                // Update cart summary
                setCartSummary({
                    total_buy_amount: parseFloat(data.total_buy_amount || 0),
                    total_rent_amount: parseFloat(data.total_rent_amount || 0),
                    discounted_buy_amount: parseFloat(data.discounted_buy_amount || data.total_buy_amount || 0),
                    discounted_rent_amount: parseFloat(data.discounted_rent_amount || data.total_rent_amount || 0),
                    grand_total: parseFloat(data.grand_total || 0),
                    total_items: data.total_items || 0
                });
            }
        } catch (err) {
            console.error('Error updating rental dates:', err);
            alert(err?.message || 'Failed to update rental dates');
            // Revert on error by fetching full cart data
            await fetchCartData();
        } finally {
            setUpdatingItems(prev => {
                const next = new Set(prev);
                next.delete(itemId);
                return next;
            });
        }
    };

    if (loading) {
        return (
            <Box sx={{ bgcolor: '#f5efe6', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ bgcolor: '#f5efe6', minHeight: '100vh', py: 4 }}>
                <Container maxWidth="lg">
                    <Alert severity="error">{error}</Alert>
                </Container>
            </Box>
        );
    }

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box sx={{ bgcolor: '#f5efe6', minHeight: '100vh', py: 4 }}>
                <Container maxWidth="lg">
                <Grid container spacing={4}>

                    {/* CỘT TRÁI: DANH SÁCH SẢN PHẨM */}
                    <Grid item xs={12} md={8} flexGrow={1}>

                        {/* SECTION: ITEM TO BUY */}
                        <Box sx={{ mb: 4 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                                <Box sx={{ bgcolor: '#ff8120', p: 1, borderRadius: '8px', display: 'flex' }}>
                                    <ShoppingBagIcon sx={{ color: 'white' }} />
                                </Box>
                                <Typography variant="h6" fontWeight="bold">Item to Buy</Typography>
                                <Typography variant="body2" color="text.secondary">({buyItems.length} items)</Typography>
                            </Box>

                            <Paper sx={{ borderRadius: '20px', p: 0, overflow: 'hidden' }}>
                                <Box sx={{ p: 2, display: 'flex', alignItems: 'center', borderBottom: '1px solid #eee' }}>
                                    <Checkbox 
                                        size="small" 
                                        checked={areAllBuyItemsSelected}
                                        indeterminate={areSomeBuyItemsSelected && !areAllBuyItemsSelected}
                                        onChange={(e) => handleSelectAllBuy(e.target.checked)}
                                    />
                                    <Typography variant="body2" fontWeight="500">Select all</Typography>
                                </Box>
                                {buyItems.length === 0 ? (
                                    <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
                                        <Typography>No items to buy</Typography>
                                    </Box>
                                ) : (
                                    buyItems.map((item) => (
                                        <Box key={item.cart_item_id} sx={{ p: 3, display: 'flex', gap: 3, borderBottom: '1px solid #eee' }}>
                                            <Checkbox 
                                                size="small" 
                                                sx={{ alignSelf: 'center' }}
                                                checked={selectedBuyItems.has(item.cart_item_id)}
                                                onChange={(e) => handleBuyItemSelect(item.cart_item_id, e.target.checked)}
                                            />
                                            <Box 
                                                component="img" 
                                                src={getProductImage(item.product_id, item.thumbnail)}
                                                onError={(e) => {
                                                    // If dynamic URL fails, try thumbnail from API
                                                    const thumbnail = item.thumbnail;
                                                    if (thumbnail && e.target.src !== thumbnail) {
                                                        e.target.src = thumbnail;
                                                    } else {
                                                        // Final fallback to placeholder
                                                        e.target.onerror = null;
                                                        e.target.src = 'https://via.placeholder.com/100?text=No+Image';
                                                    }
                                                }}
                                                sx={{ width: 80, height: 80, objectFit: 'contain' }} 
                                            />
                                            <Box sx={{ flexGrow: 1 }}>
                                                <Typography fontWeight="bold">{item.product_name}</Typography>
                                                {item.variant && (
                                                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                        {formatVariantInfo(item.variant)}
                                                    </Typography>
                                                )}
                                                <Typography variant="h6" color="#d32f2f" fontWeight="bold" sx={{ mt: 0.5 }}>
                                                    ${formatCurrency(item.unit_price)}
                                                </Typography>

                                                {/* Quantity Controls */}
                                                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, border: '1px solid #ddd', borderRadius: '20px', width: 'fit-content' }}>
                                                    <IconButton 
                                                        size="small" 
                                                        onClick={() => handleRemoveItem(item.cart_item_id)}
                                                        disabled={updatingItems.has(item.cart_item_id)}
                                                    >
                                                        <DeleteOutlineIcon fontSize="small" />
                                                    </IconButton>
                                                    <IconButton 
                                                        size="small" 
                                                        onClick={() => handleQuantityChange(item.cart_item_id, item.quantity - 1, 'buy')}
                                                        disabled={updatingItems.has(item.cart_item_id) || item.quantity <= 1}
                                                    >
                                                        <RemoveIcon fontSize="small" />
                                                    </IconButton>
                                                    <Typography sx={{ mx: 1, fontWeight: 'bold', minWidth: '20px', textAlign: 'center' }}>
                                                        {updatingItems.has(item.cart_item_id) ? <CircularProgress size={16} /> : item.quantity}
                                                    </Typography>
                                                    <IconButton 
                                                        size="small" 
                                                        sx={{ color: '#ff8120' }}
                                                        onClick={() => handleQuantityChange(item.cart_item_id, item.quantity + 1, 'buy')}
                                                        disabled={updatingItems.has(item.cart_item_id)}
                                                    >
                                                        <AddIcon fontSize="small" />
                                                    </IconButton>
                                                </Box>
                                            </Box>
                                        </Box>
                                    ))
                                )}
                            </Paper>
                        </Box>

                        {/* SECTION: ITEM TO RENT */}
                        <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                                <Box sx={{ bgcolor: '#2d5e89', p: 1, borderRadius: '8px', display: 'flex' }}>
                                    <HomeRepairServiceIcon sx={{ color: 'white' }} />
                                </Box>
                                <Typography variant="h6" fontWeight="bold">Item to Rent</Typography>
                                <Typography variant="body2" color="text.secondary">({rentItems.length} item)</Typography>
                            </Box>

                            <Paper sx={{ borderRadius: '20px', p: 0, overflow: 'hidden' }}>
                                <Box sx={{ p: 2, display: 'flex', alignItems: 'center', borderBottom: '1px solid #eee' }}>
                                    <Checkbox 
                                        size="small" 
                                        checked={areAllRentItemsSelected}
                                        indeterminate={areSomeRentItemsSelected && !areAllRentItemsSelected}
                                        onChange={(e) => handleSelectAllRent(e.target.checked)}
                                    />
                                    <Typography variant="body2" fontWeight="500">Select all</Typography>
                                </Box>
                                {rentItems.length === 0 ? (
                                    <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
                                        <Typography>No items to rent</Typography>
                                    </Box>
                                ) : (
                                    rentItems.map((item) => {
                                        // unit_price is already the rental price per day (from Product.RentPrice)
                                        const dailyPrice = parseFloat(item.unit_price);
                                        // Deposit is typically the product list price, but we'll use unit_price as approximation
                                        // Note: For more accurate deposit, we might need to fetch Product.ListPrice separately
                                        const deposit = parseFloat(item.unit_price);
                                        
                                        return (
                                            <Box key={item.cart_item_id} sx={{ p: 3, display: 'flex', gap: 3, borderBottom: rentItems.indexOf(item) < rentItems.length - 1 ? '1px solid #eee' : 'none' }}>
                                                <Checkbox 
                                                    size="small" 
                                                    sx={{ alignSelf: 'center' }}
                                                    checked={selectedRentItems.has(item.cart_item_id)}
                                                    onChange={(e) => handleRentItemSelect(item.cart_item_id, e.target.checked)}
                                                />
                                                <Box 
                                                    component="img" 
                                                    src={getProductImage(item.product_id, item.thumbnail)}
                                                    onError={(e) => {
                                                        // If dynamic URL fails, try thumbnail from API
                                                        const thumbnail = item.thumbnail;
                                                        if (thumbnail && e.target.src !== thumbnail) {
                                                            e.target.src = thumbnail;
                                                        } else {
                                                            // Final fallback to placeholder
                                                            e.target.onerror = null;
                                                            e.target.src = 'https://via.placeholder.com/100?text=No+Image';
                                                        }
                                                    }}
                                                    sx={{ width: 100, height: 100, objectFit: 'contain' }} 
                                                />
                                                <Box sx={{ flexGrow: 1 }}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                        <Typography fontWeight="bold">{item.product_name}</Typography>
                                                        <Box sx={{ textAlign: 'right' }}>
                                                            <Typography variant="caption" fontWeight="bold" color="#ff8120">REFUNDABLE DEPOSIT</Typography>
                                                            <Typography fontWeight="bold" color="#d32f2f">${formatCurrency(deposit)}</Typography>
                                                        </Box>
                                                    </Box>

                                                    {item.variant && (
                                                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 0.5 }}>
                                                            <Typography variant="caption" sx={{ bgcolor: '#eee', px: 1, borderRadius: '4px' }}>
                                                                {formatVariantInfo(item.variant)}
                                                            </Typography>
                                                        </Box>
                                                    )}

                                                    <Typography variant="body1" color="#d32f2f" fontWeight="bold" sx={{ mt: 1 }}>
                                                        ${formatCurrency(dailyPrice)}/day
                                                    </Typography>

                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mt: 2 }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: '20px', width: 'fit-content' }}>
                                                            <IconButton 
                                                                size="small" 
                                                                onClick={() => handleRemoveItem(item.cart_item_id)}
                                                                disabled={updatingItems.has(item.cart_item_id)}
                                                            >
                                                                <DeleteOutlineIcon fontSize="small" />
                                                            </IconButton>
                                                            <IconButton 
                                                                size="small" 
                                                                onClick={() => handleQuantityChange(item.cart_item_id, item.quantity - 1, 'rent')}
                                                                disabled={updatingItems.has(item.cart_item_id) || item.quantity <= 1}
                                                            >
                                                                <RemoveIcon fontSize="small" />
                                                            </IconButton>
                                                            <Typography sx={{ mx: 1, fontWeight: 'bold', minWidth: '20px', textAlign: 'center' }}>
                                                                {updatingItems.has(item.cart_item_id) ? <CircularProgress size={16} /> : item.quantity}
                                                            </Typography>
                                                            <IconButton 
                                                                size="small" 
                                                                sx={{ color: '#2d5e89' }}
                                                                onClick={() => handleQuantityChange(item.cart_item_id, item.quantity + 1, 'rent')}
                                                                disabled={updatingItems.has(item.cart_item_id)}
                                                            >
                                                                <AddIcon fontSize="small" />
                                                            </IconButton>
                                                        </Box>

                                                        {item.rental_days && (
                                                            <Box sx={{ border: '1px solid #ddd', borderRadius: '8px', p: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                <DatePicker
                                                                    label="Start Date"
                                                                    value={rentalDates[item.cart_item_id]?.startDate || null}
                                                                    onChange={(newValue) => handleRentalDateChange(item.cart_item_id, 'start', newValue)}
                                                                    disabled={updatingItems.has(item.cart_item_id)}
                                                                    slotProps={{
                                                                        textField: {
                                                                            size: 'small',
                                                                            sx: { width: '140px' },
                                                                            inputProps: {
                                                                                style: { fontSize: '0.75rem', padding: '4px 8px' }
                                                                            }
                                                                        }
                                                                    }}
                                                                />
                                                                <Typography variant="caption">→</Typography>
                                                                <DatePicker
                                                                    label="End Date"
                                                                    value={rentalDates[item.cart_item_id]?.endDate || null}
                                                                    onChange={(newValue) => handleRentalDateChange(item.cart_item_id, 'end', newValue)}
                                                                    disabled={updatingItems.has(item.cart_item_id)}
                                                                    minDate={rentalDates[item.cart_item_id]?.startDate || undefined}
                                                                    slotProps={{
                                                                        textField: {
                                                                            size: 'small',
                                                                            sx: { width: '140px' },
                                                                            inputProps: {
                                                                                style: { fontSize: '0.75rem', padding: '4px 8px' }
                                                                            }
                                                                        }
                                                                    }}
                                                                />
                                                                <CalendarTodayIcon sx={{ fontSize: 16, color: '#666' }} />
                                                            </Box>
                                                        )}
                                                    </Box>
                                                </Box>
                                            </Box>
                                        );
                                    })
                                )}
                            </Paper>
                        </Box>
                    </Grid>

                    {/* CỘT PHẢI: SUMMARY */}
                    <Grid item xs={12} md={4} flexGrow={1}>
                        <Box sx={{ position: 'sticky', top: 20 }}>
                            {/* Purchase Summary */}
                            <Paper sx={{ p: 3, borderRadius: '20px', mb: 3, bgcolor: '#fff6ed' }}>
                                <Typography variant="h6" fontWeight="bold" color="#ff8120" gutterBottom>Purchase Summary</Typography>
                                <Box sx={{ mt: 2, mb: 1 }}>
                                    <Typography variant="body2" sx={{ mb: 1 }}>Voucher</Typography>
                                    <FormControl fullWidth size="small">
                                        <Select
                                            value={selectedBuyVoucher?.voucher_id || ''}
                                            onChange={async (e) => {
                                                const voucherId = e.target.value;
                                                const voucher = buyVouchers.find(v => v.voucher_id === voucherId);
                                                setSelectedBuyVoucher(voucher || null);
                                                // Refetch cart to get updated discounted amounts
                                                await fetchCartData();
                                            }}
                                            displayEmpty
                                            disabled={voucherLoading || buyVouchers.length === 0}
                                        >
                                            <MenuItem value="">
                                                <em>Select or enter code</em>
                                            </MenuItem>
                                            {buyVouchers.map((voucher) => (
                                                <MenuItem key={voucher.voucher_id} value={voucher.voucher_id}>
                                                    {voucher.code} - {voucher.name} 
                                                    {voucher.discount_type === 'percentage' 
                                                        ? ` (${voucher.discount_value}% off)`
                                                        : ` ($${formatCurrency(voucher.discount_value)} off)`}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                    {selectedBuyVoucher && (
                                        <Typography variant="caption" color="success.main" sx={{ mt: 0.5, display: 'block' }}>
                                            Applied: {selectedBuyVoucher.code}
                                        </Typography>
                                    )}
                                </Box>
                                {(() => {
                                    // Calculate total for selected buy items only
                                    const selectedBuyItemsList = buyItems.filter(item => selectedBuyItems.has(item.cart_item_id));
                                    const selectedBuyTotal = selectedBuyItemsList.reduce((sum, item) => sum + parseFloat(item.subtotal || 0), 0);
                                    const selectedBuyCount = selectedBuyItemsList.length;
                                    
                                    // Calculate discount amount from voucher
                                    let discountAmount = 0;
                                    if (selectedBuyVoucher && selectedBuyTotal > 0) {
                                        const minOrder = parseFloat(selectedBuyVoucher.min_order_amount || 0);
                                        console.log('Voucher discount calculation:', {
                                            voucher: selectedBuyVoucher,
                                            selectedBuyTotal,
                                            minOrder,
                                            discount_type: selectedBuyVoucher.discount_type,
                                            discount_value: selectedBuyVoucher.discount_value,
                                            meetsMinOrder: selectedBuyTotal >= minOrder
                                        });
                                        
                                        if (selectedBuyTotal >= minOrder) {
                                            // Calculate discount based on discount_type and discount_value
                                            // Handle both flat structure (discount_type/discount_value) and nested (discount_config)
                                            let discountType = selectedBuyVoucher.discount_type;
                                            let discountValue = selectedBuyVoucher.discount_value;
                                            
                                            // If voucher has discount_config instead (from admin API), extract it
                                            if (!discountType && selectedBuyVoucher.discount_config) {
                                                discountType = selectedBuyVoucher.discount_config.type;
                                                discountValue = selectedBuyVoucher.discount_config.value;
                                            }
                                            
                                            if (discountType === 'percentage') {
                                                // discount_value is percentage (e.g., 10 = 10%)
                                                discountAmount = selectedBuyTotal * (parseFloat(discountValue || 0) / 100);
                                            } else if (discountType === 'amount' || discountType === 'fixed') {
                                                // discount_value is fixed amount
                                                discountAmount = parseFloat(discountValue || 0);
                                            }
                                            
                                            // Ensure discount doesn't exceed total
                                            discountAmount = Math.min(discountAmount, selectedBuyTotal);
                                        } else {
                                            console.log('Min order not met:', { selectedBuyTotal, minOrder });
                                        }
                                    }
                                    
                                    const shipping = selectedBuyCount > 0 ? 20 : 0;
                                    const total = selectedBuyTotal - discountAmount + shipping;
                                    
                                    return (
                                        <>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                <Typography variant="body2">Subtotal</Typography>
                                                <Typography variant="body2" fontWeight="bold">
                                                    ${formatCurrency(selectedBuyTotal)}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                <Typography variant="body2" fontWeight="bold">(discount amount)</Typography>
                                                <Typography variant="body2" fontWeight="bold" color={discountAmount > 0 ? "success.main" : "text.primary"}>
                                                    ${formatCurrency(discountAmount)}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                                                <Typography variant="body2">Shipping</Typography>
                                                <Typography variant="body2" fontWeight="bold">${formatCurrency(shipping)}</Typography>
                                            </Box>
                                            <Divider sx={{ mb: 2 }} />
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                                <Typography variant="body1">Total ({selectedBuyCount} {selectedBuyCount === 1 ? 'item' : 'items'})</Typography>
                                                <Typography variant="h5" fontWeight="bold" color="#d32f2f">
                                                    ${formatCurrency(total)}
                                                </Typography>
                                            </Box>
                                        </>
                                    );
                                })()}
                                <Button 
                                    fullWidth 
                                    variant="contained" 
                                    disabled={selectedBuyItems.size === 0}
                                    onClick={handleBuyCheckout}
                                    sx={{ bgcolor: '#ff8120', py: 1.5, borderRadius: '12px', '&:hover': { bgcolor: '#e6731c' } }}
                                >
                                    Order
                                </Button>
                            </Paper>

                            {/* Rental Summary */}
                            <Paper sx={{ p: 3, borderRadius: '20px', bgcolor: '#e8f0f6' }}>
                                <Typography variant="h6" fontWeight="bold" color="#2d5e89" gutterBottom>Rental Summary</Typography>
                                <Box sx={{ mt: 2, mb: 1 }}>
                                    <Typography variant="body2" sx={{ mb: 1 }}>Voucher</Typography>
                                    <FormControl fullWidth size="small">
                                        <Select
                                            value={selectedRentVoucher?.voucher_id || ''}
                                            onChange={async (e) => {
                                                const voucherId = e.target.value;
                                                const voucher = rentVouchers.find(v => v.voucher_id === voucherId);
                                                setSelectedRentVoucher(voucher || null);
                                                // Refetch cart to get updated discounted amounts
                                                await fetchCartData();
                                            }}
                                            displayEmpty
                                            disabled={voucherLoading || rentVouchers.length === 0}
                                        >
                                            <MenuItem value="">
                                                <em>Select or enter code</em>
                                            </MenuItem>
                                            {rentVouchers.map((voucher) => (
                                                <MenuItem key={voucher.voucher_id} value={voucher.voucher_id}>
                                                    {voucher.code} - {voucher.name} 
                                                    {voucher.discount_type === 'percentage' 
                                                        ? ` (${voucher.discount_value}% off)`
                                                        : ` ($${formatCurrency(voucher.discount_value)} off)`}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                    {selectedRentVoucher && (
                                        <Typography variant="caption" color="success.main" sx={{ mt: 0.5, display: 'block' }}>
                                            Applied: {selectedRentVoucher.code}
                                        </Typography>
                                    )}
                                </Box>
                                {(() => {
                                    // Calculate totals for selected rent items only
                                    const selectedRentItemsList = rentItems.filter(item => selectedRentItems.has(item.cart_item_id));
                                    const selectedRentCount = selectedRentItemsList.length;
                                    
                                    const totalRentFee = selectedRentItemsList.reduce((sum, item) => {
                                        const days = item.rental_days || 1;
                                        const pricePerDay = parseFloat(item.unit_price) || 0;
                                        return sum + (days * pricePerDay);
                                    }, 0);
                                    
                                    const totalDays = selectedRentItemsList.reduce((sum, item) => sum + (item.rental_days || 1), 0);
                                    
                                    // Security deposit: sum of unit_price for selected items (assuming unit_price is deposit)
                                    const securityDeposit = selectedRentItemsList.reduce((sum, item) => sum + parseFloat(item.unit_price || 0), 0);
                                    
                                    // Calculate discount amount from voucher
                                    let discountAmount = 0;
                                    if (selectedRentVoucher && totalRentFee > 0) {
                                        const minOrder = parseFloat(selectedRentVoucher.min_order_amount || 0);
                                        console.log('Rent voucher discount calculation:', {
                                            voucher: selectedRentVoucher,
                                            totalRentFee,
                                            minOrder,
                                            discount_type: selectedRentVoucher.discount_type,
                                            discount_value: selectedRentVoucher.discount_value,
                                            meetsMinOrder: totalRentFee >= minOrder
                                        });
                                        
                                        if (totalRentFee >= minOrder) {
                                            // Calculate discount based on discount_type and discount_value
                                            // Handle both flat structure (discount_type/discount_value) and nested (discount_config)
                                            let discountType = selectedRentVoucher.discount_type;
                                            let discountValue = selectedRentVoucher.discount_value;
                                            
                                            // If voucher has discount_config instead (from admin API), extract it
                                            if (!discountType && selectedRentVoucher.discount_config) {
                                                discountType = selectedRentVoucher.discount_config.type;
                                                discountValue = selectedRentVoucher.discount_config.value;
                                            }
                                            
                                            if (discountType === 'percentage') {
                                                // discount_value is percentage (e.g., 10 = 10%)
                                                discountAmount = totalRentFee * (parseFloat(discountValue || 0) / 100);
                                            } else if (discountType === 'amount' || discountType === 'fixed') {
                                                // discount_value is fixed amount
                                                discountAmount = parseFloat(discountValue || 0);
                                            }
                                            
                                            // Ensure discount doesn't exceed totalRentFee
                                            discountAmount = Math.min(discountAmount, totalRentFee);
                                        } else {
                                            console.log('Min order not met for rent:', { totalRentFee, minOrder });
                                        }
                                    }
                                    
                                    const shipping = selectedRentCount > 0 ? 20 : 0;
                                    const total = totalRentFee - discountAmount + securityDeposit + shipping;
                                    
                                    return (
                                        <>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                <Typography variant="body2">Total Rent Fee ({totalDays} {totalDays === 1 ? 'day' : 'days'})</Typography>
                                                <Typography variant="body2" fontWeight="bold">
                                                    ${formatCurrency(totalRentFee)}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                <Typography variant="body2" fontWeight="bold">(discount amount)</Typography>
                                                <Typography variant="body2" fontWeight="bold" color={discountAmount > 0 ? "success.main" : "text.primary"}>
                                                    ${formatCurrency(discountAmount)}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                <Typography variant="body2">Shipping</Typography>
                                                <Typography variant="body2" fontWeight="bold">${formatCurrency(shipping)}</Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                                                <Typography variant="body2">Security Deposit</Typography>
                                                <Typography variant="body2" fontWeight="bold" color="#d32f2f">
                                                    ${formatCurrency(securityDeposit)}
                                                </Typography>
                                            </Box>
                                            <Divider sx={{ mb: 2 }} />
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                                <Typography variant="body1">Total ({selectedRentCount} {selectedRentCount === 1 ? 'item' : 'items'})</Typography>
                                                <Typography variant="h5" fontWeight="bold" color="#d32f2f">
                                                    ${formatCurrency(total)}
                                                </Typography>
                                            </Box>
                                        </>
                                    );
                                })()}
                                <Button 
                                    fullWidth 
                                    variant="contained" 
                                    disabled={selectedRentItems.size === 0}
                                    onClick={handleRentCheckout}
                                    sx={{ bgcolor: '#2d5e89', py: 1.5, borderRadius: '12px' }}
                                >
                                    Rent
                                </Button>
                            </Paper>
                        </Box>
                    </Grid>
                </Grid>
            </Container>
        </Box>
        </LocalizationProvider>
    );
};

export default CartPage;