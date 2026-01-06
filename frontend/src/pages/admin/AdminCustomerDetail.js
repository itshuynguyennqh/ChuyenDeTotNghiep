import React from 'react';
import { Box, Typography, Grid, Card, CardContent, Chip } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import StatusToggle from '../../components/admin/StatusToggle';
import StatusBadge from '../../components/admin/StatusBadge';
import DataTable from '../../components/admin/DataTable';

const AdminCustomerDetail = ({ customer, onStatusChange }) => {
  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  const orderColumns = [
    { id: 'id', label: 'ORDER ID' },
    { id: 'type', label: 'TYPE' },
    { id: 'date', label: 'DATE' },
    { id: 'items', label: 'ITEMS' },
    {
      id: 'status',
      label: 'STATUS',
      render: (value) => <StatusBadge status={value} />,
    },
    { id: 'total', label: 'TOTAL AMOUNT', align: 'right' },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <PersonIcon sx={{ fontSize: '3rem' }} />
        <Box>
          <Typography variant="h5" fontWeight="bold">
            {customer.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {customer.phone}
          </Typography>
          <Chip
            label={customer.memberTier || 'Gold Member'}
            sx={{
              backgroundColor: customer.memberTier === 'Diamond' ? '#1976D2' : '#FFC107',
              color: 'white',
              mt: 1,
            }}
          />
        </Box>
        <Box sx={{ ml: 'auto' }}>
          <StatusToggle
            checked={customer.status === 'active'}
            onChange={(checked) => onStatusChange && onStatusChange(customer.id, checked ? 'active' : 'banned')}
            label={checked => checked ? 'Active' : 'Banned'}
          />
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Total Spending
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                ${customer.totalSpending?.toFixed(2) || '0.00'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Total Orders
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                {customer.totalOrders || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
        Order History
      </Typography>
      <DataTable
        columns={orderColumns}
        rows={
          customer.orders?.map((order) => ({
            id: order.id,
            type: order.type,
            date: new Date(order.date).toLocaleDateString(),
            items: order.items,
            status: order.status,
            total: `$${parseFloat(order.total).toFixed(2)}`,
          })) || []
        }
        emptyMessage="No orders found"
      />
    </Box>
  );
};

export default AdminCustomerDetail;
