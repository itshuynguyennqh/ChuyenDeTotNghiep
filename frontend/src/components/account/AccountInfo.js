import React from 'react';
import { Box, Typography, Button } from '@mui/material';

const AccountInfo = ({ userInfo }) => {
    return (
        <Box sx={{ mt: 2 }}>
            <Typography variant="h6" color="primary" sx={{ mb: 3 }}>Login information</Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Box>
                    <Typography variant="subtitle1" fontWeight="bold">Phone number</Typography>
                    <Typography color="text.secondary">{userInfo.phone}</Typography>
                </Box>
                <Button sx={{ color: '#1976d2', textTransform: 'none' }}>Edit</Button>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Box>
                    <Typography variant="subtitle1" fontWeight="bold">Pass word</Typography>
                    <Typography color="text.secondary">***********************</Typography>
                </Box>
                <Button sx={{ color: '#1976d2', textTransform: 'none' }}>Edit</Button>
            </Box>
        </Box>
    );
};

export default AccountInfo;