import React, { useState } from 'react';
import {
    Box,
    Typography,
    Paper,
    Button,
    Menu,
    MenuItem
} from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

function ProductFilters({ onSortChange, currentSort }) {
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const handleClick = (event, label) => {
        if (label === 'Price') {
            setAnchorEl(event.currentTarget);
        }
    };

    const handleClose = (sortType) => {
        setAnchorEl(null);
        if (sortType) {
            onSortChange(sortType);
        }
    };

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
                            onClick={(e) => handleClick(e, label)}
                            sx={{ 
                                color: label === 'Price' && currentSort ? '#f37021' : '#333', 
                                borderColor: label === 'Price' && currentSort ? '#f37021' : '#ddd', 
                                textTransform: 'none', 
                                '&:hover': { borderColor: '#aaa', backgroundColor: '#f5f5f5' } 
                            }}
                            size="small"
                        >
                            {label === 'Price' && currentSort === 'asc' ? 'Price: Low to High' : 
                             label === 'Price' && currentSort === 'desc' ? 'Price: High to Low' : label}
                        </Button>
                    ))}
                    <Menu anchorEl={anchorEl} open={open} onClose={() => handleClose(null)}>
                        <MenuItem onClick={() => handleClose('asc')}>Price: Low to High</MenuItem>
                        <MenuItem onClick={() => handleClose('desc')}>Price: High to Low</MenuItem>
                        <MenuItem onClick={() => handleClose('')}>Default</MenuItem>
                    </Menu>
                </Box>
            </Paper>
        </Box>
    );
}

export default ProductFilters;
