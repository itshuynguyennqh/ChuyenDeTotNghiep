import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import Header from './Header';
import Footer from './Footer';

function Layout() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' , backgroundColor: 'F4E9DB'}}>
      <Header />
      
      {/* Đây là nơi nội dung của các trang con sẽ được render */}
      <Box component="main" sx={{ flexGrow: 1, py: 3, px: { xs: 2, md: 4 }, mx: 'auto', width: '100%', backgroundColor: "#F4E9DB" }}>
        <Outlet />
      </Box>

      <Footer />
    </Box>
  );
}

export default Layout;
