import React from 'react';
import { Box, Typography, Button, Paper, IconButton } from '@mui/material';
import { ChevronRight as ChevronRightIcon } from '@mui/icons-material';

const OrderHistory = ({ orders }) => {
    return (
        <Box sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">My Order</Typography>
                <Button endIcon={<ChevronRightIcon />} sx={{ color: '#000', border: '1px solid #ddd', borderRadius: 5, px: 2 }}>Completed</Button>
            </Box>
            {/* Mock Order Item - Trong thực tế bạn sẽ map qua mảng orders ở đây */}
            <Paper variant="outlined" sx={{ p: 2, mb: 2, backgroundColor: '#fcf6f0' }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Box component="img" src="https://via.placeholder.com/80" sx={{ width: 80, height: 80, borderRadius: 1 }} />
                    <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle2" fontWeight="bold">Touring-1000 Blue, 46</Typography>
                        <Typography variant="caption" display="block" color="text.secondary">Type: Blue</Typography>
                        <Typography variant="caption" display="block" color="text.secondary">x1</Typography>
                        <Typography variant="subtitle2" color="error" textAlign="right">$2,384.07</Typography>
                    </Box>
                    <IconButton size="small"><ChevronRightIcon /></IconButton>
                </Box>
                <Button fullWidth variant="contained" disabled sx={{ mt: 1, backgroundColor: '#ddd', color: '#777', textTransform: 'none' }}>Rate this product</Button>
            </Paper>
        </Box>
    );
};

export default OrderHistory;