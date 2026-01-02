import React, { useState } from 'react';
import {
    Box, Typography, Paper, Tabs, Tab, TextField, Select, MenuItem,
    InputAdornment, Chip, IconButton, Divider, Button
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

const OrderHistory = ({ onOrderSelect }) => {
    const [activeTab, setActiveTab] = useState(1); // Default to Rental tab
    const [statusFilter, setStatusFilter] = useState('All');

    // Danh sách trạng thái dựa trên Frame 1617.png
    const orderStatuses = [
        "All", "pending", "confirmed", "preparing", "shipped",
        "delivered", "cancel request", "cancelled",
        "return requested", "returning"
    ];

    // Style cho nhãn trạng thái (Chips) dựa trên hình ảnh
    const getStatusStyle = (status) => {
        const statusColors = {
            'preparing': { bg: '#FEF9C3', color: '#854D0E' }, // Light yellow
            'renting': { bg: '#DBEAFE', color: '#1E40AF' },    // Light blue
            'inspecting': { bg: '#F3E8DB', color: '#78350F' }, // Light brown
            'pending': { bg: '#FEF9C3', color: '#854D0E' }
        };
        const style = statusColors[status.toLowerCase()] || { bg: '#F5EFE6', color: '#4D4D4D' };
        return {
            backgroundColor: style.bg,
            color: style.color,
            fontWeight: 'bold',
            borderRadius: '12px',
            textTransform: 'lowercase',
            height: '24px',
            fontSize: '0.75rem',
            px: 1.5
        };
    };
    const handleOrderClick = (order) => {
        if (onOrderSelect) {
            onOrderSelect(order);
        }
    };

    return (
        <Box>
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>My Order</Typography>

            <Paper variant="outlined" sx={{ borderRadius: '20px', overflow: 'hidden', border: '1px solid #E0E0E0' }}>
                {/* Tabs: Purchases / Rental */}
                <Box sx={{ px: 2, pt: 1 }}>
                    <Tabs
                        value={activeTab}
                        onChange={(e, v) => setActiveTab(v)}
                        TabIndicatorProps={{ sx: { bgcolor: '#FF8C00', height: 3 } }}
                    >
                        <Tab label="Purchases" sx={{ textTransform: 'none', fontWeight: 'bold', fontSize: '1rem', color: activeTab === 0 ? '#FF8C00' : '#888' }} />
                        <Tab label="Rental" sx={{ textTransform: 'none', fontWeight: 'bold', fontSize: '1rem', color: activeTab === 1 ? '#FF8C00' : '#888' }} />
                    </Tabs>
                </Box>
                <Divider />

                {/* Filter Bar: Search + Status Dropdown */}
                <Box sx={{ p: 2, display: 'flex', gap: 2, bgcolor: '#F9F9F9' }}>
                    <TextField
                        fullWidth
                        size="small"
                        placeholder="Search your order here"
                        InputProps={{
                            startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
                            sx: { borderRadius: '10px', bgcolor: '#fff' }
                        }}
                    />

                    {/* Dropdown Status thả xuống */}
                    <Select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        size="small"
                        IconComponent={KeyboardArrowDownIcon}
                        sx={{
                            minWidth: 160,
                            borderRadius: '10px',
                            bgcolor: '#fff',
                            '& .MuiSelect-select': { fontWeight: '500' }
                        }}
                    >
                        {orderStatuses.map((status) => (
                            <MenuItem key={status} value={status}>
                                {status === 'All' ? 'Status: All' : status.charAt(0).toUpperCase() + status.slice(1)}
                            </MenuItem>
                        ))}
                    </Select>
                </Box>

                {/* Order List */}
                <Box sx={{ p: 2 }}>
                    {/* Rental Item 1 */}
                    <Box 
                        onClick={() => handleOrderClick({ id: '244523YTH', type: 'rent' })} 
                        sx={{ cursor: 'pointer', display: 'flex', gap: 2, p: 2, borderBottom: '1px solid #EEE', '&:hover': { bgcolor: '#fafafa' } }}
                    >
                        <Box 
                            component="img" 
                            src="https://demo.componentone.com/ASPNET/AdventureWorks/ProductImage.ashx?ProductID=1&size=large" 
                            sx={{ width: 100, height: 100, borderRadius: '10px', border: '1px solid #EEE', objectFit: 'contain', bgcolor: '#fff' }} 
                        />
                        <Box sx={{ flexGrow: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                <Typography fontWeight="bold" variant="subtitle1">Touring-1000 Blue, 46</Typography>
                                <Chip label="preparing" sx={getStatusStyle('preparing')} />
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Type: Blue</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Oct 12 - Oct 20, 2025</Typography>
                            <Button 
                                variant="outlined" 
                                size="small"
                                sx={{ 
                                    bgcolor: '#EEEEEE', 
                                    color: '#666',
                                    border: 'none',
                                    textTransform: 'none',
                                    borderRadius: '4px',
                                    px: 2,
                                    '&:hover': { bgcolor: '#E0E0E0', border: 'none' }
                                }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    // Handle rate product
                                }}
                            >
                                Rate this product
                            </Button>
                        </Box>
                        <Box sx={{ textAlign: 'right', minWidth: 200 }}>
                            <Typography variant="body2" fontWeight="bold" color="#D32F2F" sx={{ mb: 0.5 }}>
                                TOTAL RENTAL FEE
                            </Typography>
                            <Typography variant="h6" fontWeight="bold" color="#D32F2F" sx={{ mb: 2 }}>
                                $180
                            </Typography>
                            <Typography variant="body2" fontWeight="bold" color="#D32F2F" sx={{ mb: 0.5 }}>
                                SECURITY DEPOSIT
                            </Typography>
                            <Typography variant="h6" fontWeight="bold" color="#D32F2F">
                                $2,699.99
                            </Typography>
                        </Box>
                    </Box>

                    {/* Rental Item 2 */}
                    <Box 
                        onClick={() => handleOrderClick({ id: '244523YTH', type: 'rent' })} 
                        sx={{ cursor: 'pointer', display: 'flex', gap: 2, p: 2, borderBottom: '1px solid #EEE', '&:hover': { bgcolor: '#fafafa' } }}
                    >
                        <Box 
                            component="img" 
                            src="https://demo.componentone.com/ASPNET/AdventureWorks/ProductImage.ashx?ProductID=2&size=large" 
                            sx={{ width: 100, height: 100, borderRadius: '10px', border: '1px solid #EEE', objectFit: 'contain', bgcolor: '#fff' }} 
                        />
                        <Box sx={{ flexGrow: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                <Typography fontWeight="bold" variant="subtitle1">Touring-1000 Blue, 46</Typography>
                                <Chip label="renting" sx={getStatusStyle('renting')} />
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Type: Blue</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Oct 12 - Oct 20, 2025</Typography>
                            <Button 
                                variant="outlined" 
                                size="small"
                                sx={{ 
                                    bgcolor: '#EEEEEE', 
                                    color: '#666',
                                    border: 'none',
                                    textTransform: 'none',
                                    borderRadius: '4px',
                                    px: 2,
                                    '&:hover': { bgcolor: '#E0E0E0', border: 'none' }
                                }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                }}
                            >
                                Rate this product
                            </Button>
                        </Box>
                        <Box sx={{ textAlign: 'right', minWidth: 200 }}>
                            <Typography variant="body2" fontWeight="bold" color="#D32F2F" sx={{ mb: 0.5 }}>
                                TOTAL RENTAL FEE
                            </Typography>
                            <Typography variant="h6" fontWeight="bold" color="#D32F2F" sx={{ mb: 2 }}>
                                $180
                            </Typography>
                            <Typography variant="body2" fontWeight="bold" color="#D32F2F" sx={{ mb: 0.5 }}>
                                SECURITY DEPOSIT
                            </Typography>
                            <Typography variant="h6" fontWeight="bold" color="#D32F2F">
                                $2,699.99
                            </Typography>
                        </Box>
                    </Box>

                    {/* Rental Item 3 */}
                    <Box 
                        onClick={() => handleOrderClick({ id: '244523YTH', type: 'rent' })} 
                        sx={{ cursor: 'pointer', display: 'flex', gap: 2, p: 2, '&:hover': { bgcolor: '#fafafa' } }}
                    >
                        <Box 
                            component="img" 
                            src="https://demo.componentone.com/ASPNET/AdventureWorks/ProductImage.ashx?ProductID=3&size=large" 
                            sx={{ width: 100, height: 100, borderRadius: '10px', border: '1px solid #EEE', objectFit: 'contain', bgcolor: '#fff' }} 
                        />
                        <Box sx={{ flexGrow: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                <Typography fontWeight="bold" variant="subtitle1">Touring-1000 Blue, 46</Typography>
                                <Chip label="inspecting" sx={getStatusStyle('inspecting')} />
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Type: Blue</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Oct 12 - Oct 20, 2025</Typography>
                            <Button 
                                variant="outlined" 
                                size="small"
                                sx={{ 
                                    bgcolor: '#EEEEEE', 
                                    color: '#666',
                                    border: 'none',
                                    textTransform: 'none',
                                    borderRadius: '4px',
                                    px: 2,
                                    '&:hover': { bgcolor: '#E0E0E0', border: 'none' }
                                }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                }}
                            >
                                Rate this product
                            </Button>
                        </Box>
                        <Box sx={{ textAlign: 'right', minWidth: 200 }}>
                            <Typography variant="body2" fontWeight="bold" color="#D32F2F" sx={{ mb: 0.5 }}>
                                TOTAL RENTAL FEE
                            </Typography>
                            <Typography variant="h6" fontWeight="bold" color="#D32F2F" sx={{ mb: 2 }}>
                                $180
                            </Typography>
                            <Typography variant="body2" fontWeight="bold" color="#D32F2F" sx={{ mb: 0.5 }}>
                                SECURITY DEPOSIT
                            </Typography>
                            <Typography variant="h6" fontWeight="bold" color="#D32F2F">
                                $2,699.99
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                {/* Nút xem thêm dưới cùng */}
                <Box sx={{ textAlign: 'center', py: 1, borderTop: '1px solid #EEE' }}>
                    <IconButton size="small"><KeyboardArrowDownIcon /></IconButton>
                </Box>
            </Paper>
        </Box>
    );
};

export default OrderHistory;