import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Box, InputBase, IconButton, Badge } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu'; // Import Icon 3 gạch
import { getCart } from '../../api/storeApi';

// Import component Drawer danh mục (Đảm bảo đường dẫn đúng với nơi bạn lưu file)
import CategoryDrawer from '../common/CategoryDrawer';

// Import các file ảnh
import shoppingCartIcon from '../../assets/ShoppingCart-icon.png';
import searchIcon from '../../assets/Search-icon.png';
import userIcon from '../../assets/User-icon.png';
import logo from '../../assets/BikeGo-logo-orange.png';

function Header() {
    const navigate = useNavigate();
    const [cartItemCount, setCartItemCount] = useState(0);
    const [openDrawer, setOpenDrawer] = useState(false); // State quản lý đóng mở Drawer
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));

    // Hàm toggle Drawer
    const toggleDrawer = (newOpen) => () => {
        setOpenDrawer(newOpen);
    };

    const updateCartCount = async () => {
        // Check login status directly from localStorage
        const loggedIn = !!localStorage.getItem('token');
        if (!loggedIn) {
            setCartItemCount(0);
            return;
        }
        try {
            const response = await getCart();
            const data = response.data?.data || response.data;
            
            // Count unique items (not total quantity)
            // If items array exists, count the number of distinct items
            const count = Array.isArray(data?.items) 
                ? data.items.length  // Number of unique items
                : 0;
            
            setCartItemCount(count);
        } catch (error) {
            console.error('Failed to fetch cart:', error);
            setCartItemCount(0);
        }
    };

    useEffect(() => {
        updateCartCount();
        
        const handleCartUpdate = () => {
            updateCartCount();
        };
        
        const handleLoginStatusChange = () => {
            setIsLoggedIn(!!localStorage.getItem('token'));
            updateCartCount(); // Also update cart when login status changes
        };
        
        window.addEventListener('cartUpdated', handleCartUpdate);
        window.addEventListener('userLoggedOut', handleLoginStatusChange);
        window.addEventListener('userLoggedIn', handleLoginStatusChange);
        
        return () => {
            window.removeEventListener('cartUpdated', handleCartUpdate);
            window.removeEventListener('userLoggedOut', handleLoginStatusChange);
            window.removeEventListener('userLoggedIn', handleLoginStatusChange);
        };
    }, []);

    return (
        <>
            <AppBar
                position="static"
                sx={{
                    backgroundColor: '#F4E9DB',
                    boxShadow: '0px 2px 4px rgba(0,0,0,0.2)'
                }}
            >
                <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', paddingY: 1 }}>

                    {/* --- LEFT SECTION: MENU ICON + LOGO --- */}
                    {/* Nhóm lại để đảm bảo tính năng justify-between hoạt động đúng */}
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>

                        {/* Nút Menu (Hamburger) */}
                        <IconButton
                            size="large"
                            edge="start"
                            aria-label="menu"
                            onClick={toggleDrawer(true)} // Mở Drawer khi click
                            sx={{ mr: 1, color: '#e65100' }} // Màu cam theo tông Logo (hoặc đổi thành #333 tùy ý)
                        >
                            <MenuIcon fontSize="inherit" style={{ fontSize: 32 }} />
                        </IconButton>

                        {/* Logo */}
                        <Box
                            component={RouterLink}
                            to="/"
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                textDecoration: 'none',
                            }}
                        >
                            <Box
                                component="img"
                                src={logo}
                                alt="BikeGo Logo"
                                sx={{
                                    height: 40,
                                    width: 'auto',
                                    marginRight: 1,
                                }}
                            />
                        </Box>
                    </Box>

                    {/* --- CENTER SECTION: SEARCH BAR --- */}
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            backgroundColor: '#ffffff',
                            borderRadius: '25px',
                            padding: '4px 20px',
                            width: '40%',
                            maxWidth: '500px',
                            boxShadow: 'inset 0px 1px 3px rgba(0,0,0,0.1)'
                        }}
                    >
                        <Box
                            component="img"
                            src={searchIcon}
                            alt="Search"
                            sx={{
                                width: 24,
                                height: 24,
                                marginRight: 1,
                            }}
                        />
                        <InputBase
                            placeholder="Search"
                            sx={{ width: '100%', color: '#333' }}
                        />
                    </Box>

                    {/* --- RIGHT SECTION: ICONS --- */}
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton 
                            color="inherit" 
                            onClick={(e) => {
                                // Check login status dynamically at click time
                                const loggedIn = !!localStorage.getItem('token');
                                if (loggedIn) {
                                    navigate('/account');
                                } else {
                                    navigate('/login');
                                }
                            }}
                        >
                            <Box
                                component="img"
                                src={userIcon}
                                alt="User"
                                sx={{ width: 30, height: 30 }}
                            />
                        </IconButton>

                        <IconButton color="inherit" component={RouterLink} to="/cart">
                            <Badge badgeContent={cartItemCount} color="primary">
                                <Box
                                    component="img"
                                    src={shoppingCartIcon}
                                    alt="Cart"
                                    sx={{ width: 30, height: 30 }}
                                />
                            </Badge>
                        </IconButton>
                    </Box>
                </Toolbar>
            </AppBar>

            {/* --- RENDER DRAWER Ở ĐÂY --- */}
            <CategoryDrawer
                open={openDrawer}
                onClose={toggleDrawer(false)}
                onCategorySelect={(category) => {
                    if (category) {
                        navigate(`/?category_id=${category.id}`);
                    } else {
                        navigate('/');
                    }
                    setOpenDrawer(false);
                }}
            />
        </>
    );
}

export default Header;