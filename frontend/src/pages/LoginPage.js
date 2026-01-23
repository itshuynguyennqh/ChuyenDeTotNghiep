import React, { useState, useEffect, useRef } from 'react';
import { Box, Grid, Paper, Typography, TextField, Button, Link, Alert, CircularProgress, Dialog, DialogContent } from '@mui/material';
import LockResetIcon from '@mui/icons-material/LockReset';
import { useNavigate } from 'react-router-dom';
import logo from "../assets/BikeGo-logo-white.png";
import logo2 from "../assets/BikeGo-logo-orange.png";
import { Link as RouterLink } from "react-router-dom";
import { login, forgotPassword, resetPassword } from '../api/authApi';

const LoginPage = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [forgotStep, setForgotStep] = useState(1);
    const [forgotEmail, setForgotEmail] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [otpError, setOtpError] = useState('');
    const [otpLoading, setOtpLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);
    const [resendLoading, setResendLoading] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [resetLoading, setResetLoading] = useState(false);
    const otpInputRefs = useRef([]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Backend yêu cầu payload: {identifier, password}
            // identifier có thể là email hoặc số điện thoại
            const response = await login({ identifier: email, password });

            // Backend trả về: {access_token, token_type, role, name, id}
            localStorage.setItem('token', response.data.access_token);
            localStorage.setItem('user', JSON.stringify({
                id: response.data.id,
                name: response.data.name,
                role: response.data.role,
                token_type: response.data.token_type,
            }));

            // Kiểm tra role để điều hướng
            // Backend returns: "customer", "product_staff", "order_staff", or "admin"
            const userRole = response.data.role;
            if (userRole !== 'customer') {
                if (userRole === 'product_staff') {
                    navigate('/admin/products');
                } else if (userRole === 'order_staff') {
                    navigate('/admin/orders');
                } else {
                    // Admin or other roles go to dashboard
                    navigate('/admin/dashboard');
                }
            } else {
                navigate('/');
            }
        } catch (err) {
            setError(err.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    // Timer for resend OTP
    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setTimeout(() => {
                setResendTimer(resendTimer - 1);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [resendTimer]);

    // Handle OTP input change
    const handleOtpChange = (index, value) => {
        if (value.length > 1) {
            value = value.slice(-1);
        }
        if (!/^\d*$/.test(value)) {
            return;
        }

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        setOtpError('');

        if (value && index < 5) {
            otpInputRefs.current[index + 1]?.focus();
        }
    };

    // Handle OTP input key down (for backspace)
    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            otpInputRefs.current[index - 1]?.focus();
        }
    };

    // Handle OTP paste
    const handleOtpPaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6);
        if (/^\d+$/.test(pastedData)) {
            const newOtp = pastedData.split('').concat(Array(6 - pastedData.length).fill(''));
            setOtp(newOtp.slice(0, 6));
            const nextIndex = Math.min(pastedData.length, 5);
            otpInputRefs.current[nextIndex]?.focus();
        }
    };

    // Handle Send OTP (Step 1)
    const handleSendOTP = async () => {
        if (!forgotEmail || !forgotEmail.includes('@')) {
            setOtpError('Please enter a valid email address');
            return;
        }

        setOtpError('');
        setResendLoading(true);
        try {
            await forgotPassword({ email: forgotEmail });
            setForgotStep(2);
            setResendTimer(30);
            setTimeout(() => {
                otpInputRefs.current[0]?.focus();
            }, 100);
        } catch (err) {
            setOtpError(err.response?.data?.detail || err.message || 'Failed to send OTP. Please try again.');
        } finally {
            setResendLoading(false);
        }
    };

    // Handle Verify OTP (Step 2)
    const handleVerifyOTP = () => {
        const otpCode = otp.join('');
        if (otpCode.length !== 6) {
            setOtpError('Please enter the complete 6-digit code');
            return;
        }

        setOtpError('');
        // Move to step 3 - OTP will be verified when resetting password
        setForgotStep(3);
    };

    // Handle Resend OTP
    const handleResendOTP = async () => {
        if (resendTimer > 0) return;

        setResendLoading(true);
        setOtpError('');
        try {
            await forgotPassword({ email: forgotEmail });
            setResendTimer(30);
            setOtp(['', '', '', '', '', '']);
            otpInputRefs.current[0]?.focus();
        } catch (err) {
            setOtpError(err.response?.data?.detail || err.message || 'Failed to resend OTP. Please try again.');
        } finally {
            setResendLoading(false);
        }
    };

    // Handle Reset Password (Step 3)
    const handleResetPassword = async () => {
        if (!newPassword || newPassword.length < 6) {
            setPasswordError('Password must be at least 6 characters');
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordError('Passwords do not match');
            return;
        }

        const otpCode = otp.join('');
        if (otpCode.length !== 6) {
            setPasswordError('OTP is required');
            return;
        }

        setPasswordError('');
        setResetLoading(true);
        try {
            await resetPassword({
                email: forgotEmail,
                otp: otpCode,
                new_password: newPassword
            });
            setForgotStep(4);
        } catch (err) {
            setPasswordError(err.response?.data?.detail || err.message || 'Failed to reset password. Please try again.');
        } finally {
            setResetLoading(false);
        }
    };

    // Reset modal state when closing
    const handleCloseModal = () => {
        setOpenModal(false);
        setForgotStep(1);
        setForgotEmail('');
        setOtp(['', '', '', '', '', '']);
        setOtpError('');
        setNewPassword('');
        setConfirmPassword('');
        setPasswordError('');
        setResendTimer(0);
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
                                    <strong>Admin:</strong> admin / admin123
                                </Typography>
                                <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>
                                    <strong>Order Staff:</strong> stafforder@bikego.com / staff123
                                </Typography>
                                <Typography variant="caption" sx={{ display: 'block' }}>
                                    <strong>Product Staff:</strong> staffproduct@bikego.com / staff123
                                </Typography>
                                <Typography variant="caption" sx={{ display: 'block' }}>
                                    <strong>Customer:</strong> customer1@bikego.com / cus123
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
                onClose={handleCloseModal}
                PaperProps={{ sx: { borderRadius: '20px', padding: '40px', maxWidth: '500px', width: '100%' } }}
            >
                <DialogContent sx={{ p: 0 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                        
                        {/* Bước 1: Nhập Email */}
                        {forgotStep === 1 && (
                            <>
                                <Box sx={{ bgcolor: '#FFF0E5', p: 2, borderRadius: '50%', mb: 2, width: 80, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <LockResetIcon sx={{ fontSize: 50, color: '#FF8C00' }} />
                                </Box>
                                <Typography variant="h5" fontWeight="bold" gutterBottom>Forgot Password?</Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                    Don't worry, it happens. Enter your email and we'll send you a verification code.
                                </Typography>
                                {otpError && <Alert severity="error" sx={{ mb: 2, width: '100%', textAlign: 'left' }}>{otpError}</Alert>}
                                <TextField
                                    fullWidth
                                    placeholder="Email"
                                    variant="outlined"
                                    value={forgotEmail}
                                    onChange={(e) => {
                                        setForgotEmail(e.target.value);
                                        setOtpError('');
                                    }}
                                    sx={{ mb: 2 }}
                                />
                                <Button 
                                    fullWidth 
                                    variant="contained" 
                                    onClick={handleSendOTP}
                                    disabled={resendLoading}
                                    sx={{ bgcolor: '#FF8C00', color: '#fff', borderRadius: '12px', py: 1.5, mb: 2, '&:hover': { bgcolor: '#e67e00' } }}
                                >
                                    {resendLoading ? <CircularProgress size={24} color="inherit" /> : 'Send OTP'}
                                </Button>
                                <Link 
                                    onClick={handleCloseModal}
                                    sx={{ color: '#666', cursor: 'pointer', textDecoration: 'none', fontSize: '0.9rem' }}
                                >
                                    ← Back to Login
                                </Link>
                            </>
                        )}

                        {/* Bước 2: Xác thực OTP */}
                        {forgotStep === 2 && (
                            <>
                                <Box sx={{ bgcolor: '#FFF0E5', p: 2, borderRadius: '50%', mb: 2, width: 80, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <LockResetIcon sx={{ fontSize: 50, color: '#FF8C00' }} />
                                </Box>
                                <Typography variant="h5" fontWeight="bold">Verify Identity</Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                    We send you a 6-digit code to <strong>{forgotEmail}</strong>. Please enter it below
                                </Typography>
                                {otpError && <Alert severity="error" sx={{ mb: 2, width: '100%', textAlign: 'left' }}>{otpError}</Alert>}
                                <Box sx={{ display: 'flex', gap: 2, mb: 3, justifyContent: 'center' }}>
                                    {[0, 1, 2, 3, 4, 5].map((index) => (
                                        <TextField
                                            key={index}
                                            inputRef={(el) => (otpInputRefs.current[index] = el)}
                                            value={otp[index]}
                                            onChange={(e) => handleOtpChange(index, e.target.value)}
                                            onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                            onPaste={index === 0 ? handleOtpPaste : undefined}
                                            inputProps={{
                                                maxLength: 1,
                                                style: { textAlign: 'center', fontSize: '1.5rem', fontWeight: 'bold' }
                                            }}
                                            sx={{
                                                width: 60,
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: '12px',
                                                    '& fieldset': {
                                                        borderColor: otp[index] ? '#FF8C00' : '#ddd',
                                                    },
                                                    '&:hover fieldset': {
                                                        borderColor: '#FF8C00',
                                                    },
                                                    '&.Mui-focused fieldset': {
                                                        borderColor: '#FF8C00',
                                                    },
                                                },
                                            }}
                                        />
                                    ))}
                                </Box>
                                <Typography variant="body2" sx={{ mb: 2, color: '#666' }}>
                                    Didn't receive the code?{' '}
                                    {resendTimer > 0 ? (
                                        <span style={{ color: '#999' }}>
                                            Resend Code ({String(Math.floor(resendTimer / 60)).padStart(2, '0')}:{String(resendTimer % 60).padStart(2, '0')})
                                        </span>
                                    ) : (
                                        <Link
                                            onClick={handleResendOTP}
                                            sx={{
                                                color: '#1976d2',
                                                cursor: resendLoading ? 'not-allowed' : 'pointer',
                                                fontWeight: 'bold',
                                                textDecoration: 'none',
                                                '&:hover': { textDecoration: 'underline' }
                                            }}
                                        >
                                            {resendLoading ? 'Sending...' : 'Resend Code'}
                                        </Link>
                                    )}
                                </Typography>
                                <Button 
                                    fullWidth 
                                    variant="contained" 
                                    onClick={handleVerifyOTP}
                                    disabled={otpLoading || otp.join('').length !== 6}
                                    sx={{ bgcolor: '#FF8C00', color: '#fff', borderRadius: '12px', py: 1.5, mb: 2, '&:hover': { bgcolor: '#e67e00' }, '&:disabled': { bgcolor: '#ccc' } }}
                                >
                                    {otpLoading ? <CircularProgress size={24} color="inherit" /> : 'Verify →'}
                                </Button>
                                <Link 
                                    onClick={() => setForgotStep(1)}
                                    sx={{ color: '#666', cursor: 'pointer', textDecoration: 'none', fontSize: '0.9rem' }}
                                >
                                    ← Wrong email? Go back
                                </Link>
                            </>
                        )}

                        {/* Bước 3: Đặt lại mật khẩu */}
                        {forgotStep === 3 && (
                            <>
                                <Box sx={{ bgcolor: '#FFF0E5', p: 2, borderRadius: '50%', mb: 2, width: 80, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <LockResetIcon sx={{ fontSize: 50, color: '#FF8C00' }} />
                                </Box>
                                <Typography variant="h5" fontWeight="bold">Reset your password</Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                    Please enter a new password for your BikeGo account.
                                </Typography>
                                {passwordError && <Alert severity="error" sx={{ mb: 2, width: '100%', textAlign: 'left' }}>{passwordError}</Alert>}
                                <TextField 
                                    fullWidth 
                                    placeholder="Enter new password" 
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => {
                                        setNewPassword(e.target.value);
                                        setPasswordError('');
                                    }}
                                    sx={{ mb: 2 }} 
                                />
                                <TextField 
                                    fullWidth 
                                    placeholder="Re-enter new password" 
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => {
                                        setConfirmPassword(e.target.value);
                                        setPasswordError('');
                                    }}
                                    sx={{ mb: 3 }} 
                                />
                                <Button 
                                    fullWidth 
                                    variant="contained" 
                                    onClick={handleResetPassword}
                                    disabled={resetLoading || !newPassword || !confirmPassword}
                                    sx={{ bgcolor: '#FF8C00', color: '#fff', borderRadius: '12px', py: 1.5, mb: 2, '&:hover': { bgcolor: '#e67e00' }, '&:disabled': { bgcolor: '#ccc' } }}
                                >
                                    {resetLoading ? <CircularProgress size={24} color="inherit" /> : 'Reset Password'}
                                </Button>
                                <Link 
                                    onClick={() => setForgotStep(2)}
                                    sx={{ color: '#666', cursor: 'pointer', textDecoration: 'none', fontSize: '0.9rem' }}
                                >
                                    ← Back
                                </Link>
                            </>
                        )}

                        {/* Bước 4: Thành công */}
                        {forgotStep === 4 && (
                            <>
                                <Typography variant="h5" fontWeight="bold" sx={{ mt: 4, mb: 2 }}>
                                    Password changed successfully!
                                </Typography>
                                <Button 
                                    onClick={handleCloseModal}
                                    sx={{ color: '#FF8C00', fontWeight: 'bold', textTransform: 'none' }}
                                >
                                    ← Back to Login
                                </Button>
                            </>
                        )}
                    </Box>
                </DialogContent>
            </Dialog>
        </Box>
    );
};

export default LoginPage;
