import React from 'react';
import { Box, Typography, Button, Chip } from '@mui/material';
import { AddCircleOutline as AddIcon } from '@mui/icons-material';

const AddressList = () => {
    return (
        <Box sx={{ mt: 2 }}>
            <Typography variant="h6" color="primary" sx={{ mb: 2 }}>Saved Addresses</Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Box>
                    <Typography fontWeight="bold">Thanh Trúc <span style={{ fontWeight: 'normal', color: '#666' }}>(+84) 865358650</span></Typography>
                    <Typography variant="body2" color="text.secondary">Số 2, ngõ 18 Định Công Thượng, phường Định Công, quận Hoàng Mai, Hà Nội</Typography>
                    <Chip label="Default" size="small" variant="outlined" color="error" sx={{ mt: 1, borderRadius: 1 }} />
                </Box>
                <Button sx={{ color: '#000', textTransform: 'none' }}>Edit</Button>
            </Box>
            <Button startIcon={<AddIcon />} sx={{ mt: 4, color: '#000', textTransform: 'none' }}>Add new address</Button>
        </Box>
    );
};

export default AddressList;