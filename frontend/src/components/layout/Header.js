import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Box, InputBase, IconButton, Badge } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { fetchCartAPI } from '../../api/productApi';

// Import các file ảnh
import shoppingCartIcon from '../../assets/ShoppingCart-icon.png';
import searchIcon from '../../assets/Search-icon.png';
import userIcon from '../../assets/User-icon.png';
import logo from '../../assets/BikeGo-logo-white.png';

function Header() {
  const [cartItemCount, setCartItemCount] = useState(0);
  // Check for 'token' instead of 'access_token' to match LoginPage.js
  const isLoggedIn = !!localStorage.getItem('token');

  const updateCartCount = async () => {
    if (isLoggedIn) {
      try {
        const response = await fetchCartAPI();
        // Đếm tổng số lượng sản phẩm trong giỏ hàng
        const count = response.data.items.reduce((total, item) => total + item.quantity, 0);
        setCartItemCount(count);
      } catch (error) {
        console.error("Failed to fetch cart:", error);
        setCartItemCount(0);
      }
    }
  };

  useEffect(() => {
    updateCartCount();

    // Lắng nghe sự kiện 'cartUpdated'
    window.addEventListener('cartUpdated', updateCartCount);

    // Dọn dẹp listener khi component unmount
    return () => {
      window.removeEventListener('cartUpdated', updateCartCount);
    };
  }, [isLoggedIn]);

  return (
    <AppBar
      position="static"
      sx={{
        backgroundColor: '#F8862C',
        boxShadow: '0px 2px 4px rgba(0,0,0,0.2)'
      }}
    >
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', paddingY: 1 }}>
        {/* --- LOGO SECTION --- */}
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

        {/* --- SEARCH BAR SECTION --- */}
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

        {/* --- ICONS SECTION (Right Side) --- */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton color="inherit" component={RouterLink} to={isLoggedIn ? "/account" : "/login"}>
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
  );
}

export default Header;
