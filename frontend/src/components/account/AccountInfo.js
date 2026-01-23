import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button, TextField, Dialog, DialogContent, Alert, CircularProgress, Link } from '@mui/material';
import LockResetIcon from '@mui/icons-material/LockReset';
import { getUserProfile, updateUserProfile } from '../../api/userApi';
import { forgotPassword, resetPassword } from '../../api/authApi';
import ChangePasswordDialog from './ChangePasswordDialog';

// AccountInfo.js
const AccountInfo = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editPhone, setEditPhone] = useState(false);
    const [phoneValue, setPhoneValue] = useState('');
    const [phoneLoading, setPhoneLoading] = useState(false);
    const [openPasswordDialog, setOpenPasswordDialog] = useState(false);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            setLoading(true);
            const response = await getUserProfile();
            setProfile(response.data.data);
            setPhoneValue(response.data.data?.phone || '');
        } catch (err) {
            setError(err.response?.data?.detail || err.message || 'Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleEditPhone = () => {
        setEditPhone(true);
        setPhoneValue(profile?.phone || '');
    };

    const handleSavePhone = async () => {
        if (!phoneValue.trim()) {
            setError('Phone number cannot be empty');
            return;
        }

        setPhoneLoading(true);
        setError('');
        try {
            await updateUserProfile({ phone: phoneValue.trim() });
            await loadProfile();
            setEditPhone(false);
        } catch (err) {
            setError(err.response?.data?.detail || err.message || 'Failed to update phone number');
        } finally {
            setPhoneLoading(false);
        }
    };

    const handleCancelEditPhone = () => {
        setEditPhone(false);
        setPhoneValue(profile?.phone || '');
        setError('');
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>Login information</Typography>
            <Paper variant="outlined" sx={{ p: 4, borderRadius: '20px' }}>
                {error && !editPhone && (
                    <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                        {error}
                    </Alert>
                )}
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4, alignItems: 'center' }}>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>Phone number</Typography>
                        {editPhone ? (
                            <Box>
                                <TextField
                                    fullWidth
                                    value={phoneValue}
                                    onChange={(e) => setPhoneValue(e.target.value)}
                                    placeholder="Enter phone number"
                                    error={!!error}
                                    helperText={error}
                                    sx={{ mb: 2 }}
                                />
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Button
                                        variant="contained"
                                        onClick={handleSavePhone}
                                        disabled={phoneLoading}
                                        sx={{ bgcolor: '#FF8C00', '&:hover': { bgcolor: '#e67e00' }, textTransform: 'none' }}
                                    >
                                        {phoneLoading ? <CircularProgress size={20} /> : 'Save'}
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        onClick={handleCancelEditPhone}
                                        disabled={phoneLoading}
                                        sx={{ textTransform: 'none' }}
                                    >
                                        Cancel
                                    </Button>
                                </Box>
                            </Box>
                        ) : (
                            <Typography variant="h6" color="text.secondary">
                                {profile?.phone || 'Not set'}
                            </Typography>
                        )}
                    </Box>
                    {!editPhone && (
                        <Button 
                            sx={{ color: '#1976d2', textTransform: 'none', fontSize: '1.1rem' }}
                            onClick={handleEditPhone}
                        >
                            Edit
                        </Button>
                    )}
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>Password</Typography>
                        <Typography variant="h6" color="text.secondary">***********************</Typography>
                    </Box>
                    <Button 
                        sx={{ color: '#1976d2', textTransform: 'none', fontSize: '1.1rem' }}
                        onClick={() => setOpenPasswordDialog(true)}
                    >
                        Edit
                    </Button>
                </Box>
            </Paper>

            <ChangePasswordDialog
                open={openPasswordDialog}
                onClose={() => setOpenPasswordDialog(false)}
                userEmail={profile?.email}
            />
        </Box>
    );
};

export default AccountInfo;