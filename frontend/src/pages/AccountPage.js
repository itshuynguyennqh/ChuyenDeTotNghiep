import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container, Grid, Box, Typography, TextField, Button, List, ListItem,
    ListItemButton, ListItemIcon, ListItemText, Divider, Paper, IconButton, InputAdornment, Chip
} from '@mui/material';
import {
    Person as PersonIcon,
    Home as HomeIcon,
    Payment as PaymentIcon,
    Assignment as OrderIcon,
    Search as SearchIcon,
    PersonOutline as PersonOutlineIcon,
    ShoppingCartOutlined as CartIcon,
    Menu as MenuIcon,
    AddCircleOutline as AddIcon,
    ChevronRight as ChevronRightIcon
} from '@mui/icons-material';
import { fetchOrderHistoryAPI, updateAccountAPI } from '../api/productApi';

function AccountPage() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('Account Information');
    const [orders, setOrders] = useState([]);
    const [userInfo, setUserInfo] = useState({ email: 'kumo@bikego.com', phone: '0396660067' });

    // Menu sidebar dựa trên thiết kế Figma
    const menuItems = [
        { text: 'Account Information', icon: <PersonIcon /> },
        { text: 'Saved Address', icon: <HomeIcon /> },
        { text: 'Payment Setting', icon: <PaymentIcon /> },
        { text: 'My order', icon: <OrderIcon /> },
    ];

    useEffect(() => {
        const currentCustomerId = 1; // Giả định ID khách hàng
        fetchOrderHistoryAPI(currentCustomerId)
            .then(res => setOrders(res.data))
            .catch(err => console.error(err));
    }, []);

    // Render nội dung bên phải dựa trên tab đang chọn
    const renderContent = () => {
        switch (activeTab) {
            case 'Account Information':
                return (
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="h6" color="primary" sx={{ mb: 3 }}>Login information</Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                            <Box>
                                <Typography variant="subtitle1" fontWeight="bold">Phone number</Typography>
                                <Typography color="text.secondary">{userInfo.phone}</Typography>
                            </Box>
                            <Button sx={{ color: '#1976d2', textTransform: 'none' }}>Edit</Button>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Box>
                                <Typography variant="subtitle1" fontWeight="bold">Pass word</Typography>
                                <Typography color="text.secondary">***********************</Typography>
                            </Box>
                            <Button sx={{ color: '#1976d2', textTransform: 'none' }}>Edit</Button>
                        </Box>
                    </Box>
                );
            case 'Saved Address':
                return (
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="h6" color="primary" sx={{ mb: 2 }}>Saved Addresses</Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                            <Box>
                                <Typography fontWeight="bold">Thanh Trúc <span style={{ fontWeight: 'normal', color: '#666' }}>(+84) 865358650</span></Typography>
                                <Typography variant="body2" color="text.secondary">Số 2, ngõ 18 Định Công Thượng, phường Định Công, quận Hoàng Mai, Hà Nội</Typography>
                                <Chip label="Default" size="small" variant="outlined" color="error" sx={{ mt: 1, borderRadius: 1 }} />
                            </Box>
                            <Button sx={{ color: '#000', textTransform: 'none' }}>Edit</Button>
                        </Box>
                        <Button startIcon={<AddIcon />} sx={{ mt: 4, color: '#000', textTransform: 'none' }}>Add new address</Button>
                    </Box>
                );
            case 'Payment Setting':
                return (
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="h6" color="primary" sx={{ mb: 2 }}>Payment Settings</Typography>
                        <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>Card</Typography>
                        <Button fullWidth startIcon={<AddIcon />} sx={{ justifyContent: 'flex-start', backgroundColor: '#fcf6f0', color: '#000', mb: 2, py: 1.5 }}>Add new card</Button>

                        <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>E-wallet</Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="body2">🔵 PayPal</Typography>
                            <Button sx={{ color: '#000', textTransform: 'none' }}>Edit</Button>
                        </Box>
                        <Button fullWidth startIcon={<AddIcon />} sx={{ justifyContent: 'flex-start', backgroundColor: '#fcf6f0', color: '#000', py: 1.5 }}>Add e-wallet</Button>
                    </Box>
                );
            case 'My order':
                return (
                    <Box sx={{ mt: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6">My Order</Typography>
                            <Button endIcon={<ChevronRightIcon />} sx={{ color: '#000', border: '1px solid #ddd', borderRadius: 5, px: 2 }}>Completed</Button>
                        </Box>
                        {/* Mock Order Item */}
                        <Paper variant="outlined" sx={{ p: 2, mb: 2, backgroundColor: '#fcf6f0' }}>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <Box component="img" src="https://via.placeholder.com/80" sx={{ width: 80, height: 80, borderRadius: 1 }} />
                                <Box sx={{ flexGrow: 1 }}>
                                    <Typography variant="subtitle2" fontWeight="bold">Touring-1000 Blue, 46</Typography>
                                    <Typography variant="caption" display="block" color="text.secondary">Type: Blue</Typography>
                                    <Typography variant="caption" display="block" color="text.secondary">x1</Typography>
                                    <Typography variant="subtitle2" color="error" textAlign="right">$2,384.07</Typography>
                                </Box>
                                <IconButton size="small"><ChevronRightIcon /></IconButton>
                            </Box>
                            <Button fullWidth variant="contained" disabled sx={{ mt: 1, backgroundColor: '#ddd', color: '#777', textTransform: 'none' }}>Rate this product</Button>
                        </Paper>
                    </Box>
                );
            default:
                return null;
        }
    };

    return (
        <Box sx={{ backgroundColor: '#fcf6f0', minHeight: '100vh' }}>
            {/* Header giả lập theo thiết kế */}
            <Paper elevation={0} sx={{ borderBottom: '1px solid #eee', py: 1, backgroundColor: '#fcf6f0' }}>
                <Container maxWidth="xl">
                    <Grid container alignItems="center">
                        <Grid item xs={3} sx={{ display: 'flex', alignItems: 'center' }}>
                            <IconButton><MenuIcon /></IconButton>
                            <Typography variant="h4" sx={{ color: '#ff8c00', fontWeight: 'bold', ml: 1 }}>BikeGo</Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <TextField fullWidth size="small" placeholder="Search" InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>, sx: { borderRadius: '20px', backgroundColor: '#fff' } }} />
                        </Grid>
                        <Grid item xs={3} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                            <IconButton><PersonOutlineIcon /></IconButton>
                            <IconButton><CartIcon /></IconButton>
                        </Grid>
                    </Grid>
                </Container>
            </Paper>

            <Container maxWidth="xl" sx={{ py: 3 }}>
                <Typography variant="body2" sx={{ mb: 3 }}>Home  /  Account</Typography>

                <Box sx={{ mb: 4 }}>
                    <Typography variant="h5" fontWeight="bold" display="inline">Kumo's Account</Typography>
                    <Typography variant="h6" display="inline" sx={{ ml: 1, cursor: 'pointer', fontWeight: 'bold' }} onClick={() => navigate('/login')}>(Log out)</Typography>
                </Box>

                <Grid container spacing={4}>
                    {/* Cột trái: Sidebar Menu */}
                    <Grid item xs={12} md={3.5}>
                        <List component="nav">
                            {menuItems.map((item) => (
                                <ListItem disablePadding key={item.text} sx={{ mb: 1 }}>
                                    <ListItemButton
                                        selected={activeTab === item.text}
                                        onClick={() => setActiveTab(item.text)}
                                        sx={{
                                            borderRadius: 2,
                                            '&.Mui-selected': { backgroundColor: 'transparent', color: '#1976d2' },
                                            '&.Mui-selected .MuiListItemIcon-root': { color: '#1976d2' }
                                        }}
                                    >
                                        <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                                        <ListItemText primary={<Typography variant="h6" fontWeight={activeTab === item.text ? 'bold' : 'normal'}>{item.text}</Typography>} />
                                    </ListItemButton>
                                </ListItem>
                            ))}
                        </List>
                    </Grid>

                    {/* Cột phải: Content Area */}
                    <Grid item xs={12} md={8.5}>
                        <Divider sx={{ mb: 2, display: { xs: 'none', md: 'block' } }} />
                        {renderContent()}
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
}

export default AccountPage;