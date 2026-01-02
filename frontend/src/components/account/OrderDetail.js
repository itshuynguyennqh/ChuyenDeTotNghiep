import React from 'react';
import {
    Box, Typography, Paper, Grid, Button, Divider, Chip, IconButton
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const OrderDetail = ({ order, onBack }) => {
    // Style cho nhãn trạng thái (Chip)
    const statusStyle = {
        backgroundColor: '#DBEAFE', // Light blue for 'renting'
        color: '#1E40AF',
        fontWeight: 'bold',
        borderRadius: '12px',
        fontSize: '0.75rem',
        px: 1.5,
        height: '24px',
    };

    const isRental = order?.type === 'rent';

    return (
        <Box sx={{ width: '100%' }}>
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

            <Paper variant="outlined" sx={{ p: { xs: 2, md: 4 }, borderRadius: '20px', bgcolor: '#F3E8DB', border: '1px solid #838383', width: '100%' }}>
                <Grid container spacing={3} display={"flex"} justifyContent={"space-between"}>
                    {/* Top Section: Two Cards Side-by-Side */}
                    <Grid item xs={12} md={7} flexGrow={1}>
                        <Paper elevation={0} sx={{ p: 3, borderRadius: '20px', border: '1px solid #EEE', bgcolor: '#fff' }}>
                            <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                                {isRental ? 'Rented Order (1)' : 'Item Order (1)'}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 3 }}>
                                <Box
                                    component="img"
                                    src="https://demo.componentone.com/ASPNET/AdventureWorks/ProductImage.ashx?ProductID=1&size=large"
                                    sx={{ width: 120, height: 120, borderRadius: '15px', border: '1px solid #f0f0f0', objectFit: 'contain', bgcolor: '#fff' }}
                                />
                                <Box sx={{ flexGrow: 1 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                        <Typography variant="h6" fontWeight="bold">Touring-1000 Blue, 46</Typography>
                                        <Chip label="renting" size="small" sx={statusStyle} />
                                    </Box>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Type: Blue</Typography>
                                    {isRental && (
                                        <>
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>$20/day</Typography>
                                            <Typography variant="body2" color="text.secondary">Oct 12 - Oct 20, 2025</Typography>
                                        </>
                                    )}
                                </Box>
                            </Box>
                        </Paper>
                    </Grid>

                    {/* Price Breakdown Card */}
                    <Grid item xs={12} md={5}>
                        <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, borderRadius: '20px', border: '1px solid #EEE', bgcolor: '#fff', height: { md: '100%' } }}>
                            {isRental ? (
                                <>
                                    <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography color="text.secondary">9 days x $20</Typography>
                                        <Typography fontWeight="bold" textAlign={"left"}>$180.00</Typography>
                                    </Box>
                                    <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography color="text.secondary">Voucher</Typography>
                                        <Typography fontWeight="bold" color="#D32F2F" textAlign={"left"}>-$10.</Typography>
                                    </Box>
                                    <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography color="text.secondary">Shipping</Typography>
                                        <Typography fontWeight="bold" textAlign={"left"}>$0</Typography>
                                    </Box>
                                    <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography color="text.secondary">Security Deposit</Typography>
                                        <Typography fontWeight="bold" textAlign={"left"}>$2,699.99</Typography>
                                    </Box>
                                    <Divider sx={{ my: 2 }} />
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="h5" paddingRight={2} fontWeight="bold" alignContent={"center"} >TOTAL PAID</Typography>
                                        <Typography variant="h5" fontWeight="bold" color="#D32F2F" textAlign={"left"} >$2,869.99</Typography>
                                    </Box>
                                </>
                            ) : (
                                <>
                                    <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography color="text.secondary">Order Subtotal</Typography>
                                        <Typography fontWeight="bold" textAlign={"left"}>$59.00</Typography>
                                    </Box>
                                    <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography color="text.secondary">Voucher</Typography>
                                        <Typography fontWeight="bold" color="#D32F2F" textAlign={"left"}>- $10.00</Typography>
                                    </Box>
                                    <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography color="text.secondary">Shipping</Typography>
                                        <Typography fontWeight="bold" textAlign={"left"}>$0</Typography>
                                    </Box>
                                    <Divider sx={{ my: 2 }} />
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="h5" paddingRight={2} fontWeight="bold" alignContent={"center"} >Total Payment</Typography>
                                        <Typography variant="h5" fontWeight="bold" color="#D32F2F" textAlign={"left"}>$49.00</Typography>
                                    </Box>
                                </>
                            )}
                        </Paper>
                    </Grid>

                    {/* Order & Shipping Information */}
                    <Grid item xs={12} flexGrow={1}>
                        <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, borderRadius: '20px', border: '1px solid #EEE', bgcolor: '#fff' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography fontWeight="bold">Order ID</Typography>
                                    <Chip 
                                        label="Copy" 
                                        size="small" 
                                        onClick={() => {
                                            navigator.clipboard.writeText('244523YTH');
                                        }} 
                                        sx={{ height: 20, fontSize: '0.6rem', cursor: 'pointer' }} 
                                    />
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
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                                        <LocationOnIcon sx={{ fontSize: 18, color: '#d32f2f' }} />
                                        <Typography variant="body2" fontWeight="bold">Thanh Trúc (+84) 865358650</Typography>
                                    </Box>
                                    <Typography variant="body2" color="text.secondary" sx={{ ml: 3 }}>
                                        Số 2, ngõ 18 Định Công Thượng, phường Định Công, quận Hoàng Mai, Hà Nội
                                    </Typography>
                                </Box>
                                <Button 
                                    variant="outlined" 
                                    size="small" 
                                    sx={{ 
                                        color: '#000', 
                                        borderColor: '#ddd', 
                                        textTransform: 'none', 
                                        borderRadius: '8px',
                                        '&:hover': { borderColor: '#999', bgcolor: '#f5f5f5' }
                                    }}
                                >
                                    Update
                                </Button>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            {/* Action Buttons */}
            {isRental && (
                <Box sx={{ 
                    display: 'flex', 
                    gap: 2, 
                    mt: 4, 
                    justifyContent: { xs: 'center', md: 'space-between' },
                    flexWrap: { xs: 'wrap', md: 'nowrap' }

                }}>
                    <Button
                        variant="contained"
                        startIcon={<ShoppingBagIcon />}
                        sx={{
                            bgcolor: '#ff8c00',
                            color: '#fff',
                            px: { xs: 3, md: 4 },
                            py: 1.5,
                            borderRadius: '12px',
                            textTransform: 'none',
                            fontWeight: 'bold',
                            flex: { xs: '1 1 100%', md: '0 0 auto' },
                            minWidth: { xs: '100%', md: 'auto' },
                            '&:hover': { bgcolor: '#e67e00' }
                        }}
                    >
                        Return Request
                    </Button>
                    <Button
                        variant="outlined"
                        startIcon={<AccessTimeIcon />}
                        sx={{
                            bgcolor: '#fff',
                            color: '#000',
                            border: '1px solid #ddd',
                            px: { xs: 3, md: 4 },
                            py: 1.5,
                            borderRadius: '12px',
                            textTransform: 'none',
                            fontWeight: 'bold',
                            flex: { xs: '1 1 100%', md: '0 0 auto' },
                            minWidth: { xs: '100%', md: 'auto' },
                            '&:hover': { bgcolor: '#f5f5f5', borderColor: '#999' }
                        }}
                    >
                        Extend Rental
                    </Button>
                    <Button
                        variant="outlined"
                        startIcon={<ShoppingBagIcon />}
                        sx={{
                            bgcolor: '#fff',
                            color: '#000',
                            border: '1px solid #ddd',
                            px: { xs: 3, md: 4 },
                            py: 1.5,
                            borderRadius: '12px',
                            textTransform: 'none',
                            fontWeight: 'bold',
                            flex: { xs: '1 1 100%', md: '0 0 auto' },
                            minWidth: { xs: '100%', md: 'auto' },
                            '&:hover': { bgcolor: '#f5f5f5', borderColor: '#999' }
                        }}
                    >
                        Buyout
                    </Button>
                </Box>
            )}
            </Paper>

        </Box>
    );
};

export default OrderDetail;