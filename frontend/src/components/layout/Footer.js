import React from 'react';
import { Box, Typography, Container } from '@mui/material';

function Footer() {
  return (
    <Box 
      component="footer" 
      sx={{ 
        py: 3, 
        px: 2, 
        mt: 'auto', // Đẩy footer xuống cuối
        backgroundColor: '#002B5B', // Cập nhật màu nền thành xanh biển
        color: 'white', // Đổi màu chữ thành trắng để dễ đọc
      }}
    >
      <Container maxWidth="lg">

        <Typography variant="body1" align="center">
          My E-Commerce Store
        </Typography>

        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }} align="center">
          {'Copyright © '}
          {new Date().getFullYear()}
          {'.'}
        </Typography>

      </Container>



    </Box>
  );
}

export default Footer;
