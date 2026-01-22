import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    Box, Drawer, AppBar, Toolbar, List, Typography,
    ListItem, ListItemButton, ListItemIcon, ListItemText, 
    Button, IconButton, Menu, MenuItem, useMediaQuery, useTheme
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CategoryIcon from '@mui/icons-material/Category';
import GroupIcon from '@mui/icons-material/Group';
import ListAltIcon from '@mui/icons-material/ListAlt';
import GroupsIcon from '@mui/icons-material/Groups';
import TuneIcon from '@mui/icons-material/Tune';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import logo from '../../assets/BikeGo-logo-orange.png';
import whiteLogo from '../../assets/BikeGo-logo-whitebike.png';
import Footer from '../layout/Footer';

const drawerWidth = 240;

const AdminLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [anchorEl, setAnchorEl] = useState(null);

    const menuItems = [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin/dashboard' },
        { text: 'Product', icon: <InventoryIcon />, path: '/admin/products' },
        { text: 'Sales', icon: <AccessTimeIcon />, path: '/admin/promotions' },
        { text: 'Category', icon: <CategoryIcon />, path: '/admin/categories' },
        { text: 'Customer', icon: <GroupIcon />, path: '/admin/customers' },
        { text: 'Orders', icon: <ListAltIcon />, path: '/admin/orders' },
        { text: 'Staff', icon: <GroupsIcon />, path: '/admin/staff' },
        { text: 'Rental Config', icon: <TuneIcon />, path: '/admin/rental-config' },
        { text: 'Chatbot & FAQ', icon: <ChatBubbleOutlineIcon />, path: '/admin/chatbot-faq' },
    ];

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userEmail = user.email || user.EmailAddress || 'admin@bikego.com';
    const userRole = user.role || user.Role || 'Admin';

    // Check staff role (backend now returns: "product_staff", "order_staff", or "admin")
    const isProductStaff = React.useMemo(() => {
        const roleLower = (userRole || '').toLowerCase();
        return roleLower === 'product_staff';
    }, [userRole]);

    const isOrderStaff = React.useMemo(() => {
        const roleLower = (userRole || '').toLowerCase();
        return roleLower === 'order_staff';
    }, [userRole]);

    // Filter menu items based on user role
    // product_staff only sees Product menu
    // order_staff only sees Orders menu
    // Admin sees all menus
    const filteredMenuItems = React.useMemo(() => {
        
        if (isProductStaff) {
            // Product staff only sees Product menu
            return menuItems.filter(item => item.path === '/admin/products');
        }
        
        if (isOrderStaff) {
            // Order staff only sees Orders menu
            return menuItems.filter(item => item.path === '/admin/orders');
        }
        
        // Admin sees all menus
        return menuItems;
    }, [isProductStaff, isOrderStaff]);

    const isActive = (path) => {
        if (path === '/admin/dashboard') {
            return location.pathname === path;
        }
        return location.pathname.startsWith(path);
    };

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    // Redirect staff to appropriate page if they try to access unauthorized routes
    useEffect(() => {
        if (isProductStaff) {
            // Product staff can only access /admin/products and its sub-routes
            const allowedPaths = ['/admin/products'];
            const currentPath = location.pathname;
            
            // Check if current path is allowed
            const isAllowed = allowedPaths.some(path => currentPath === path || currentPath.startsWith(path + '/'));
            
            if (!isAllowed) {
                // Redirect to products page
                navigate('/admin/products', { replace: true });
            }
        } else if (isOrderStaff) {
            // Order staff can only access /admin/orders and its sub-routes
            const allowedPaths = ['/admin/orders'];
            const currentPath = location.pathname;
            
            // Check if current path is allowed
            const isAllowed = allowedPaths.some(path => currentPath === path || currentPath.startsWith(path + '/'));
            
            if (!isAllowed) {
                // Redirect to orders page
                navigate('/admin/orders', { replace: true });
            }
        }
    }, [location.pathname, isProductStaff, isOrderStaff, navigate]);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            {/* Header */}
            <AppBar 
                position="fixed" 
                sx={{ 
                    zIndex: (theme) => theme.zIndex.drawer + (isMobile ? 0 : 1), 
                    backgroundColor: 'white',
                    boxShadow: '0px 2px 4px rgba(0,0,0,0.1)'
                }}
            >
                <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 3 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box
                            component="img"
                            src={logo}
                            alt="BikeGo Logo"
                            sx={{ height: 40, width: 'auto' }}
                        />
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton onClick={handleMenuOpen} sx={{ p: 0.5 }}>
                            <PersonIcon sx={{ color: '#666' }} />
                        </IconButton>
                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={handleMenuClose}
                        >
                            <MenuItem disabled>
                                <Typography variant="body2" sx={{ color: '#666' }}>
                                    {userEmail}
                                </Typography>
                            </MenuItem>
                            <MenuItem onClick={handleLogout}>
                                <LogoutIcon sx={{ mr: 1, fontSize: '1rem' }} />
                                Log out
                            </MenuItem>
                        </Menu>
                    </Box>
                </Toolbar>
            </AppBar>

            <Box sx={{ display: 'flex', flex: 1 }}>
                {/* Sidebar */}
                <Drawer
                    variant={isMobile ? 'temporary' : 'permanent'}
                    sx={{
                        width: drawerWidth,
                        flexShrink: 0,
                        [`& .MuiDrawer-paper`]: { 
                            width: drawerWidth, 
                            boxSizing: 'border-box',
                            backgroundColor: '#F4E9DB',
                            borderRight: 'none'
                        },
                    }}
                >
                    <Toolbar sx={{ justifyContent: 'center', py: 2 }}>
                        <Box
                            component="img"
                            src={logo}
                            alt="BikeGo Logo"
                            sx={{ height: 35, width: 'auto' }}
                        />
                    </Toolbar>
                    <Box sx={{ overflow: 'auto', px: 1 }}>
                        <List>
                            {filteredMenuItems.map((item) => {
                                const active = isActive(item.path);
                                return (
                                    <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                                        <ListItemButton 
                                            selected={active}
                                            onClick={() => {
                                                navigate(item.path);
                                                if (isMobile) {
                                                    // Close drawer on mobile after navigation
                                                }
                                            }}
                                            sx={{
                                                borderRadius: 2,
                                                backgroundColor: active ? '#FE7E15' : 'transparent',
                                                color: active ? 'white' : '#333',
                                                '&:hover': {
                                                    backgroundColor: active ? '#FE7E15' : 'rgba(254, 126, 21, 0.1)',
                                                },
                                                '&.Mui-selected': {
                                                    backgroundColor: '#FE7E15',
                                                    color: 'white',
                                                    '&:hover': {
                                                        backgroundColor: '#FE7E15',
                                                    },
                                                },
                                                py: 1.5,
                                                px: 2
                                            }}
                                        >
                                            <ListItemIcon sx={{ color: active ? 'white' : '#666', minWidth: 40 }}>
                                                {item.icon}
                                            </ListItemIcon>
                                            <ListItemText 
                                                primary={item.text} 
                                                primaryTypographyProps={{
                                                    fontSize: '0.9rem',
                                                    fontWeight: active ? 600 : 400
                                                }}
                                            />
                                        </ListItemButton>
                                    </ListItem>
                                );
                            })}
                        </List>
                    </Box>
                </Drawer>

                {/* Main Content */}
                <Box 
                    component="main" 
                    sx={{ 
                        flexGrow: 1, 
                        p: { xs: 2, md: 3 }, 
                        backgroundColor: '#F4E9DB', 
                        minHeight: '100vh',
                        display: 'flex',
                        flexDirection: 'column',
                        width: { xs: '100%', md: `calc(100% - ${drawerWidth}px)` }
                    }}
                >
                    <Toolbar />
                    <Box sx={{ flex: 1, backgroundColor: 'white', borderRadius: 2, p: 3 }}>
                        <Outlet />
                    </Box>
                    <Footer />
                </Box>
            </Box>
        </Box>
    );
};

export default AdminLayout;