import React, { useEffect, useState } from 'react';
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
import AddressManager from '../components/AddressManager';
import { fetchCartAPI, fetchAddressesAPI } from '../api/productApi';

function PaymentPage() {
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [isAddressModalOpen, setAddressModalOpen] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            try {
                const cartResponse = await fetchCartAPI();
                setCart(cartResponse.data);

                const addressesResponse = await fetchAddressesAPI();
                if (addressesResponse.data && addressesResponse.data.length > 0) {
                    setSelectedAddress(addressesResponse.data[0]); // Select the first address by default
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

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>Loading...</Box>;
    }

    if (!cart || !cart.items || cart.items.length === 0) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>Giỏ hàng trống</Box>;
    }

    const subtotal = cart.items.reduce((total, item) => total + parseFloat(item.subtotal), 0);
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
                        <Paper elevation={0} sx={{ p: 2, backgroundColor: 'transparent', display: 'flex', alignItems: 'center', cursor: 'pointer', mb: 2 }} onClick={() => setAddressModalOpen(true)}>
                            <LocationIcon sx={{ color: '#d32f2f', mr: 2 }} />
                            <Box sx={{ flexGrow: 1 }}>
                                {selectedAddress ? (
                                    <>
                                        <Typography variant="subtitle1" fontWeight="bold">
                                            {selectedAddress.addressline1}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {selectedAddress.city}, {selectedAddress.postalcode}
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

                        <Divider sx={{ mb: 3 }} />

                        <Stack spacing={3}>
                            {cart.items.map((item) => (
                                <Box key={item.cartitemid} sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Box sx={{ width: 80, height: 80, backgroundColor: '#fff', borderRadius: 2, p: 1, border: '1px solid #eee' }}>
                                        <CardMedia 
                                            component="img" 
                                            image={`https://demo.componentone.com/ASPNET/AdventureWorks/ProductImage.ashx?ProductID=${item.productid.productid}&size=large`}
                                            sx={{ objectFit: 'contain', height: '100%' }} 
                                            onError={(e) => { e.target.onerror = null; e.target.src = `https://via.placeholder.com/100?text=No+Image`; }}
                                        />
                                    </Box>
                                    <Box sx={{ flexGrow: 1, ml: 2 }}>
                                        <Typography variant="subtitle2" fontWeight="bold">{item.productid.name}</Typography>
                                        {item.productid.color && (
                                            <Typography variant="caption" sx={{ color: '#999', backgroundColor: '#eee', px: 1, borderRadius: 1 }}>
                                                Color: {item.productid.color}
                                            </Typography>
                                        )}
                                        <Typography variant="subtitle2" color="error" sx={{ mt: 0.5 }}>
                                            ${parseFloat(item.unitprice).toFixed(2)}
                                        </Typography>
                                    </Box>
                                    <Typography variant="body2" color="text.secondary">x{item.quantity}</Typography>
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
                            ORDER
                        </Button>
                    </Box>
                </Container>
            </Paper>

            <Footer />

            <AddressManager
                open={isAddressModalOpen}
                onClose={() => setAddressModalOpen(false)}
                onSelectAddress={handleSelectAddress}
            />
        </Box>
    );
}

export default PaymentPage;
