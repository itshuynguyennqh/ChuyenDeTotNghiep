import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Container, Grid, Typography, Radio, RadioGroup, FormControlLabel,
    Button, Divider, Stack, CardMedia, Paper, IconButton, InputAdornment, TextField
} from '@mui/material';
import {
    LocationOn as LocationIcon,
    ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import AddressManager from '../components/common/AddressManager';
import { fetchCartAPI, fetchAddressesAPI, placeOrderAPI } from '../api/productApi';
import { getAccountDetails } from '../api/authApi';

function PaymentPage() {
    const navigate = useNavigate();
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [isAddressModalOpen, setAddressModalOpen] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [userInfo, setUserInfo] = useState(null);
    
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
                const cartResponse = await fetchCartAPI();
                setCart(cartResponse.data);

                if (isLoggedIn) {
                    const user = JSON.parse(localStorage.getItem('user'));
                    if (user && user.CustomerID) {
                        const accountResponse = await getAccountDetails(user.CustomerID);
                        setUserInfo(accountResponse.data);
                    }

                    const addressesResponse = await fetchAddressesAPI();
                    if (addressesResponse.data && addressesResponse.data.length > 0) {
                        setSelectedAddress(addressesResponse.data[0]);
                    }
                }
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu trang thanh toán", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

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
            orderData = { address_id: selectedAddress.AddressID };
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
            await placeOrderAPI(orderData);
            
            // Bắn sự kiện để Header cập nhật lại số lượng giỏ hàng (về 0)
            window.dispatchEvent(new CustomEvent('cartUpdated'));
            navigate('/order-success');
        } catch (error) {
            console.error("Đặt hàng thất bại:", error);
            alert("Đặt hàng thất bại. Vui lòng thử lại.");
            setProcessing(false);
        }
    };

    const handleGuestInfoChange = (e) => {
        setGuestInfo({ ...guestInfo, [e.target.name]: e.target.value });
    };

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>Loading...</Box>;
    }

    if (!cart || !cart.Items || cart.Items.length === 0) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>Giỏ hàng trống</Box>;
    }

    const subtotal = cart.Total || cart.Items.reduce((total, item) => total + (item.Quantity * item.UnitPrice), 0);
    const voucherDiscount = 0;
    const shippingFee = 0;
    const totalPayment = subtotal - voucherDiscount + shippingFee;

    return (
        <Box sx={{ backgroundColor: '#fcf6f0', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header />

            <Container maxWidth="xl" sx={{ py: 2, flexGrow: 1 }}>
                <Typography variant="body2" sx={{ mb: 3, color: '#1976d2' }}>
                    Home  /  <span style={{ fontWeight: 'bold' }}>Payment</span>
                </Typography>

                <Grid container spacing={0} sx={{ backgroundColor: '#fcf6f0', borderRadius: 2, overflow: 'hidden' }}>
                    <Grid item xs={12} md={7} sx={{ pr: { md: 4 } }}>
                        {isLoggedIn ? (
                            // --- GIAO DIỆN CHO USER ĐÃ ĐĂNG NHẬP ---
                            <>
                                {/* Hiển thị thông tin cá nhân từ DB */}
                                <Box sx={{ mb: 3, p: 2, border: '1px solid #ddd', borderRadius: 2, backgroundColor: '#fff' }}>
                                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>Contact Information</Typography>
                                    {userInfo ? (
                                        <>
                                            <Typography variant="body1" fontWeight="bold">{userInfo.FirstName} {userInfo.LastName}</Typography>
                                            <Typography variant="body2" color="text.secondary">Email: {userInfo.Email}</Typography>
                                            <Typography variant="body2" color="text.secondary">Phone: {userInfo.Phone}</Typography>
                                        </>
                                    ) : (
                                        <Typography variant="body2">Loading user info...</Typography>
                                    )}
                                </Box>

                                {/* Phần chọn địa chỉ */}
                                <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>Shipping Address</Typography>
                                <Paper elevation={0} sx={{ p: 2, border: '1px solid #ddd', borderRadius: 2, backgroundColor: '#fff', display: 'flex', alignItems: 'center', cursor: 'pointer', mb: 2 }} onClick={() => setAddressModalOpen(true)}>
                                    <LocationIcon sx={{ color: '#d32f2f', mr: 2 }} />
                                    <Box sx={{ flexGrow: 1 }}>
                                        {selectedAddress ? (
                                            <>
                                                <Typography variant="subtitle1" fontWeight="bold">
                                                    {selectedAddress.AddressLine1}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {selectedAddress.ContactName}, {selectedAddress.PhoneNumber}
                                                </Typography>
                                            </>
                                        ) : (
                                            <Typography variant="subtitle1" fontWeight="bold">
                                                No address selected. Click to add one.
                                            </Typography>
                                        )}
                                    </Box>
                                    <ChevronRightIcon sx={{ color: '#ccc' }} />
                                </Paper>
                            </>
                        ) : (
                            // --- GIAO DIỆN CHO KHÁCH VÃNG LAI (GUEST FORM) ---
                            <Box sx={{ mb: 4, p: 2, border: '1px solid #ddd', borderRadius: 2, backgroundColor: '#fff' }}>
                                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Thông tin giao hàng</Typography>
                                <Grid container spacing={2} sx={{ m: 2 }}>
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

                        <Divider sx={{ mb: 3 }} />

                        <Stack spacing={3} >
                            {cart.Items.map((item) => (
                                <Box key={item.CartItemID} sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Box sx={{ width: 80, height: 80, backgroundColor: '#fff', borderRadius: 2, p: 1, border: '1px solid #eee' }}>
                                        <CardMedia 
                                            component="img" 
                                            image={`https://demo.componentone.com/ASPNET/AdventureWorks/ProductImage.ashx?ProductID=${item.ProductID}&size=large`}
                                            sx={{ objectFit: 'contain', height: '100%' }} 
                                            onError={(e) => { e.target.onerror = null; e.target.src = `https://via.placeholder.com/100?text=No+Image`; }}
                                        />
                                    </Box>
                                    <Box sx={{ flexGrow: 1, ml: 2 }}>
                                        <Typography variant="subtitle2" fontWeight="bold">{item.Name}</Typography>
                                        {item.Color && (
                                            <Typography variant="caption" sx={{ color: '#999', backgroundColor: '#eee', px: 1, borderRadius: 1 }}>
                                                Color: {item.Color}
                                            </Typography>
                                        )}
                                        <Typography variant="subtitle2" color="error" sx={{ mt: 0.5 }}>
                                            ${parseFloat(item.UnitPrice).toFixed(2)}
                                        </Typography>
                                    </Box>
                                    <Typography variant="body2" color="text.secondary">x{item.Quantity}</Typography>
                                </Box>
                            ))}
                        </Stack>
                    </Grid>

                    <Grid item xs={12} md={5} sx={{ borderLeft: { md: '1px solid #ddd' }, pl: { md: 4 }, py: 2 }}>
                        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Payment Detail</Typography>
                        <Stack spacing={1} sx={{ mb: 4 }}>
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
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 1 }}>
                                <Typography fontWeight="bold">Total Payment</Typography>
                                <Typography color="error" variant="h6" fontWeight="bold">${totalPayment.toFixed(2)}</Typography>
                            </Box>
                        </Stack>

                        <Divider sx={{ mb: 3 }} />

                        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Payment Method</Typography>
                        <RadioGroup defaultValue="online">
                            <Box sx={{ mb: 2 }}>
                                <FormControlLabel
                                    value="online"
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
                    </Grid>
                </Grid>
            </Container>

            <Paper elevation={3} sx={{ py: 2, mt: 'auto', backgroundColor: '#fff' }}>
                <Container maxWidth="xl">
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 3 }}>
                        <Typography variant="h6">
                            Total <span style={{ color: '#d32f2f', fontWeight: 'bold' }}>${totalPayment.toFixed(2)}</span>
                        </Typography>
                        <Button
                            variant="contained"
                            onClick={handleOrder}
                            disabled={processing}
                            sx={{
                                backgroundColor: '#ff8c00',
                                color: '#fff',
                                px: 6, py: 1,
                                fontSize: '1.1rem',
                                fontWeight: 'bold',
                                borderRadius: 2,
                                '&:hover': { backgroundColor: '#e67e00' }
                            }}
                        >
                            {processing ? 'PROCESSING...' : 'ORDER'}
                        </Button>
                    </Box>
                </Container>
            </Paper>

            <Footer />

            {isLoggedIn && (
                <AddressManager
                    open={isAddressModalOpen}
                    onClose={() => setAddressModalOpen(false)}
                    onSelectAddress={handleSelectAddress}
                />
            )}
        </Box>
    );
}

export default PaymentPage;
