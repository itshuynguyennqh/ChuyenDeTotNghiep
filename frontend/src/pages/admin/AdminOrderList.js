import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  IconButton,
  CircularProgress,
} from '@mui/material';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { getAdminOrders } from '../../api/adminApi';
import DataTable from '../../components/admin/DataTable';
import SearchFilterBar from '../../components/admin/SearchFilterBar';
import StatusBadge from '../../components/admin/StatusBadge';

const AdminOrderList = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadOrders();
  }, [tabValue, statusFilter]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const type = tabValue === 0 ? 'purchase' : 'rental';
      const response = await getAdminOrders(type, { status: statusFilter, search: searchValue });
      // API returns PagedResponse with structure: {status, code, data: [...], pagination}
      // Extract the actual array from response.data.data
      setOrders(response.data?.data || []);
    } catch (error) {
      console.error('Failed to load orders:', error);
      setOrders([]); // Set empty array on error to prevent filter errors
    } finally {
      setLoading(false);
    }
  };

  const orderStatusOptions = [
    { value: 'all', label: 'All status' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'preparing', label: 'Preparing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  const rentalStatusOptions = [
    { value: 'all', label: 'All status' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'preparing', label: 'Preparing' },
    { value: 'renting', label: 'Renting' },
    { value: 'overdue', label: 'Overdue' },
    { value: 'returning', label: 'Returning' },
    { value: 'inspecting', label: 'Inspecting' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  const purchaseColumns = [
    { id: 'id', label: 'ORDER ID' },
    { id: 'total', label: 'TOTAL', align: 'right' },
    {
      id: 'status',
      label: 'STATUS',
      render: (value) => <StatusBadge status={value} />,
    },
    {
      id: 'actions',
      label: '',
      render: (value, row) => (
        <IconButton onClick={() => navigate(`/admin/orders/${row.id}`)}>
          <ArrowForwardIosIcon fontSize="small" />
        </IconButton>
      ),
    },
  ];

  const rentalColumns = [
    { id: 'id', label: 'ORDER ID' },
    {
      id: 'rentalPeriod',
      label: 'RENTAL PERIOD',
      render: (value, row) =>
        row.rentalPeriod ? (
          <Typography variant="body2">
            {new Date(row.rentalPeriod.start).toLocaleDateString()} to{' '}
            {new Date(row.rentalPeriod.end).toLocaleDateString()}
          </Typography>
        ) : (
          'N/A'
        ),
    },
    { id: 'total', label: 'TOTAL', align: 'right' },
    {
      id: 'status',
      label: 'STATUS',
      render: (value) => <StatusBadge status={value} />,
    },
    {
      id: 'actions',
      label: '',
      render: (value, row) => (
        <IconButton onClick={() => navigate(`/admin/orders/${row.id}`)}>
          <ArrowForwardIosIcon fontSize="small" />
        </IconButton>
      ),
    },
  ];

  const filteredOrders = (Array.isArray(orders) ? orders : []).filter((order) => {
    if (searchValue) {
      const searchLower = searchValue.toLowerCase();
      return order.id?.toLowerCase().includes(searchLower);
    }
    return true;
  });

  const rows = filteredOrders.map((order) => ({
    id: order.id,
    total: `$${parseFloat(order.total || 0).toFixed(2)}`,
    status: order.status,
    rentalPeriod: order.rentalPeriod,
    ...order,
  }));

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 3, color: '#1A1A2E' }}>
        Order Management
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Purchase Orders" sx={{ textTransform: 'none' }} />
          <Tab label="Rental Orders" sx={{ textTransform: 'none' }} />
        </Tabs>
      </Box>

      <Box sx={{ mb: 3 }}>
        <SearchFilterBar
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          searchPlaceholder="Search orders..."
          filters={[
            {
              label: 'Status',
              value: statusFilter,
              onChange: setStatusFilter,
              options: tabValue === 0 ? orderStatusOptions : rentalStatusOptions,
            },
          ]}
        />
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <DataTable
          columns={tabValue === 0 ? purchaseColumns : rentalColumns}
          rows={rows}
          onRowClick={(row) => navigate(`/admin/orders/${row.id}`)}
          emptyMessage="No orders found"
        />
      )}
    </Box>
  );
};

export default AdminOrderList;
