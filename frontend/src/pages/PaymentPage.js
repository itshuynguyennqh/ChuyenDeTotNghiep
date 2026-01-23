import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Box, Container, Grid, Typography, Radio, RadioGroup, FormControlLabel,
    Button, Divider, Stack, CardMedia, Paper, IconButton, InputAdornment, TextField,
    Dialog, DialogContent, DialogActions
} from '@mui/material';
import {
    LocationOn as LocationIcon,
    ChevronRight as ChevronRightIcon,
    CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import AddressManager from '../components/common/AddressManager';
import Chatbot from '../components/common/Chatbot';
import { fetchAddressesAPI, placeOrderAPI } from '../api/productApi';
import { getAccountDetails } from '../api/authApi';
import { checkout, getCart } from '../api/storeApi';

function PaymentPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [cart, setCart] = useState(null);
    const [directOrder, setDirectOrder] = useState(null); // For buy/rent now orders
    const [loading, setLoading] = useState(true);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [isAddressModalOpen, setAddressModalOpen] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [userInfo, setUserInfo] = useState(null);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const [isRedirecting, setIsRedirecting] = useState(false);
    const [voucherCode, setVoucherCode] = useState(null); // Voucher code from cart
    const [paymentMethod, setPaymentMethod] = useState('cod'); // Selected payment method
    
    // State cho khách vãng lai
    const isLoggedIn = !!localStorage.getItem('token');
    const [guestInfo, setGuestInfo] = useState({
        firstname: '',
        lastname: '',
        email: '',
        phone: '',
        addressline1: '',
        city: '',
        postalcode: ''
    });

    useEffect(() => {
        const loadData = async () => {
            try {
                // Check if this is a direct order (buy/rent now from product detail)
                // Direct orders have 'product' property
                if (location.state && location.state.product) {
                    // Direct order from ProductDetail page
                    setDirectOrder(location.state);
                } else {
                    // Load cart for checkout (either from cart page or direct access)
                    const cartResponse = await getCart();
                    // API returns { status, code, data: { cart_id, total_items, items, ... } }
                    const cartData = cartResponse.data?.data || cartResponse.data;
                    setCart(cartData);
                    
                    // If coming from cart, get voucher code from location.state
                    if (location.state && location.state.fromCart) {
                        setVoucherCode(location.state.voucherCode || null);
                    }
                }

                if (isLoggedIn) {
                    const user = JSON.parse(localStorage.getItem('user'));
                    if (user && user.CustomerID) {
                        const accountResponse = await getAccountDetails(user.CustomerID);
                        setUserInfo(accountResponse.data);
                    }

                    const addressesResponse = await fetchAddressesAPI();
                    // API returns { status, code, data: [...] }
                    const addresses = addressesResponse.data?.data || addressesResponse.data || [];
                    if (Array.isArray(addresses) && addresses.length > 0) {
                        // Normalize API response (snake_case) to component expected format (PascalCase)
                        const firstAddress = addresses[0];
                        const normalizedAddress = {
                            AddressID: firstAddress.id || firstAddress.address_id,
                            ContactName: firstAddress.contact_name || firstAddress.receiver_name || '',
                            PhoneNumber: firstAddress.phone_number || firstAddress.phone || '',
                            AddressLine1: firstAddress.address_line1 || firstAddress.address || '',
                            City: firstAddress.city || '',
                            PostalCode: firstAddress.postal_code || '',
                            IsDefault: firstAddress.is_default || false,
                            // Keep original fields for compatibility
                            ...firstAddress
                        };
                        setSelectedAddress(normalizedAddress);
                    }
                }
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu trang thanh toán", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [location.state]);

    const handleSelectAddress = (address) => {
        setSelectedAddress(address);
        setAddressModalOpen(false);
    };

    const handleOrder = async () => {
        let orderData = {};

        if (isLoggedIn) {
            if (!selectedAddress) {
                alert("Vui lòng chọn địa chỉ giao hàng!");
                return;
            }
            orderData = { 
                address_id: selectedAddress.AddressID,
                payment_method: paymentMethod,
                voucher_code: voucherCode || null,
                note: null
            };
        } else {
            // Validate guest info
            if (!guestInfo.firstname || !guestInfo.email || !guestInfo.phone || !guestInfo.addressline1 || !guestInfo.city) {
                alert("Vui lòng điền đầy đủ thông tin giao hàng!");
                return;
            }
            orderData = { guest_info: guestInfo };
        }

        setProcessing(true);
        try {
            if (isDirectOrder) {
                // For direct orders, you might want to add to cart first or create order directly
                // For now, we'll add to cart and then place order
                // TODO: Implement direct order API if available
                orderData.order_type = orderType;
                orderData.product = directOrder.product;
                await placeOrderAPI(orderData);
            } else {
                // Cart checkout - use checkout API
                const checkoutResponse = await checkout(orderData);
                const responseData = checkoutResponse.data?.data || checkoutResponse.data;
                
                // Navigate to order success page with order data
                setTimeout(() => {
                    setShowSuccessPopup(false);
                    navigate('/order-success', { 
                        state: { 
                            orderData: responseData 
                        } 
                    });
                }, 2000);
            }
            
            // Bắn sự kiện để Header cập nhật lại số lượng giỏ hàng (về 0)
            window.dispatchEvent(new CustomEvent('cartUpdated'));
            
            // Show success popup with confetti
            setShowConfetti(true);
            setShowSuccessPopup(true);
            setProcessing(false);
            
            // Hide confetti after animation
            setTimeout(() => {
                setShowConfetti(false);
            }, 3000);
            
            // For direct orders, navigate after showing success
            if (isDirectOrder) {
                setTimeout(() => {
                    setShowSuccessPopup(false);
                    navigate('/order-success');
                }, 2000);
            }
        } catch (error) {
            console.error("Đặt hàng thất bại:", error);
            const errorMessage = error?.response?.data?.detail || error?.message || "Đặt hàng thất bại. Vui lòng thử lại.";
            alert(errorMessage);
            setProcessing(false);
        }
    };

    const handleGuestInfoChange = (e) => {
        setGuestInfo({ ...guestInfo, [e.target.name]: e.target.value });
    };

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>Loading...</Box>;
    }

    // Check if we have a direct order or cart
    const isDirectOrder = directOrder !== null && directOrder?.product;
    const orderType = directOrder?.type || 'buy'; // 'buy' or 'rent'

    // If we have directOrder state but no product, it's invalid
    if (directOrder !== null && !directOrder?.product) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>Invalid order data. Please try again.</Box>;
    }

    if (!isDirectOrder && (!cart || !cart.items || cart.items.length === 0)) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>Giỏ hàng trống</Box>;
    }

    // Calculate totals based on order type
    let subtotal = 0;
    let voucherDiscount = 0;
    let shippingFee = 0;
    let securityDeposit = 0;
    let totalPayment = 0;

    if (isDirectOrder) {
        const product = directOrder.product;
        if (!product) {
            return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>Invalid order data</Box>;
        }
        if (orderType === 'rent') {
            const rentalFee = (product.PricePerDay || 0) * (product.Days || 1) * (product.Quantity || 1);
            subtotal = rentalFee;
            securityDeposit = (product.SecurityDeposit || 0) * (product.Quantity || 1);
            totalPayment = subtotal - voucherDiscount + shippingFee + securityDeposit;
        } else {
            subtotal = (product.Price || 0) * (product.Quantity || 1);
            totalPayment = subtotal - voucherDiscount + shippingFee;
        }
    } else {
        // Calculate subtotal from cart items
        if (cart.items && cart.items.length > 0) {
            subtotal = cart.items.reduce((total, item) => total + parseFloat(item.subtotal || 0), 0);
        } else {
            subtotal = cart.total_buy_amount + cart.total_rent_amount || 0;
        }
        totalPayment = subtotal - voucherDiscount + shippingFee;
    }

    return (
        <Box sx={{ backgroundColor: '#F3E8DB', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header />

            <Container maxWidth="xl" sx={{ py: 2, flexGrow: 1 }}>
                <Typography variant="body2" sx={{ mb: 3, color: '#1976d2' }}>
                    Home  /  <span style={{ fontWeight: 'bold' }}>Payment</span>
                </Typography>

                <Grid container spacing={4}>
                    <Grid item xs={12} md={7} flexGrow={1}>
                        {/* Shipping Address Section */}
                        {isLoggedIn ? (
                            <Paper 
                                elevation={0} 
                                sx={{ 
                                    p: 2, 
                                    mb: 3, 
                                    backgroundColor: '#F3E8DB', 
                                    display: 'flex', 
                                    alignItems: 'flex-start',
                                    cursor: 'pointer',
                                    '&:hover': { backgroundColor: '#fafafa' }
                                }} 
                                onClick={() => setAddressModalOpen(true)}
                            >
                                <LocationIcon sx={{ color: '#d32f2f', mr: 2, mt: 0.5 }} />
                                <Box sx={{ flexGrow: 1 }}>
                                    {selectedAddress ? (
                                        <>
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                                <Typography variant="subtitle1" fontWeight="bold" sx={{ mr: 1 }}>
                                                    {selectedAddress.ContactName || userInfo?.FirstName + ' ' + userInfo?.LastName}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    ({selectedAddress.PhoneNumber || userInfo?.Phone})
                                                </Typography>
                                            </Box>
                                            <Typography variant="body2" color="text.secondary">
                                                {selectedAddress.AddressLine1}
                                                {selectedAddress.City && `, ${selectedAddress.City}`}
                                                {selectedAddress.PostalCode && `, ${selectedAddress.PostalCode}`}
                                            </Typography>
                                        </>
                                    ) : (
                                        <>
                                            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 0.5 }}>
                                                {userInfo ? `${userInfo.FirstName} ${userInfo.LastName}` : 'No name'}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                No address selected. Click to add one.
                                            </Typography>
                                        </>
                                    )}
                                </Box>
                                <ChevronRightIcon sx={{ color: '#ccc', ml: 1 }} />
                            </Paper>
                        ) : (
                            <Box sx={{ mb: 4, p: 2, border: '1px solid #ddd', borderRadius: 2, backgroundColor: '#fff' }}>
                                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Thông tin giao hàng</Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                        <TextField label="Họ (Last Name)" name="lastname" fullWidth size="small" required value={guestInfo.lastname} onChange={handleGuestInfoChange} />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <TextField label="Tên (First Name)" name="firstname" fullWidth size="small" required value={guestInfo.firstname} onChange={handleGuestInfoChange} />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField label="Email" name="email" type="email" fullWidth size="small" required value={guestInfo.email} onChange={handleGuestInfoChange} />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField label="Số điện thoại" name="phone" fullWidth size="small" required value={guestInfo.phone} onChange={handleGuestInfoChange} />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField label="Địa chỉ (Số nhà, đường)" name="addressline1" fullWidth size="small" required value={guestInfo.addressline1} onChange={handleGuestInfoChange} />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <TextField label="Thành phố" name="city" fullWidth size="small" required value={guestInfo.city} onChange={handleGuestInfoChange} />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <TextField label="Mã bưu điện" name="postalcode" fullWidth size="small" value={guestInfo.postalcode} onChange={handleGuestInfoChange} />
                                    </Grid>
                                </Grid>
                            </Box>
                        )}

                        {/* Product List */}
                        <Stack spacing={2}>
                            {isDirectOrder ? (
                                // Direct order (Buy Now / Rent Now)
                                directOrder?.product ? (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Box sx={{ width: 100, height: 100, backgroundColor: '#fff', borderRadius: 2, p: 1, border: '1px solid #eee', flexShrink: 0 }}>
                                            <CardMedia 
                                                component="img" 
                                                image={directOrder.product.Image || 'https://via.placeholder.com/100?text=No+Image'}
                                                sx={{ objectFit: 'contain', height: '100%', width: '100%' }} 
                                                onError={(e) => { e.target.onerror = null; e.target.src = `https://via.placeholder.com/100?text=No+Image`; }}
                                            />
                                        </Box>
                                        <Box sx={{ flexGrow: 1 }}>
                                            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 0.5 }}>
                                                {directOrder.product.Name || 'Product'}
                                            </Typography>
                                            {orderType === 'rent' && directOrder.product.Color && directOrder.product.Size && (
                                                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                                    {directOrder.product.Color}, Size {directOrder.product.Size}
                                                </Typography>
                                            )}
                                            {orderType === 'rent' && (
                                                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                                    From {directOrder.product.RentalStartDate} to {directOrder.product.RentalEndDate}
                                                </Typography>
                                            )}
                                            {orderType === 'rent' ? (
                                                <Typography variant="body1" color="error" fontWeight="bold">
                                                    ${(directOrder.product.PricePerDay || 0).toFixed(2)}/day
                                                </Typography>
                                            ) : (
                                                <Typography variant="body1" color="error" fontWeight="bold">
                                                    ${(directOrder.product.Price || 0).toFixed(2)}
                                                </Typography>
                                            )}
                                        </Box>
                                        <Typography variant="body2" color="text.secondary" sx={{ alignSelf: 'flex-start', pt: 1 }}>
                                            {orderType === 'rent' ? `x${directOrder.product.Days || 1} days` : `x${directOrder.product.Quantity || 1}`}
                                        </Typography>
                                    </Box>
                                ) : (
                                    <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
                                        <Typography>Invalid product data</Typography>
                                    </Box>
                                )
                            ) : (
                                // Cart items
                                cart.items && cart.items.map((item) => (
                                    <Box key={item.id || item.cart_item_id} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Box sx={{ width: 100, height: 100, backgroundColor: '#fff', borderRadius: 2, p: 1, border: '1px solid #eee', flexShrink: 0 }}>
                                            <CardMedia 
                                                component="img" 
                                                image={item.thumbnail || `https://demo.componentone.com/ASPNET/AdventureWorks/ProductImage.ashx?ProductID=${item.product_id}&size=large`}
                                                sx={{ objectFit: 'contain', height: '100%', width: '100%' }} 
                                                onError={(e) => { e.target.onerror = null; e.target.src = `https://via.placeholder.com/100?text=No+Image`; }}
                                            />
                                        </Box>
                                        <Box sx={{ flexGrow: 1 }}>
                                            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 0.5 }}>
                                                {item.product_name}
                                            </Typography>
                                            <Typography variant="body1" color="error" fontWeight="bold">
                                                ${parseFloat(item.unit_price || 0).toFixed(2)}
                                            </Typography>
                                        </Box>
                                        <Typography variant="body2" color="text.secondary" sx={{ alignSelf: 'flex-start', pt: 1 }}>
                                            x{item.quantity}
                                        </Typography>
                                    </Box>
                                ))
                            )}
                        </Stack>
                    </Grid>

                    <Grid item xs={12} md={5} flexGrow={1}>
                        <Box sx={{ position: 'sticky', top: 20 }}>
                            {/* Payment Detail */}
                            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Payment Detail</Typography>
                            <Stack spacing={1.5} sx={{ mb: 3 }}>
                                {orderType === 'rent' ? (
                                    <>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography color="text.secondary">Rental Fee</Typography>
                                            <Typography color="error" fontWeight="bold">${subtotal.toFixed(2)}</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography color="text.secondary">Voucher</Typography>
                                            <Typography color="error" fontWeight="bold">- ${voucherDiscount.toFixed(2)}</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography color="text.secondary">Shipping</Typography>
                                            <Typography color="error" fontWeight="bold">${shippingFee.toFixed(2)}</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography color="text.secondary">Security Deposit (Refundable)</Typography>
                                            <Typography color="error" fontWeight="bold">${securityDeposit.toFixed(2)}</Typography>
                                        </Box>
                                    </>
                                ) : (
                                    <>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography color="text.secondary">Order Subtotal</Typography>
                                            <Typography color="error" fontWeight="bold">${subtotal.toFixed(2)}</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography color="text.secondary">Voucher</Typography>
                                            <Typography color="error" fontWeight="bold">- ${voucherDiscount.toFixed(2)}</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography color="text.secondary">Shipping</Typography>
                                            <Typography color="error" fontWeight="bold">${shippingFee.toFixed(2)}</Typography>
                                        </Box>
                                    </>
                                )}
                                <Divider sx={{ my: 1 }} />
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography fontWeight="bold">Total Payment</Typography>
                                    <Typography color="error" variant="h6" fontWeight="bold">${totalPayment.toFixed(2)}</Typography>
                                </Box>
                            </Stack>

                            <Divider sx={{ mb: 3 }} />

                            {/* Payment Method */}
                            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Payment Method</Typography>
                            <RadioGroup value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} sx={{ mb: 4 }}>
                                <Box sx={{ mb: 2 }}>
                                    <FormControlLabel
                                        value="banking"
                                        control={<Radio size="small" color="default" />}
                                        label={<Typography fontWeight="bold">Online Payment</Typography>}
                                    />
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', ml: 4 }}>
                                        💳 Pay easily with your card or e-wallet.
                                    </Typography>
                                </Box>
                                <Box>
                                    <FormControlLabel
                                        value="cod"
                                        control={<Radio size="small" color="default" />}
                                        label={<Typography fontWeight="bold">Cash on Delivery (COD)</Typography>}
                                    />
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', ml: 4 }}>
                                        🚚 Pay when you receive your order.
                                    </Typography>
                                </Box>
                            </RadioGroup>

                            {/* Total and Order Button */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 2, borderTop: '1px solid #eee' }}>
                                <Typography variant="h6" fontWeight="bold">
                                    Total <span style={{ color: '#d32f2f' }}>${totalPayment.toFixed(2)}</span>
                                </Typography>
                                <Button
                                    variant="contained"
                                    onClick={handleOrder}
                                    disabled={processing}
                                    sx={{
                                        backgroundColor: '#ff8c00',
                                        color: '#fff',
                                        px: 4,
                                        py: 1.5,
                                        fontSize: '1rem',
                                        fontWeight: 'bold',
                                        borderRadius: 2,
                                        textTransform: 'none',
                                        '&:hover': { backgroundColor: '#e67e00' }
                                    }}
                                >
                                    {processing ? 'PROCESSING...' : (orderType === 'rent' ? 'RENT' : 'ORDER')}
                                </Button>
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
            </Container>

            <Footer />

            {isLoggedIn && (
                <AddressManager
                    open={isAddressModalOpen}
                    onClose={() => setAddressModalOpen(false)}
                    onSelectAddress={handleSelectAddress}
                    selectedAddressId={selectedAddress?.AddressID}
                />
            )}

            {/* Success Popup with Confetti */}
            <Dialog
                open={showSuccessPopup}
                onClose={() => {}}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        overflow: 'visible',
                        position: 'relative'
                    }
                }}
            >
                {showConfetti && (
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            pointerEvents: 'none',
                            zIndex: 1000,
                            overflow: 'hidden'
                        }}
                    >
                        {[...Array(50)].map((_, i) => (
                            <Box
                                key={i}
                                sx={{
                                    position: 'absolute',
                                    width: 10,
                                    height: 10,
                                    backgroundColor: [
                                        '#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b',
                                        '#eb4d4b', '#6c5ce7', '#a29bfe', '#fd79a8', '#fdcb6e'
                                    ][i % 10],
                                    left: `${Math.random() * 100}%`,
                                    top: `${Math.random() * 100}%`,
                                    borderRadius: '50%',
                                    animation: 'confetti-fall 3s ease-out forwards',
                                    animationDelay: `${Math.random() * 0.5}s`,
                                    '@keyframes confetti-fall': {
                                        '0%': {
                                            transform: 'translateY(-100vh) rotate(0deg)',
                                            opacity: 1
                                        },
                                        '100%': {
                                            transform: `translateY(100vh) rotate(${360 + Math.random() * 360}deg)`,
                                            opacity: 0
                                        }
                                    }
                                }}
                            />
                        ))}
                    </Box>
                )}
                <DialogContent sx={{ textAlign: 'center', py: 4 }}>
                    <CheckCircleIcon 
                        sx={{ 
                            fontSize: 80, 
                            color: '#4caf50', 
                            mb: 2,
                            animation: 'scaleIn 0.5s ease-out',
                            '@keyframes scaleIn': {
                                '0%': {
                                    transform: 'scale(0)',
                                    opacity: 0
                                },
                                '50%': {
                                    transform: 'scale(1.2)'
                                },
                                '100%': {
                                    transform: 'scale(1)',
                                    opacity: 1
                                }
                            }
                        }} 
                    />
                    <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
                        {orderType === 'rent' ? 'Rental completed!' : 'Order placed successfully!'}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        {orderType === 'rent' 
                            ? 'Your rental has been confirmed. Enjoy your ride!'
                            : 'Thank you for your purchase! Your order is being processed.'}
                    </Typography>
                </DialogContent>
            </Dialog>
            
            {/* Chatbot Component */}
            <Chatbot />
        </Box>
    );
}

export default PaymentPage;
