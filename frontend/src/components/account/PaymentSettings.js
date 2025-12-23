import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { AddCircleOutline as AddIcon } from '@mui/icons-material';

const PaymentSettings = () => {
    return (
        <Box sx={{ mt: 2 }}>
            <Typography variant="h6" color="primary" sx={{ mb: 2 }}>Payment Settings</Typography>
            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>Card</Typography>
            <Button fullWidth startIcon={<AddIcon />} sx={{ justifyContent: 'flex-start', backgroundColor: '#fcf6f0', color: '#000', mb: 2, py: 1.5 }}>Add new card</Button>

            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>E-wallet</Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2">🔵 PayPal</Typography>
                <Button sx={{ color: '#000', textTransform: 'none' }}>Edit</Button>
            </Box>
            <Button fullWidth startIcon={<AddIcon />} sx={{ justifyContent: 'flex-start', backgroundColor: '#fcf6f0', color: '#000', py: 1.5 }}>Add e-wallet</Button>
        </Box>
    );
};

export default PaymentSettings;