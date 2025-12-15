import React, { useState } from 'react';
import {
    Box,
    Grid,
    Typography,
    TextField,
    Button,
    Link as MuiLink,
    Container
} from '@mui/material';
import {Link as RouterLink} from "react-router-dom";
import logo from "../assets/BikeGo-logo-orange.png";
import bike from "../assets/LogoBike.png";


// Component Icon Logo
const BikeLogoOrange = () => (
    <Box
        component={RouterLink}
        to="/"
        sx={{
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
            justifyContent: 'center',
        }}
    >
        <Box
            component="img"
            src={logo}
            alt="BikeGo Logo"
            sx={{
                height: 40,
                width: 'auto',
            }}
        />

    </Box>
);


function SignUp() {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        repeatPassword: '',
        email: '',
        firstname: '',
        lastname: '',
    });

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        if (formData.password !== formData.repeatPassword) {
            alert("Passwords do not match!");
            return;
        }
        // Xử lý logic đăng ký ở đây
        console.log('Form Data:', formData);
        alert(`Đăng ký với username: ${formData.username}`);
    };

    return (
        // Container chính bọc toàn bộ trang với màu nền nhẹ
        <Container
            maxWidth={false}
            disableGutters
            sx={{
                minHeight: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#F4E9DB', // Màu nền trang nhạt
                p: 0,
            }}
        >
            <Box
                sx={{
                    width: '80%',
                    maxWidth: '1200px',
                    borderRadius: 4,
                    overflow: 'hidden',
                    boxShadow: 3,
                    height: '70vh', // Chiều cao cố định
                    minHeight: '600px',
                    display: 'flex',
                    justifyContent: 'space-between',

                }}>

                {/* --- PHẦN 1: BÊN TRÁI (Màu Cam) --- */}
                <Grid item xs={12} md={5}
                      sx={{
                          backgroundColor: '#FF8C00', // Màu cam nổi bật
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          alignItems: 'flex-start',
                          color: 'white',
                          p: 6,
                          flexGrow: 1
                      }}
                >
                    <Box
                        component="img"
                        src={bike}
                        alt="BikeGo Logo"
                        sx={{
                            height: 40,
                            width: 'auto',
                            marginRight: 1,
                        }}
                    />
                    <Typography variant="h3" fontWeight="bold" color="#002B5B" sx={{ mb: 1 }} >
                        Welcome to
                    </Typography>
                    <Typography variant="h3" fontWeight="bold" color="#002B5B" sx={{ mb: 1 }}>
                        BikeGo
                    </Typography>
                    <Typography variant="h6" color="#002B5B">
                        Find your perfect ride
                    </Typography>
                    <Typography variant="h6" color="#002B5B">
                        anytime, anywhere.
                    </Typography>
                </Grid>


                {/* --- PHẦN 2: BÊN PHẢI (Form Đăng Ký) --- */}
                <Grid item xs={12} md={7}
                      component={Box}
                      sx={{
                          backgroundColor: 'white',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          p: 4,
                          flexGrow: 1
                      }}
                >
                    <Box
                        component="form"
                        onSubmit={handleSubmit}
                        sx={{
                            width: '100%',
                            maxWidth: 380, // Giới hạn chiều rộng form
                            textAlign: 'center'
                        }}
                    >
                        {/* Logo BikeGo */}
                        <BikeLogoOrange />

                        {/* Tiêu đề Form */}
                        <Typography variant="h3" fontWeight="bold" color="#002B5B" sx={{ my: 3 }}>
                            Sign Up
                        </Typography>
                        <Typography variant="subtitle1" color="#002B5B" sx={{ mb: 3 }}>
                            Please enter your information
                        </Typography>

                        {/* Input Username */}
                        <TextField
                            fullWidth
                            variant="filled"
                            label="Username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            sx={{ mb: 2, borderRadius: 1, '& .MuiFilledInput-root': { backgroundColor: '#e9e9e9', borderRadius: 1, '&:hover': { backgroundColor: '#ddd' } }, '& label': { top: -8 } }}
                            InputProps={{ disableUnderline: true }}
                            InputLabelProps={{ shrink: true }}
                            required
                        />
                        {/* Input First Name and Last Name*/}
                        <Grid container={12} spacing={2}
                              sx={{
                                  flexDirection: 'row',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  flexWrap: 'nowrap',

                              }}>
                            <Grid item xs={6}>
                                <TextField
                                    fullWidth
                                    variant="filled"
                                    label="First Name"
                                    name="firstname"
                                    value={formData.firstname}
                                    onChange={handleChange}
                                    sx={{ mb: 2, borderRadius: 1, '& .MuiFilledInput-root': { backgroundColor: '#e9e9e9', borderRadius: 1, '&:hover': { backgroundColor: '#ddd' } }, '& label': { top: -8 } }}
                                    InputProps={{ disableUnderline: true }}
                                    InputLabelProps={{ shrink: true }}
                                    required
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    fullWidth
                                    variant="filled"
                                    label="Last Name"
                                    name="lastname"
                                    value={formData.lastname}
                                    onChange={handleChange}
                                    sx={{ mb: 2, borderRadius: 1, '& .MuiFilledInput-root': { backgroundColor: '#e9e9e9', borderRadius: 1, '&:hover': { backgroundColor: '#ddd' } }, '& label': { top: -8 } }}
                                    InputProps={{ disableUnderline: true }}
                                    InputLabelProps={{ shrink: true }}
                                    required
                                />
                            </Grid>
                        </Grid>

                        {/* Input Email */}
                        <TextField
                            fullWidth
                            variant="filled"
                            label="Email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            sx={{ mb: 2, borderRadius: 1, '& .MuiFilledInput-root': { backgroundColor: '#e9e9e9', borderRadius: 1, '&:hover': { backgroundColor: '#ddd' } }, '& label': { top: -8 } }}
                            InputProps={{ disableUnderline: true }}
                            InputLabelProps={{ shrink: true }}
                            required
                        />

                        {/* Input Mật khẩu */}
                        <TextField
                            fullWidth
                            variant="filled"
                            label="Password"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            sx={{ mb: 2, borderRadius: 1, '& .MuiFilledInput-root': { backgroundColor: '#e9e9e9', borderRadius: 1, '&:hover': { backgroundColor: '#ddd' } }, '& label': { top: -8 } }}
                            InputProps={{ disableUnderline: true }}
                            InputLabelProps={{ shrink: true }}
                            required
                        />

                        {/* Input Repeat Password */}
                        <TextField
                            fullWidth
                            variant="filled"
                            label="Repeat Password"
                            name="repeatPassword"
                            type="password"
                            value={formData.repeatPassword}
                            onChange={handleChange}
                            sx={{ mb: 1, borderRadius: 1, '& .MuiFilledInput-root': { backgroundColor: '#e9e9e9', borderRadius: 1, '&:hover': { backgroundColor: '#ddd' } }, '& label': { top: -8 } }}
                            InputProps={{ disableUnderline: true }}
                            InputLabelProps={{ shrink: true }}
                            required
                        />

                        {/* Đã có tài khoản? */}
                        <Typography variant="body2" sx={{ mb: 3, textAlign: 'right' }}>
                            Already have an account?
                            <MuiLink component={RouterLink} to="/login" sx={{ ml: 0.5, color: '#ff8c00', textDecoration: 'none', fontWeight: 'bold' }}>
                                Sign in!
                            </MuiLink>
                        </Typography>

                        {/* Nút Sign Up */}
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            size="large"
                            sx={{
                                py: 1.5,
                                backgroundColor: '#FF8C00', // Màu cam
                                '&:hover': { backgroundColor: '#e67300' },
                                fontWeight: 'bold',
                                borderRadius: 1
                            }}
                        >
                            Sign up
                        </Button>

                    </Box>
                </Grid>
            </Box>

        </Container>
    );
}

export default SignUp;