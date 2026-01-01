import React, { useState } from 'react';
import {
    Box, Typography, Paper, Tabs, Tab, TextField, Select, MenuItem,
    InputAdornment, Chip, IconButton, Divider
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import OrderDetail from "./OrderDetail";

const OrderHistory = () => {
    const [activeTab, setActiveTab] = useState(0);
    const [statusFilter, setStatusFilter] = useState('All');

    // Danh sách trạng thái dựa trên Frame 1617.png
    const orderStatuses = [
        "All", "pending", "confirmed", "preparing", "shipped",
        "delivered", "cancel request", "cancelled",
        "return requested", "returning"
    ];

    // Style cho nhãn trạng thái (Chips) dựa trên Frame 1617.png
    const getStatusStyle = (status) => {
        return {
            backgroundColor: '#F5EFE6', // Màu beige nhạt
            color: '#4D4D4D',          // Màu chữ xám đậm
            border: '1px solid #D1D1D1',
            fontWeight: 'bold',
            borderRadius: '8px',
            textTransform: 'capitalize',
            height: '24px',
            fontSize: '0.75rem'
        };
    };
    const [selectedOrder, setSelectedOrder] = useState(null); // Lưu order đang được chọn
    if (selectedOrder) {
        return <OrderDetail order={selectedOrder} onBack={() => setSelectedOrder(null)} />;
    }

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
                <Box sx={{ p: 1 }}>
                    {/* Item 1 */}
                    <Box onClick={() => setSelectedOrder({ id: '244523YTH' })} sx={{ cursor: 'pointer', display: 'flex', gap: 2, p: 2, borderBottom: '1px solid #EEE' }}>
                        <Box component="img" src="https://via.placeholder.com/100" sx={{ width: 100, height: 100, borderRadius: '10px', border: '1px solid #EEE' }} />
                        <Box sx={{ flexGrow: 1 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography fontWeight="bold">Touring-1000 Blue, 46</Typography>
                                    <Chip label="pending" sx={getStatusStyle('pending')} />
                                </Box>
                                <Typography fontWeight="bold" color="#D32F2F">$2,384.07</Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary">Type: Blue</Typography>
                            <Typography variant="body2" color="text.secondary">x1</Typography>

                            {/* Thanh Rate product xám như trong ảnh */}
                            <Box sx={{ mt: 2, bgcolor: '#EEEEEE', py: 0.5, borderRadius: '4px', textAlign: 'center' }}>
                                <Typography variant="caption" color="text.secondary">Rate this product</Typography>
                            </Box>
                        </Box>
                    </Box>

                    {/* Item 2 */}
                    <Box sx={{ display: 'flex', gap: 2, p: 2 }}>
                        <Box component="img" src="https://via.placeholder.com/100" sx={{ width: 100, height: 100, borderRadius: '10px', border: '1px solid #EEE' }} />
                        <Box sx={{ flexGrow: 1 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography fontWeight="bold">OnBros Bike Helmet</Typography>
                                    <Chip label="preparing" sx={getStatusStyle('preparing')} />
                                </Box>
                                <Typography fontWeight="bold" color="#D32F2F">$49.00</Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary">x1</Typography>

                            <Box sx={{ mt: 2, bgcolor: '#EEEEEE', py: 0.5, borderRadius: '4px', textAlign: 'center' }}>
                                <Typography variant="caption" color="text.secondary">Rate this product</Typography>
                            </Box>
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