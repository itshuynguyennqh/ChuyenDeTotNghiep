import React from 'react';
import { Container, Typography, Button, Box, Paper } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Link as RouterLink } from 'react-router-dom';

function OrderSuccessPage() {
    return (
        <Container maxWidth="sm" sx={{ mt: 8, mb: 4 }}>
            <Paper elevation={3} sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
                <CheckCircleIcon sx={{ fontSize: 80, color: '#4caf50', mb: 2 }} />
                
                <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
                    Thanh toán thành công!
                </Typography>
                
                <Typography variant="body1" color="text.secondary" paragraph>
                    Cảm ơn bạn đã mua hàng tại BikeGo. Đơn hàng của bạn đang được xử lý và sẽ sớm được giao đến bạn.
                </Typography>

                <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Button 
                        variant="contained" 
                        component={RouterLink} 
                        to="/"
                        size="large"
                        sx={{ backgroundColor: '#FF8D28' }}
                    >
                        Tiếp tục mua sắm
                    </Button>
                    
                    <Button 
                        variant="outlined" 
                        component={RouterLink} 
                        to="/account" // Hoặc trang lịch sử đơn hàng nếu có
                    >
                        Xem lịch sử đơn hàng
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
}

export default OrderSuccessPage;