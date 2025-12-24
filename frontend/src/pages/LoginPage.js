import React, { useState } from 'react';
import { Box, Grid, Paper, Typography, TextField, Button, Link, Alert, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import logo from "../assets/BikeGo-logo-white.png";
import logo2 from "../assets/BikeGo-logo-orange.png";
import { Link as RouterLink } from "react-router-dom";
import { login } from '../api/authApi';

const LoginPage = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const data = await login(email, password);
            // Lưu token vào localStorage hoặc context
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            navigate('/');
        } catch (err) {
            setError(err.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f5efe6', p: 2 }}>
            <Paper elevation={3} sx={{ width: '100%', minHeight: '900px', maxWidth: '1800px', borderRadius: '30px', overflow: 'hidden', display: 'flex' }}>
                <Grid container flexGrow={1}>
                    {/* CỘT TRÁI: FORM */}
                    <Grid flexGrow={1} item xs={12} md={6} sx={{ maxWidth: 'auto', p: { xs: 4, md: 8 }, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', bgcolor: '#fff' }}>
                        <Box sx={{ textAlign: 'center', mb: 4 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                                <Box
                                    component={RouterLink}
                                    to="/"
                                    sx={{
                                        textDecoration: 'none',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <Box
                                        component="img"
                                        src={logo2}
                                        alt="BikeGo Logo"
                                        sx={{
                                            height: 40,
                                            width: 'auto',
                                        }}
                                    />
                                </Box>
                            </Box>
                            <Typography variant="h3" fontWeight="bold" sx={{ color: '#002147', mt: 2 }}>Log in</Typography>
                            <Typography variant="body1" color="text.secondary">Please enter your account</Typography>
                        </Box>

                        <Box component="form" onSubmit={handleLogin} sx={{ width: '100%', maxWidth: '350px' }}>
                            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                            
                            <TextField
                                fullWidth
                                placeholder="Email Address"
                                variant="filled"
                                margin="normal"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                InputProps={{ disableUnderline: true, sx: { borderRadius: '12px', bgcolor: '#e8e8e8' } }}
                            />
                            <TextField
                                fullWidth
                                placeholder="Password"
                                type="password"
                                variant="filled"
                                margin="normal"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                InputProps={{ disableUnderline: true, sx: { borderRadius: '12px', bgcolor: '#e8e8e8' } }}
                            />

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1, mb: 3 }}>
                                <Link component={RouterLink} to="/signup" sx={{ color: '#FF8C00', cursor: 'pointer', fontSize: '0.85rem', textDecoration: 'none', fontWeight: 'bold' }}>
                                    New here? Sign up!
                                </Link>
                                <Link sx={{ color: '#FF8C00', cursor: 'pointer', fontSize: '0.85rem', textDecoration: 'none', fontWeight: 'bold' }}>
                                    Forgot password?
                                </Link>
                            </Box>

                            <Button 
                                fullWidth 
                                type="submit"
                                variant="contained" 
                                disabled={loading}
                                sx={{ bgcolor: '#FF8C00', color: '#fff', py: 1.5, borderRadius: '12px', fontSize: '1.1rem', fontWeight: 'bold', '&:hover': { bgcolor: '#e67e00' }, textTransform: 'none' }}
                            >
                                {loading ? <CircularProgress size={24} color="inherit" /> : 'Log in'}
                            </Button>
                        </Box>
                    </Grid>

                    {/* CỘT PHẢI: WELCOME (Màu cam) */}
                    <Grid flexGrow={1} item xs={12} md={6} sx={{ bgcolor: '#FF8C00', p: 6, display: 'flex', flexDirection: 'column', justifyContent: 'center', color: '#fff' }}>
                        <Box
                            component={RouterLink}
                            to="/"
                            sx={{
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
                        <Typography variant="h2" fontWeight="bold" lineHeight={1.2}>
                            Welcome back <br /> to BikeGo
                        </Typography>
                        <Typography variant="h6" sx={{ mt: 2, opacity: 0.9, fontWeight: 'normal' }}>
                            Find your perfect ride <br /> anytime, anywhere.
                        </Typography>
                    </Grid>
                </Grid>
            </Paper>
        </Box>
    );
};

export default LoginPage;
