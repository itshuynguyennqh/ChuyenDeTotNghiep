import { Box, Typography, Paper, Button } from '@mui/material';

// AccountInfo.js
const AccountInfo = () => {
    return (
        <Box>
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>Login information</Typography>
            <Paper variant="outlined" sx={{ p: 4, borderRadius: '20px' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
                    <Box>
                        <Typography variant="h6" fontWeight="bold">Phone number</Typography>
                        <Typography variant="h6" color="text.secondary">0396660067</Typography>
                    </Box>
                    <Button sx={{ color: '#1976d2', textTransform: 'none', fontSize: '1.1rem' }}>Edit</Button>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Box>
                        <Typography variant="h6" fontWeight="bold">Pass word</Typography>
                        <Typography variant="h6" color="text.secondary">***********************</Typography>
                    </Box>
                    <Button sx={{ color: '#1976d2', textTransform: 'none', fontSize: '1.1rem' }}>Edit</Button>
                </Box>
            </Paper>
        </Box>
    );
};

export default AccountInfo;