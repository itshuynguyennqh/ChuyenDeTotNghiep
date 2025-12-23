import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container, Grid, Box, Typography, TextField, List, ListItem,
    ListItemButton, ListItemIcon, ListItemText, Divider, Paper, IconButton, InputAdornment
} from '@mui/material';
import {
    Person as PersonIcon,
    Home as HomeIcon,
    Payment as PaymentIcon,
    Assignment as OrderIcon,
    Search as SearchIcon,
    PersonOutline as PersonOutlineIcon,
    ShoppingCartOutlined as CartIcon,
    Menu as MenuIcon
} from '@mui/icons-material';
import { fetchOrderHistoryAPI, updateAccountAPI } from '../api/productApi';
import AccountInfo from '../components/account/AccountInfo';
import AddressList from '../components/account/AddressList';
import PaymentSettings from '../components/account/PaymentSettings';
import OrderHistory from '../components/account/OrderHistory';

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
                return <AccountInfo userInfo={userInfo} />;
            case 'Saved Address':
                return <AddressList />;
            case 'Payment Setting':
                return <PaymentSettings />;
            case 'My order':
                return <OrderHistory orders={orders} />;
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