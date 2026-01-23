// AccountPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Grid, Box, Typography, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Paper, Divider } from '@mui/material';
import { Person as PersonIcon, Home as HomeIcon, Payment as PaymentIcon, Assignment as OrderIcon } from '@mui/icons-material';
import AccountInfo from '../components/account/AccountInfo';
import AddressList from '../components/account/AddressList';
import PaymentSettings from '../components/account/PaymentSettings';
import OrderHistory from '../components/account/OrderHistory';
import OrderDetail from '../components/account/OrderDetail';

const AccountPage = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('Account Information');
    const [selectedOrder, setSelectedOrder] = useState(null);
    
    // Get user info from localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userName = user.name || 'Account';
    
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Dispatch events to update cart count and login status in header
        window.dispatchEvent(new CustomEvent('cartUpdated'));
        window.dispatchEvent(new CustomEvent('userLoggedOut'));
        navigate('/');
    };
    
    const menuItems = [
        { text: 'Account Information', icon: <PersonIcon /> },
        { text: 'Saved Address', icon: <HomeIcon /> },
        { text: 'Payment Setting', icon: <PaymentIcon /> },
        { text: 'My order', icon: <OrderIcon /> },
    ];

    return (
        <Box sx={{ backgroundColor: '#F3E8DB', minHeight: '100vh', py: 4, display: 'flex', flexDirection: 'column' }}>
            <Container maxWidth="xl">
                <Typography variant="body2" sx={{ mb: 4, color: '#1976d2' }}>Home / Account</Typography>
                <Grid container spacing={3} display={"flex"} flexWrap={"nowrap"}>
                    {/* Sidebar */}
                    <Grid item xs={12} md={3}>
                        <Paper sx={{ borderRadius: '20px', overflow: 'hidden', p: 2 }}>
                            <Box sx={{ p: 2, mb: 2 }}>
                                <Typography fontWeight="bold">
                                    {userName}'s Account{' '}
                                    <Typography 
                                        component="span" 
                                        sx={{ 
                                            fontWeight: 'normal', 
                                            color: '#666', 
                                            cursor: 'pointer',
                                            '&:hover': {
                                                color: '#1976d2',
                                                textDecoration: 'underline'
                                            }
                                        }}
                                        onClick={handleLogout}
                                    >
                                        (Log out)
                                    </Typography>
                                </Typography>
                            </Box>
                            <Divider sx={{ mb: 1 }} />
                            <List>
                                {menuItems.map((item) => (
                                    <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
                                        <ListItemButton
                                            selected={activeTab === item.text}
                                            onClick={() => setActiveTab(item.text)}
                                            sx={{
                                                borderRadius: '12px',
                                                '&.Mui-selected': { bgcolor: 'transparent', color: '#ff8c00' },
                                                '&.Mui-selected .MuiListItemIcon-root': { color: '#ff8c00' }
                                            }}
                                        >
                                            <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                                            <ListItemText primary={<Typography fontWeight="bold" variant="body2">{item.text}</Typography>} />
                                        </ListItemButton>
                                    </ListItem>
                                ))}
                            </List>
                        </Paper>
                    </Grid>


                    {/* Content Area */}
                    <Grid item xs={12} md={9} flexGrow={"1"}>
                        <Box>
                            {activeTab === 'Account Information' && <AccountInfo />}
                            {activeTab === 'Saved Address' && <AddressList />}
                            {activeTab === 'Payment Setting' && <PaymentSettings />}
                            {activeTab === 'My order' && (
                                selectedOrder ? (
                                    <OrderDetail 
                                        order={selectedOrder} 
                                        onBack={() => setSelectedOrder(null)} 
                                    />
                                ) : (
                                    <OrderHistory onOrderSelect={setSelectedOrder} />
                                )
                            )}
                        </Box>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default AccountPage;
