import React, { useState } from 'react';
import { Box, Grid, Paper, Typography, TextField, Button, Link, Alert, CircularProgress, Dialog, DialogContent } from '@mui/material';
import LockResetIcon from '@mui/icons-material/LockReset';
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
    const [openModal, setOpenModal] = useState(false);
    const [forgotStep, setForgotStep] = useState(1);
    const [forgotEmail, setForgotEmail] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await login({ email, password });
            // Lưu token vào localStorage hoặc context
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            
            // Kiểm tra Role để điều hướng
            const userRole = response.data.user.Role;
            if (userRole === 'Admin' || userRole === 'Order Staff' || userRole === 'Product Staff') {
                navigate('/admin/dashboard');
            } else {
                navigate('/');
            }
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
                            
                            {/* Demo Accounts Info */}
                            <Box sx={{ mt: 2, p: 2, bgcolor: '#FFF0E5', borderRadius: '12px', textAlign: 'left', maxWidth: '350px' }}>
                                <Typography variant="caption" fontWeight="bold" sx={{ color: '#FF8C00', display: 'block', mb: 1 }}>
                                    Demo Staff Accounts:
                                </Typography>
                                <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>
                                    <strong>Admin:</strong> admin@bikego.com / password
                                </Typography>
                                <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>
                                    <strong>Order Staff:</strong> staff@bikego.com / password
                                </Typography>
                                <Typography variant="caption" sx={{ display: 'block' }}>
                                    <strong>Product Staff:</strong> product@bikego.com / password
                                </Typography>
                            </Box>
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
                                <Link 
                                    onClick={() => setOpenModal(true)}
                                    sx={{ color: '#FF8C00', cursor: 'pointer', fontSize: '0.85rem', textDecoration: 'none', fontWeight: 'bold' }}
                                >
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

            {/* --- POPUP QUÊN MẬT KHẨU --- */}
            <Dialog 
                open={openModal} 
                onClose={() => setOpenModal(false)}
                PaperProps={{ sx: { borderRadius: '20px', padding: '20px', maxWidth: '450px' } }}
            >
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                        
                        {/* Bước 1: Nhập Email (Frame 1611) */}
                        {forgotStep === 1 && (
                            <>
                                <Box sx={{ bgcolor: '#FFF0E5', p: 2, borderRadius: '50%', mb: 2 }}>
                                    <LockResetIcon sx={{ fontSize: 50, color: '#FF8C00' }} />
                                </Box>
                                <Typography variant="h5" fontWeight="bold" gutterBottom>Forgot Password?</Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                    Don't worry, it happens. Enter your email and we'll send you a verification code.
                                </Typography>
                                <TextField
                                    fullWidth
                                    placeholder="Email"
                                    variant="outlined"
                                    sx={{ mb: 2 }}
                                    onChange={(e) => setForgotEmail(e.target.value)}
                                />
                                <Button 
                                    fullWidth 
                                    variant="contained" 
                                    onClick={() => setForgotStep(2)}
                                    sx={{ bgcolor: '#FF8C00', color: '#fff', borderRadius: '12px', py: 1.5, mb: 2, '&:hover': { bgcolor: '#e67e00' } }}
                                >
                                    Send OTP
                                </Button>
                            </>
                        )}

                        {/* Bước 2: Xác thực OTP (Frame 1610/1612) */}
                        {forgotStep === 2 && (
                            <>
                                <Box sx={{ bgcolor: '#FFF0E5', p: 2, borderRadius: '50%', mb: 2 }}>
                                    <LockResetIcon sx={{ fontSize: 50, color: '#FF8C00' }} />
                                </Box>
                                <Typography variant="h5" fontWeight="bold">Verify Identity</Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                    We send you a 4 digit code to <strong>{forgotEmail || 'user@email.com'}</strong>. Please enter it below
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                                    {[1, 2, 3, 4].map((i) => (
                                        <TextField 
                                            key={i}
                                            sx={{ width: '60px', '& input': { textAlign: 'center', fontSize: '1.5rem' } }} 
                                        />
                                    ))}
                                </Box>
                                <Typography variant="body2" sx={{ mb: 2 }}>
                                    Didn't receive the code? <Link sx={{ color: '#1976d2', cursor: 'pointer', fontWeight: 'bold' }}>Resend Code</Link> (00:24)
                                </Typography>
                                <Button 
                                    fullWidth 
                                    variant="contained" 
                                    onClick={() => setForgotStep(3)}
                                    sx={{ bgcolor: '#FF8C00', color: '#fff', borderRadius: '12px', py: 1.5, mb: 2 }}
                                >
                                    Verify →
                                </Button>
                            </>
                        )}

                        {/* Bước 3: Đặt lại mật khẩu (Frame 1613) */}
                        {forgotStep === 3 && (
                            <>
                                <Box sx={{ bgcolor: '#FFF0E5', p: 2, borderRadius: '50%', mb: 2 }}>
                                    <LockResetIcon sx={{ fontSize: 50, color: '#FF8C00' }} />
                                </Box>
                                <Typography variant="h5" fontWeight="bold">Reset your password</Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                    Please enter a new password for your BikeGo account.
                                </Typography>
                                <TextField fullWidth placeholder="Enter new password" type="password" sx={{ mb: 2 }} />
                                <TextField fullWidth placeholder="Re-enter new password" type="password" sx={{ mb: 3 }} />
                                <Button 
                                    fullWidth 
                                    variant="contained" 
                                    onClick={() => setForgotStep(4)}
                                    sx={{ bgcolor: '#FF8C00', color: '#fff', borderRadius: '12px', py: 1.5, mb: 2 }}
                                >
                                    Reset Password
                                </Button>
                            </>
                        )}

                        {/* Bước 4: Thành công (Frame 1614) */}
                        {forgotStep === 4 && (
                            <>
                                <Typography variant="h5" fontWeight="bold" sx={{ mt: 4, mb: 2 }}>
                                    Password changed successfully!
                                </Typography>
                                <Button 
                                    onClick={() => { setOpenModal(false); setForgotStep(1); }}
                                    sx={{ color: '#FF8C00', fontWeight: 'bold' }}
                                >
                                    ← Back to Login
                                </Button>
                            </>
                        )}

                        {/* Link quay lại chung cho các bước */}
                        {forgotStep !== 4 && (
                            <Link 
                                onClick={() => forgotStep === 1 ? setOpenModal(false) : setForgotStep(forgotStep - 1)}
                                sx={{ color: '#666', cursor: 'pointer', textDecoration: 'none', fontSize: '0.9rem' }}
                            >
                                {forgotStep === 1 ? '← Back to Login' : '← Wrong email? Go back'}
                            </Link>
                        )}
                    </Box>
                </DialogContent>
            </Dialog>
        </Box>
    );
};

export default LoginPage;
