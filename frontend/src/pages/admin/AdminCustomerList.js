import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Chip,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { getAdminCustomers, updateCustomerStatus, getAdminCustomer } from '../../api/adminApi';
import DataTable from '../../components/admin/DataTable';
import SearchFilterBar from '../../components/admin/SearchFilterBar';
import StatusToggle from '../../components/admin/StatusToggle';
import StatusBadge from '../../components/admin/StatusBadge';
import AdminCustomerDetail from './AdminCustomerDetail';

const AdminCustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [totalCustomers, setTotalCustomers] = useState(0);

  useEffect(() => {
    loadCustomers();
  }, [statusFilter, searchValue]);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const response = await getAdminCustomers({ status: statusFilter, search: searchValue });
      // API returns PagedResponse with structure: {status, code, data: [...], pagination}
      // Extract the actual array from response.data.data
      const customersData = response.data?.data || [];
      setCustomers(customersData);
      // Use pagination total_items if available, otherwise use array length
      setTotalCustomers(response.data?.pagination?.total_items || customersData.length);
    } catch (error) {
      console.error('Failed to load customers:', error);
      setCustomers([]); // Set empty array on error to prevent filter errors
      setTotalCustomers(0);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (customerId, newStatus) => {
    try {
      await updateCustomerStatus(customerId, newStatus);
      loadCustomers();
    } catch (error) {
      console.error('Failed to update customer status:', error);
    }
  };

  const handleRowClick = async (customer) => {
    try {
      const response = await getAdminCustomer(customer.id);
      // API returns APIResponse with structure: {status, code, data: {...}}
      // Extract the actual customer object from response.data.data
      setSelectedCustomer(response.data?.data || response.data || null);
      setDetailModalOpen(true);
    } catch (error) {
      console.error('Failed to load customer details:', error);
    }
  };

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'banned', label: 'Banned' },
  ];

  const columns = [
    {
      id: 'name',
      label: 'CUSTOMER NAME',
      render: (value) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PersonIcon fontSize="small" sx={{ color: '#666' }} />
          <Typography variant="body2">{value}</Typography>
        </Box>
      ),
    },
    {
      id: 'phone',
      label: 'PHONE NUMBER',
      render: (value) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2">{value}</Typography>
        </Box>
      ),
    },
    {
      id: 'status',
      label: 'STATUS',
      render: (value, row) => (
        <StatusToggle
          checked={value === 'active'}
          onChange={(checked) =>
            handleStatusToggle(row.id, checked ? 'active' : 'banned')
          }
          label={checked => checked ? 'Active' : 'Banned'}
          checkedColor="#4CAF50"
          uncheckedColor="#F44336"
        />
      ),
    },
    {
      id: 'actions',
      label: '',
      render: (value, row) => (
        <IconButton onClick={(e) => { e.stopPropagation(); handleRowClick(row); }}>
          <ArrowForwardIosIcon fontSize="small" />
        </IconButton>
      ),
    },
  ];

  const filteredCustomers = (Array.isArray(customers) ? customers : []).filter((customer) => {
    if (searchValue) {
      const searchLower = searchValue.toLowerCase();
      return (
        customer.full_name?.toLowerCase().includes(searchLower) ||
        customer.phone?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const rows = filteredCustomers.map((customer) => {
    // Backend returns status as int: 1 = active, 0 = banned
    // Convert to string for StatusToggle component
    const statusStr = customer.status === 1 ? 'active' : 'banned';
    return {
      id: customer.id,
      name: customer.full_name || customer.name || 'N/A',
      phone: customer.phone || 'N/A',
      status: statusStr,
      ...customer,
    };
  });

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 3, color: '#1A1A2E' }}>
        Customer Management
      </Typography>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <PersonIcon sx={{ fontSize: '2.5rem', color: '#1976D2' }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Customer
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {totalCustomers}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mb: 3 }}>
        <SearchFilterBar
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          searchPlaceholder="Search customers..."
          filters={[
            {
              label: 'Status',
              value: statusFilter,
              onChange: setStatusFilter,
              options: statusOptions,
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
          columns={columns}
          rows={rows}
          onRowClick={handleRowClick}
          emptyMessage="No customers found"
        />
      )}

      <Dialog
        open={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Customer Details</Typography>
            <IconButton onClick={() => setDetailModalOpen(false)}>×</IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedCustomer && <AdminCustomerDetail customer={selectedCustomer} />}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default AdminCustomerList;
