import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container, Grid, Box, Typography, List, ListItem,
    ListItemButton, ListItemIcon, ListItemText, Divider, Paper, Button,
    CircularProgress, Alert
} from '@mui/material';
import {
    Person as PersonIcon,
    Home as HomeIcon,
    Payment as PaymentIcon,
    Assignment as OrderIcon,
} from '@mui/icons-material';
import { getAccountDetails } from '../api/authApi';
import { fetchOrderHistoryAPI } from '../api/orderApi';
import AccountInfo from '../components/account/AccountInfo';
import AddressList from '../components/account/AddressList';
import PaymentSettings from '../components/account/PaymentSettings';
import OrderHistory from '../components/account/OrderHistory';

function AccountPage() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('Account Information');
    const [orders, setOrders] = useState([]);
    const [account, setAccount] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const menuItems = [
        { text: 'Account Information', icon: <PersonIcon /> },
        { text: 'Saved Address', icon: <HomeIcon /> },
        { text: 'Payment Setting', icon: <PaymentIcon /> },
        { text: 'My order', icon: <OrderIcon /> },
    ];

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || !user.CustomerID) {
            navigate('/login');
            return;
        }

        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await getAccountDetails(user.CustomerID);
                setAccount(response.data);

                const orderHistory = await fetchOrderHistoryAPI(user.CustomerID);
                setOrders(orderHistory.data);
            } catch (err) {
                setError('Failed to fetch account data. Please try again later.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };

    const renderContent = () => {
        if (loading) {
            return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
        }
        if (error) {
            return <Alert severity="error">{error}</Alert>;
        }
        if (!account) {
            return <Typography>No account information found.</Typography>;
        }

        switch (activeTab) {
            case 'Account Information':
                return <AccountInfo userInfo={account} />;
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
            <Container maxWidth="xl" sx={{ py: 3 }}>
                <Typography variant="body2" sx={{ mb: 3 }}>Home / Account</Typography>

                <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
                    <Typography variant="h5" fontWeight="bold">
                        {account ? `${account.FirstName}'s Account` : 'My Account'}
                    </Typography>
                    <Button variant="text" onClick={handleLogout} sx={{ ml: 2, color: '#ff8c00', fontWeight: 'bold' }}>
                        (Log out)
                    </Button>
                </Box>

                <Grid container spacing={4}>
                    <Grid item xs={12} md={3.5}>
                        <Paper elevation={1} sx={{ borderRadius: 2 }}>
                            <List component="nav">
                                {menuItems.map((item) => (
                                    <ListItem disablePadding key={item.text}>
                                        <ListItemButton
                                            selected={activeTab === item.text}
                                            onClick={() => setActiveTab(item.text)}
                                            sx={{
                                                borderRadius: 2,
                                                '&.Mui-selected': { backgroundColor: '#ff8c00', color: 'white', '&:hover': { backgroundColor: '#e67e00' } },
                                                '&.Mui-selected .MuiListItemIcon-root': { color: 'white' }
                                            }}
                                        >
                                            <ListItemIcon>{item.icon}</ListItemIcon>
                                            <ListItemText primary={<Typography variant="body1" fontWeight={activeTab === item.text ? 'bold' : 'normal'}>{item.text}</Typography>} />
                                        </ListItemButton>
                                    </ListItem>
                                ))}
                            </List>
                        </Paper>
                    </Grid>

                    <Grid item xs={12} md={8.5}>
                        <Paper elevation={1} sx={{ p: 4, borderRadius: 2 }}>
                            {renderContent()}
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
}

export default AccountPage;
