import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    Grid,
    Typography,
    TextField,
    Button,
    Link as MuiLink,
    Container,
    Alert,
    CircularProgress,
    Dialog,
    DialogContent
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import { Link as RouterLink, useNavigate } from "react-router-dom";
import logo from "../assets/BikeGo-logo-orange.png";
import bike from "../assets/LogoBike.png";
import { register, verifyRegistration } from '../api/authApi';

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
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        password: '',
        repeatPassword: '',
        email: '',
        firstname: '',
        lastname: '',
        phone: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [openOTPDialog, setOpenOTPDialog] = useState(false);
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [otpError, setOtpError] = useState('');
    const [otpLoading, setOtpLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);
    const [resendLoading, setResendLoading] = useState(false);
    const otpInputRefs = useRef([]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
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
            value = value.slice(-1); // Only take the last character
        }
        if (!/^\d*$/.test(value)) {
            return; // Only allow digits
        }

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        setOtpError('');

        // Auto-focus next input
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

    // Handle verify OTP
    const handleVerifyOTP = async () => {
        const otpCode = otp.join('');
        if (otpCode.length !== 6) {
            setOtpError('Please enter the complete 6-digit code');
            return;
        }

        setOtpError('');
        setOtpLoading(true);
        try {
            await verifyRegistration({
                email: formData.email,
                otp: otpCode
            });
            // Success - navigate to login
            setOpenOTPDialog(false);
            alert('Registration successful! You can now log in.');
            navigate('/login');
        } catch (err) {
            setOtpError(err.response?.data?.detail || err.message || 'Invalid OTP. Please try again.');
        } finally {
            setOtpLoading(false);
        }
    };

    // Handle resend OTP
    const handleResendOTP = async () => {
        if (resendTimer > 0) return;

        setResendLoading(true);
        setOtpError('');
        try {
            const apiData = {
                first_name: formData.firstname,
                last_name: formData.lastname,
                email: formData.email,
                phone: formData.phone,
                password: formData.password
            };
            await register(apiData);
            setResendTimer(30); // 30 seconds timer
            setOtp(['', '', '', '', '', '']); // Clear OTP inputs
            otpInputRefs.current[0]?.focus();
        } catch (err) {
            setOtpError(err.response?.data?.detail || err.message || 'Failed to resend OTP. Please try again.');
        } finally {
            setResendLoading(false);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');

        if (formData.password !== formData.repeatPassword) {
            setError("Passwords do not match!");
            return;
        }

        // Validate phone number format (Vietnamese format)
        const phoneRegex = /^(84|0[3|5|7|8|9])+([0-9]{8})\b/;
        if (!phoneRegex.test(formData.phone)) {
            setError("Phone number must be in Vietnamese format (e.g., 0123456789 or 84123456789)");
            return;
        }

        setLoading(true);
        try {
            // Transform data to match backend API requirements
            const apiData = {
                first_name: formData.firstname,
                last_name: formData.lastname,
                email: formData.email,
                phone: formData.phone,
                password: formData.password
            };
            
            await register(apiData);
            
            // Open OTP dialog instead of alert
            setOpenOTPDialog(true);
            setResendTimer(30); // Start 30 seconds timer
            // Focus first OTP input after dialog opens
            setTimeout(() => {
                otpInputRefs.current[0]?.focus();
            }, 100);
        } catch (err) {
            setError(err.response?.data?.detail || err.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
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
                    borderRadius: 4,
                    overflow: 'hidden',
                    boxShadow: 3,
                    height: '70vh', // Chiều cao cố định
                    minHeight: '900px',
                    minWidth: '1800px',
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

                        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                        {/* Input First Name and Last Name*/}
                        <Grid container spacing={2}
                              sx={{
                                  flexDirection: 'row',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  flexWrap: 'nowrap',
                                  mb: 2
                              }}>
                            <Grid item xs={6}>
                                <TextField
                                    fullWidth
                                    variant="filled"
                                    label="First Name"
                                    name="firstname"
                                    value={formData.firstname}
                                    onChange={handleChange}
                                    sx={{ borderRadius: 1, '& .MuiFilledInput-root': { backgroundColor: '#e9e9e9', borderRadius: 1, '&:hover': { backgroundColor: '#ddd' } }, '& label': { top: -8 } }}
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
                                    sx={{ borderRadius: 1, '& .MuiFilledInput-root': { backgroundColor: '#e9e9e9', borderRadius: 1, '&:hover': { backgroundColor: '#ddd' } }, '& label': { top: -8 } }}
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

                        {/* Input Phone */}
                        <TextField
                            fullWidth
                            variant="filled"
                            label="Phone Number"
                            name="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="0123456789"
                            helperText="Vietnamese format: 0xxxxxxxxx or 84xxxxxxxxx"
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
                            disabled={loading}
                            sx={{
                                py: 1.5,
                                backgroundColor: '#FF8C00', // Màu cam
                                '&:hover': { backgroundColor: '#e67300' },
                                fontWeight: 'bold',
                                borderRadius: 1
                            }}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign up'}
                        </Button>

                    </Box>
                </Grid>
            </Box>

            {/* OTP Verification Dialog */}
            <Dialog
                open={openOTPDialog}
                onClose={() => {}} // Prevent closing by clicking outside
                PaperProps={{
                    sx: {
                        borderRadius: '20px',
                        padding: '40px',
                        maxWidth: '500px',
                        width: '100%',
                        textAlign: 'center'
                    }
                }}
            >
                <DialogContent sx={{ p: 0 }}>
                    {/* Icon */}
                    <Box
                        sx={{
                            width: 80,
                            height: 80,
                            borderRadius: '50%',
                            backgroundColor: '#FF8C00',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 20px',
                        }}
                    >
                        <LockIcon sx={{ fontSize: 40, color: 'white' }} />
                    </Box>

                    {/* Title */}
                    <Typography variant="h4" fontWeight="bold" sx={{ mb: 2, color: '#002B5B' }}>
                        Security Check
                    </Typography>

                    {/* Instructions */}
                    <Typography variant="body1" sx={{ mb: 4, color: '#666' }}>
                        Please enter the 6-digit verification code sent to <strong>{formData.email}</strong> to complete your BikeGo registration.
                    </Typography>

                    {/* OTP Error */}
                    {otpError && (
                        <Alert severity="error" sx={{ mb: 2, textAlign: 'left' }}>
                            {otpError}
                        </Alert>
                    )}

                    {/* OTP Input Fields */}
                    <Box
                        sx={{
                            display: 'flex',
                            gap: 2,
                            justifyContent: 'center',
                            mb: 3
                        }}
                    >
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

                    {/* Resend Code */}
                    <Typography variant="body2" sx={{ mb: 3, color: '#666' }}>
                        Didn't receive the code?{' '}
                        {resendTimer > 0 ? (
                            <span style={{ color: '#999' }}>
                                Resend Code ({String(Math.floor(resendTimer / 60)).padStart(2, '0')}:{String(resendTimer % 60).padStart(2, '0')})
                            </span>
                        ) : (
                            <MuiLink
                                onClick={handleResendOTP}
                                sx={{
                                    color: '#1976d2',
                                    cursor: resendLoading ? 'not-allowed' : 'pointer',
                                    fontWeight: 'bold',
                                    textDecoration: 'none',
                                    '&:hover': {
                                        textDecoration: 'underline'
                                    }
                                }}
                            >
                                {resendLoading ? 'Sending...' : 'Resend Code'}
                            </MuiLink>
                        )}
                    </Typography>

                    {/* Verify Button */}
                    <Button
                        fullWidth
                        variant="contained"
                        onClick={handleVerifyOTP}
                        disabled={otpLoading || otp.join('').length !== 6}
                        sx={{
                            backgroundColor: '#FF8C00',
                            color: '#fff',
                            py: 1.5,
                            mb: 2,
                            borderRadius: '12px',
                            fontSize: '1.1rem',
                            fontWeight: 'bold',
                            '&:hover': {
                                backgroundColor: '#e67300'
                            },
                            '&:disabled': {
                                backgroundColor: '#ccc'
                            }
                        }}
                    >
                        {otpLoading ? <CircularProgress size={24} color="inherit" /> : 'Verify Account →'}
                    </Button>

                    {/* Go Back Link */}
                    <MuiLink
                        onClick={() => {
                            setOpenOTPDialog(false);
                            setOtp(['', '', '', '', '', '']);
                            setOtpError('');
                            setResendTimer(0);
                        }}
                        sx={{
                            color: '#666',
                            cursor: 'pointer',
                            textDecoration: 'none',
                            fontSize: '0.9rem',
                            '&:hover': {
                                textDecoration: 'underline'
                            }
                        }}
                    >
                        ← Wrong email? Go back
                    </MuiLink>
                </DialogContent>
            </Dialog>

        </Container>
    );
}

export default SignUp;
