import React from 'react';
import {Box, Container, Typography} from '@mui/material';
import logo from '../../assets/BikeGo-logo-whitebike.png';


function Footer() {
    return (
        <Box
            component="footer"
            sx={{
                py: 1,
                px: 1,
                mt: 'auto', // Đẩy footer xuống cuối
                backgroundColor: '#002B5B', // Cập nhật màu nền thành xanh biển
                color: 'white', // Đổi màu chữ thành trắng để dễ đọc
            }}
        >
            <Container
                maxWidth="lg"
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}
            >
                <Box
                    component="img"
                    src={logo}
                    alt="BikeGo Logo"
                    sx={{
                        height: 40,
                        width: 'auto'
                    }}
                />

                <Box>
                    <Typography variant="body2" sx={{color: '#FE7E15', fontWeight: 'bold', fontSize: '1rem'}}>
                        Contact
                    </Typography>
                    <Typography variant="body2" sx={{color: 'rgba(255, 255, 255, 0.7)', paddingLeft: '2rem'}}>
                        +84 912 345 678
                    </Typography>
                    <Typography variant="body2" sx={{color: 'rgba(255, 255, 255, 0.7)', paddingLeft: '2rem'}}>
                        support@bikego.com
                    </Typography>
                </Box>


            </Container>
        </Box>
    );
}

export default Footer;
