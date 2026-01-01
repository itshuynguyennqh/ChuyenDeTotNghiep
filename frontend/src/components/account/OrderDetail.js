import React from 'react';
import {
    Box, Typography, Paper, Grid, Button, Divider, Chip, IconButton
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

const OrderDetail = ({ order, onBack }) => {
    // Style cho nhãn trạng thái (Chip)
    const statusStyle = {
        backgroundColor: '#FEF9C3', // Vàng nhạt cho 'preparing'
        color: '#854D0E',
        fontWeight: 'bold',
        borderRadius: '8px',
        fontSize: '0.75rem',
        px: 1
    };

    return (
        <Box>
            {/* Breadcrumb / Title */}
            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography
                    variant="h5"
                    fontWeight="bold"
                    onClick={onBack}
                    sx={{ cursor: 'pointer', '&:hover': { color: '#ff8c00' } }}
                >
                    My Order
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="text.secondary">/ Order Details</Typography>
            </Box>

            <Paper variant="outlined" sx={{ p: 4, borderRadius: '20px', bgcolor: 'transparent', border: '1px solid #E0E0E0' }}>
                <Grid container spacing={3}>
                    {/* Cột trái: Item Order (1) */}
                    <Grid item xs={12} md={7}>
                        <Paper elevation={0} sx={{ p: 3, borderRadius: '20px', border: '1px solid #EEE' }}>
                            <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>Item Order (1)</Typography>
                            <Box sx={{ display: 'flex', gap: 3 }}>
                                <Box
                                    component="img"
                                    src="https://via.placeholder.com/150"
                                    sx={{ width: 120, height: 120, borderRadius: '15px', border: '1px solid #f0f0f0' }}
                                />
                                <Box sx={{ flexGrow: 1 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <Typography variant="h6" fontWeight="bold">OnBros Bike Helmet</Typography>
                                        <Chip label="preparing" size="small" sx={statusStyle} />
                                    </Box>
                                    <Typography variant="h6" color="#D32F2F" fontWeight="bold" sx={{ mt: 1 }}>$49.00</Typography>
                                    <Typography variant="body2" color="text.secondary">x1</Typography>
                                </Box>
                            </Box>
                        </Paper>
                    </Grid>

                    {/* Cột phải: Summary */}
                    <Grid item xs={12} md={5}>
                        <Paper elevation={0} sx={{ p: 3, borderRadius: '20px', border: '1px solid #EEE', height: '100%' }}>
                            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
                                <Typography color="text.secondary">Order Subtotal</Typography>
                                <Typography fontWeight="bold">$59.00</Typography>
                            </Box>
                            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
                                <Typography color="text.secondary">Voucher</Typography>
                                <Typography fontWeight="bold" color="#D32F2F">- $10.00</Typography>
                            </Box>
                            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
                                <Typography color="text.secondary">Shipping</Typography>
                                <Typography fontWeight="bold">$0</Typography>
                            </Box>
                            <Divider sx={{ my: 2 }} />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="h6" fontWeight="bold">Total Payment</Typography>
                                <Typography variant="h5" fontWeight="bold" color="#D32F2F">$49.00</Typography>
                            </Box>
                        </Paper>
                    </Grid>

                    {/* Hàng dưới: Order Info */}
                    <Grid item xs={12}>
                        <Paper elevation={0} sx={{ p: 3, borderRadius: '20px', border: '1px solid #EEE' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography fontWeight="bold">Order ID</Typography>
                                    <Chip label="Copy" size="small" onClick={() => {}} sx={{ height: 20, fontSize: '0.6rem' }} />
                                </Box>
                                <Typography fontWeight="500">244523YTH</Typography>
                            </Box>

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                <Typography color="text.secondary">Payment Method</Typography>
                                <Typography fontWeight="500">E-wallet</Typography>
                            </Box>

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                                <Typography color="text.secondary">Order Date</Typography>
                                <Typography fontWeight="500">7 Nov 2025</Typography>
                            </Box>

                            <Divider sx={{ mb: 3 }} />

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Box>
                                    <Typography fontWeight="bold" sx={{ mb: 1 }}>Shipping Address</Typography>
                                    <Typography variant="body2" fontWeight="bold">Thanh Trúc (+84) 865358650</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Số 2, ngõ 18 Định Công Thượng, phường Định Công, quận Hoàng Mai, Hà Nội
                                    </Typography>
                                </Box>
                                <Button variant="outlined" size="small" sx={{ color: '#000', borderColor: '#ddd', textTransform: 'none', borderRadius: '8px', mt: 3 }}>
                                    Update
                                </Button>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            </Paper>

            {/* Cancel Button */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Button
                    variant="contained"
                    sx={{
                        bgcolor: '#fff',
                        color: '#000',
                        border: '1px solid #ddd',
                        px: 4,
                        py: 1,
                        borderRadius: '10px',
                        textTransform: 'none',
                        fontWeight: 'bold',
                        '&:hover': { bgcolor: '#f5f5f5', borderColor: '#bbb' }
                    }}
                >
                    Cancel Order
                </Button>
            </Box>

        </Box>
    );
};

export default OrderDetail;