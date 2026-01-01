import React from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

const AddressList = () => {
    return (
        <Box>
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>Saved Addresses</Typography>
            <Paper variant="outlined" sx={{ p: 4, borderRadius: '20px', width: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                        <Typography variant="h6" color="#1976d2" fontWeight="bold" gutterBottom>Saved Addresses</Typography>
                        <Typography variant="body1" fontWeight="bold">Thanh Trúc (+84) 865358650</Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: '900px', my: 1 }}>
                            Số 2, ngõ 18 Định Công Thượng, phường Định Công, quận Hoàng Mai, Hà Nội
                        </Typography>
                        <Box sx={{ border: '1px solid #d32f2f', color: '#d32f2f', display: 'inline-block', px: 1.5, py: 0.2, borderRadius: '4px', fontSize: '0.8rem' }}>
                            Default
                        </Box>
                    </Box>
                    <Button sx={{ color: '#000', fontWeight: 'bold' }}>Edit</Button>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                    <Button startIcon={<AddIcon />} sx={{ color: '#000', textTransform: 'none', fontWeight: 'bold' }}>
                        Add new address
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
};

export default AddressList;