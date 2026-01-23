import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Typography, Dialog, DialogContent, TextField, Button, Alert, CircularProgress, Link } from '@mui/material';
import LockResetIcon from '@mui/icons-material/LockReset';
import { forgotPassword, resetPassword } from '../../api/authApi';

const ChangePasswordDialog = ({ open, onClose, userEmail }) => {
    const [step, setStep] = useState(1); // 1: Send OTP, 2: Verify OTP, 3: Reset Password, 4: Success
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

    // Timer for resend OTP
    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setTimeout(() => {
                setResendTimer(resendTimer - 1);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [resendTimer]);

    // Handle Send OTP (Step 1) - Auto-called when dialog opens
    const handleSendOTP = useCallback(async () => {
        if (!userEmail) {
            setOtpError('Email is required');
            return;
        }

        setOtpError('');
        setResendLoading(true);
        try {
            await forgotPassword({ email: userEmail });
            setStep(2);
            setResendTimer(30);
            setTimeout(() => {
                otpInputRefs.current[0]?.focus();
            }, 100);
        } catch (err) {
            setOtpError(err.response?.data?.detail || err.message || 'Failed to send OTP. Please try again.');
        } finally {
            setResendLoading(false);
        }
    }, [userEmail]);

    // Reset state when dialog opens
    useEffect(() => {
        if (open && userEmail) {
            // Reset to step 1 and auto send OTP when dialog opens
            setStep(1);
            setOtp(['', '', '', '', '', '']);
            setOtpError('');
            setNewPassword('');
            setConfirmPassword('');
            setPasswordError('');
            setResendTimer(0);
            // Auto send OTP
            handleSendOTP();
        }
    }, [open, userEmail, handleSendOTP]);

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


    // Handle Verify OTP (Step 2)
    const handleVerifyOTP = () => {
        const otpCode = otp.join('');
        if (otpCode.length !== 6) {
            setOtpError('Please enter the complete 6-digit code');
            return;
        }

        setOtpError('');
        // Move to step 3 - OTP will be verified when resetting password
        setStep(3);
    };

    // Handle Resend OTP
    const handleResendOTP = async () => {
        if (resendTimer > 0) return;

        setResendLoading(true);
        setOtpError('');
        try {
            await forgotPassword({ email: userEmail });
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
                email: userEmail,
                otp: otpCode,
                new_password: newPassword
            });
            setStep(4);
        } catch (err) {
            setPasswordError(err.response?.data?.detail || err.message || 'Failed to reset password. Please try again.');
        } finally {
            setResetLoading(false);
        }
    };

    // Reset modal state when closing
    const handleClose = () => {
        setStep(1);
        setOtp(['', '', '', '', '', '']);
        setOtpError('');
        setNewPassword('');
        setConfirmPassword('');
        setPasswordError('');
        setResendTimer(0);
        onClose();
    };

    return (
        <Dialog 
            open={open} 
            onClose={handleClose}
            PaperProps={{ sx: { borderRadius: '20px', padding: '40px', maxWidth: '500px', width: '100%' } }}
        >
            <DialogContent sx={{ p: 0 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    
                    {/* Bước 1: Đang gửi OTP */}
                    {step === 1 && (
                        <>
                            <Box sx={{ bgcolor: '#FFF0E5', p: 2, borderRadius: '50%', mb: 2, width: 80, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <LockResetIcon sx={{ fontSize: 50, color: '#FF8C00' }} />
                            </Box>
                            <Typography variant="h5" fontWeight="bold" gutterBottom>Change Password</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                We're sending a verification code to <strong>{userEmail}</strong>
                            </Typography>
                            {resendLoading && <CircularProgress size={24} />}
                        </>
                    )}

                    {/* Bước 2: Xác thực OTP */}
                    {step === 2 && (
                        <>
                            <Box sx={{ bgcolor: '#FFF0E5', p: 2, borderRadius: '50%', mb: 2, width: 80, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <LockResetIcon sx={{ fontSize: 50, color: '#FF8C00' }} />
                            </Box>
                            <Typography variant="h5" fontWeight="bold">Verify Identity</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                We sent you a 6-digit code to <strong>{userEmail}</strong>. Please enter it below
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
                                onClick={handleClose}
                                sx={{ color: '#666', cursor: 'pointer', textDecoration: 'none', fontSize: '0.9rem' }}
                            >
                                ← Cancel
                            </Link>
                        </>
                    )}

                    {/* Bước 3: Đặt lại mật khẩu */}
                    {step === 3 && (
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
                                onClick={() => setStep(2)}
                                sx={{ color: '#666', cursor: 'pointer', textDecoration: 'none', fontSize: '0.9rem' }}
                            >
                                ← Back
                            </Link>
                        </>
                    )}

                    {/* Bước 4: Thành công */}
                    {step === 4 && (
                        <>
                            <Box sx={{ bgcolor: '#d4edda', p: 2, borderRadius: '50%', mb: 2, width: 80, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Typography sx={{ fontSize: 50, color: '#28a745' }}>✓</Typography>
                            </Box>
                            <Typography variant="h5" fontWeight="bold" sx={{ mt: 4, mb: 2 }}>
                                Password changed successfully!
                            </Typography>
                            <Button 
                                onClick={handleClose}
                                variant="contained"
                                sx={{ bgcolor: '#FF8C00', color: '#fff', borderRadius: '12px', py: 1.5, mb: 2, '&:hover': { bgcolor: '#e67e00' }, textTransform: 'none' }}
                            >
                                Close
                            </Button>
                        </>
                    )}
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default ChangePasswordDialog;
