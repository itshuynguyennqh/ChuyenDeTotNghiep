import React, { useEffect, useState } from 'react';
import {
    Container, Grid, Typography, Box, Paper, Button, IconButton,
    Checkbox, Divider, TextField, InputAdornment, MenuItem, Select, FormControl
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag'; // Icon cho Buy
import HomeRepairServiceIcon from '@mui/icons-material/HomeRepairService'; // Icon cho Rent
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

const CartPage = () => {
    // State giả lập cho giao diện
    const [buyItems, setBuyItems] = useState([
        { id: 1, name: "Road and Gravel Helmets", price: 97.00, qty: 1, img: "https://via.placeholder.com/100" },
        { id: 2, name: "Cycling Gloves 2.0", price: 50.00, qty: 1, img: "https://via.placeholder.com/100" }
    ]);

    const [rentItems, setRentItems] = useState([
        { id: 3, name: "Touring-1000 Blue, 46", price: 20, deposit: 2699.99, qty: 1, type: "Blue", img: "https://via.placeholder.com/100" }
    ]);

    return (
        <Box sx={{ bgcolor: '#f5efe6', minHeight: '100vh', py: 4 }}>
            <Container maxWidth="lg">
                <Grid container spacing={4}>

                    {/* CỘT TRÁI: DANH SÁCH SẢN PHẨM */}
                    <Grid item xs={12} md={8}>

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
                                    <Checkbox size="small" />
                                    <Typography variant="body2" fontWeight="500">Select all</Typography>
                                </Box>
                                {buyItems.map((item) => (
                                    <Box key={item.id} sx={{ p: 3, display: 'flex', gap: 3, borderBottom: '1px solid #eee' }}>
                                        <Checkbox size="small" sx={{ alignSelf: 'center' }} />
                                        <Box component="img" src={item.img} sx={{ width: 80, height: 80, objectFit: 'contain' }} />
                                        <Box sx={{ flexGrow: 1 }}>
                                            <Typography fontWeight="bold">{item.name}</Typography>
                                            <Typography variant="h6" color="#d32f2f" fontWeight="bold">${item.price.toFixed(2)}</Typography>

                                            {/* Quantity Controls */}
                                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, border: '1px solid #ddd', borderRadius: '20px', width: 'fit-content' }}>
                                                <IconButton size="small"><DeleteOutlineIcon fontSize="small" /></IconButton>
                                                <IconButton size="small"><RemoveIcon fontSize="small" /></IconButton>
                                                <Typography sx={{ mx: 1, fontWeight: 'bold' }}>{item.qty}</Typography>
                                                <IconButton size="small" sx={{ color: '#ff8120' }}><AddIcon fontSize="small" /></IconButton>
                                            </Box>
                                        </Box>
                                    </Box>
                                ))}
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
                                    <Checkbox size="small" />
                                    <Typography variant="body2" fontWeight="500">Select all</Typography>
                                </Box>
                                {rentItems.map((item) => (
                                    <Box key={item.id} sx={{ p: 3, display: 'flex', gap: 3 }}>
                                        <Checkbox size="small" sx={{ alignSelf: 'center' }} />
                                        <Box component="img" src={item.img} sx={{ width: 100, height: 100, objectFit: 'contain' }} />
                                        <Box sx={{ flexGrow: 1 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Typography fontWeight="bold">{item.name}</Typography>
                                                <Box sx={{ textAlign: 'right' }}>
                                                    <Typography variant="caption" fontWeight="bold" color="#ff8120">REFUNDABLE DEPOSIT</Typography>
                                                    <Typography fontWeight="bold" color="#d32f2f">${item.deposit.toLocaleString()}</Typography>
                                                </Box>
                                            </Box>

                                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 0.5 }}>
                                                <Typography variant="caption" sx={{ bgcolor: '#eee', px: 1, borderRadius: '4px' }}>Type: {item.type}</Typography>
                                            </Box>

                                            <Typography variant="body1" color="#d32f2f" fontWeight="bold" sx={{ mt: 1 }}>${item.price}/day</Typography>

                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mt: 2 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: '20px', width: 'fit-content' }}>
                                                    <IconButton size="small"><DeleteOutlineIcon fontSize="small" /></IconButton>
                                                    <IconButton size="small"><RemoveIcon fontSize="small" /></IconButton>
                                                    <Typography sx={{ mx: 1, fontWeight: 'bold' }}>{item.qty}</Typography>
                                                    <IconButton size="small" sx={{ color: '#2d5e89' }}><AddIcon fontSize="small" /></IconButton>
                                                </Box>

                                                <Box sx={{ border: '1px solid #ddd', borderRadius: '8px', p: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Typography variant="caption">12/25/2025</Typography>
                                                    <Typography variant="caption">→</Typography>
                                                    <Typography variant="caption">12/31/2025</Typography>
                                                    <CalendarTodayIcon sx={{ fontSize: 16, color: '#666' }} />
                                                </Box>
                                            </Box>
                                        </Box>
                                    </Box>
                                ))}
                            </Paper>
                        </Box>
                    </Grid>

                    {/* CỘT PHẢI: SUMMARY */}
                    <Grid item xs={12} md={4}>
                        <Box sx={{ position: 'sticky', top: 20 }}>
                            {/* Purchase Summary */}
                            <Paper sx={{ p: 3, borderRadius: '20px', mb: 3, bgcolor: '#fff6ed' }}>
                                <Typography variant="h6" fontWeight="bold" color="#ff8120" gutterBottom>Purchase Summary</Typography>
                                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="body2">Voucher</Typography>
                                    <Typography variant="body2" color="text.secondary">Select or enter code &gt;</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                                    <Typography variant="body2">Shipping</Typography>
                                    <Typography variant="body2" fontWeight="bold">$20</Typography>
                                </Box>
                                <Divider sx={{ mb: 2 }} />
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                    <Typography variant="body1">Total (2 items)</Typography>
                                    <Typography variant="h5" fontWeight="bold" color="#d32f2f">$167</Typography>
                                </Box>
                                <Button fullWidth variant="contained" sx={{ bgcolor: '#ff8120', py: 1.5, borderRadius: '12px', '&:hover': { bgcolor: '#e6731c' } }}>
                                    Order
                                </Button>
                            </Paper>

                            {/* Rental Summary */}
                            <Paper sx={{ p: 3, borderRadius: '20px', bgcolor: '#e8f0f6' }}>
                                <Typography variant="h6" fontWeight="bold" color="#2d5e89" gutterBottom>Rental Summary</Typography>
                                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="body2">Voucher</Typography>
                                    <Typography variant="body2" color="text.secondary">Select or enter code &gt;</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="body2">Shipping</Typography>
                                    <Typography variant="body2" fontWeight="bold">$20</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                                    <Typography variant="body2">Security Deposit</Typography>
                                    <Typography variant="body2" fontWeight="bold" color="#d32f2f">$2,699.99</Typography>
                                </Box>
                                <Divider sx={{ mb: 2 }} />
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                    <Typography variant="body1">Total (2 items)</Typography>
                                    <Typography variant="h5" fontWeight="bold" color="#d32f2f">$2,839.99</Typography>
                                </Box>
                                <Button fullWidth variant="contained" sx={{ bgcolor: '#2d5e89', py: 1.5, borderRadius: '12px' }}>
                                    Rent
                                </Button>
                            </Paper>
                        </Box>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default CartPage;