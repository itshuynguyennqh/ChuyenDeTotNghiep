import React from 'react';
import { Grid, Paper, Typography, Box } from '@mui/material';

const StatCard = ({ title, value, color }) => (
    <Paper elevation={3} sx={{ p: 3, display: 'flex', flexDirection: 'column', height: 140, justifyContent: 'center', borderLeft: `5px solid ${color}` }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
            {title}
        </Typography>
        <Typography variant="h3" fontWeight="bold">
            {value}
        </Typography>
    </Paper>
);

const AdminDashboard = () => {
    return (
        <Box>
            <Typography variant="h4" gutterBottom fontWeight="bold" sx={{ mb: 4 }}>
                Dashboard Overview
            </Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard title="Total Orders" value="1,234" color="#1976d2" />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard title="Total Revenue" value="$45,678" color="#2e7d32" />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard title="New Customers" value="89" color="#ed6c02" />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard title="Pending Orders" value="12" color="#d32f2f" />
                </Grid>
            </Grid>
            
            {/* Có thể thêm biểu đồ hoặc bảng đơn hàng mới nhất ở đây */}
        </Box>
    );
};

export default AdminDashboard;