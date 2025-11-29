import React from 'react';
import { AppBar, Toolbar, Box, InputBase, IconButton, Badge } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

// Import các file ảnh (Đây là đường dẫn string, không phải Component)
import shoppingCartIcon from '../../assets/ShoppingCart-icon.png';
import searchIcon from '../../assets/Search-icon.png';
import userIcon from '../../assets/User-icon.png';
import logo from '../../assets/BikeGo-logo-orange.png';

function Header() {
  return (
    <AppBar
      position="static"
      sx={{
        backgroundColor: '#F4E9DB',
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
          {/* SỬA: Dùng thẻ img thay vì component */}
          <Box
            component="img"
            src={searchIcon}
            alt="Search"
            sx={{
              width: 24,
              height: 24,
              marginRight: 1,
              // Lưu ý: sx={{ color }} không tác dụng với PNG.
              // Nếu icon chưa có màu cam, bạn cần sửa file ảnh gốc hoặc dùng filter CSS.
            }}
          />
          <InputBase
            placeholder="Search"
            sx={{ width: '100%', color: '#333' }}
          />
        </Box>

        {/* --- ICONS SECTION (Right Side) --- */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton color="inherit" component={RouterLink} to="/login">
            {/* SỬA: Dùng thẻ img cho icon User */}
                <Box
                    component="img"
                    src={userIcon}
                    alt="User"
                    sx={{ width: 30, height: 30 }}
                />
            </IconButton>



          <IconButton color="inherit" component={RouterLink} to="/cart">
            <Badge badgeContent={2} color="primary">
               {/* SỬA: Dùng thẻ img cho icon Cart */}
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