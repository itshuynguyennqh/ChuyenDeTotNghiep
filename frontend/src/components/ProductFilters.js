import React from 'react';
import {
    Box,
    Typography,
    Paper,
    Button,
} from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

function ProductFilters() {
    return (
        <Box sx={{ mb: 4 }}>
            <Paper elevation={0} sx={{ backgroundColor: '#f3e5d8', p: 2, borderRadius: 1 }}>
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>Filters</Typography>
                <Box sx={{ backgroundColor: '#fff', p: 1, borderRadius: 1, display: 'inline-flex', gap: 1 }}>
                    {['Catalogs', 'Price', 'Rating'].map((label) => (
                        <Button
                            key={label}
                            variant="outlined"
                            endIcon={<ArrowDropDownIcon />}
                            sx={{ color: '#333', borderColor: '#ddd', textTransform: 'none', '&:hover': { borderColor: '#aaa', backgroundColor: '#f5f5f5' } }}
                            size="small"
                        >
                            {label}
                        </Button>
                    ))}
                </Box>
            </Paper>
        </Box>
    );
}

export default ProductFilters;
