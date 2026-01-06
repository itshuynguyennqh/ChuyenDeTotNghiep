import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  Card,
  CardContent,
  TextField,
  MenuItem,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PrintIcon from '@mui/icons-material/Print';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import HomeIcon from '@mui/icons-material/Home';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import { getAdminOrder, updateOrderStatus } from '../../api/adminApi';
import StatusBadge from '../../components/admin/StatusBadge';
import DataTable from '../../components/admin/DataTable';

const AdminOrderDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newStatus, setNewStatus] = useState('');
  const [prepareModalOpen, setPrepareModalOpen] = useState(false);
  const [prepareData, setPrepareData] = useState({ bikeItem: '', description: '', photos: [] });

  useEffect(() => {
    loadOrder();
  }, [id]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const response = await getAdminOrder(id);
      const orderData = response.data;
      setOrder(orderData);
      setNewStatus(orderData.status);
    } catch (error) {
      console.error('Failed to load order:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    try {
      await updateOrderStatus(id, newStatus);
      loadOrder();
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update status');
    }
  };

  const isPurchaseOrder = order?.type === 'purchase';
  const isRentalOrder = order?.type === 'rental';

  const statusOptions = isPurchaseOrder
    ? [
        { value: 'pending', label: 'Pending' },
        { value: 'confirmed', label: 'Confirmed' },
        { value: 'preparing', label: 'Preparing' },
        { value: 'shipped', label: 'Shipped' },
        { value: 'delivered', label: 'Delivered' },
        { value: 'cancelled', label: 'Cancelled' },
      ]
    : [
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!order) {
    return <Typography>Order not found</Typography>;
  }

  const itemColumns = isPurchaseOrder
    ? [
        { id: 'product', label: 'PRODUCT' },
        { id: 'price', label: 'PRICE', align: 'right' },
        { id: 'quantity', label: 'QUANTITY', align: 'right' },
        { id: 'total', label: 'TOTAL', align: 'right' },
      ]
    : [
        { id: 'product', label: 'PRODUCT' },
        { id: 'condition', label: 'CONDITION AT PICKUP' },
        { id: 'dailyRate', label: 'DAILY RATE', align: 'right' },
        { id: 'quantity', label: 'QUANTITY', align: 'right' },
        { id: 'total', label: 'TOTAL', align: 'right' },
      ];

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <IconButton onClick={() => navigate('/admin/orders')}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" fontWeight="bold" sx={{ color: '#1A1A2E' }}>
          {order.id}
        </Typography>
        <StatusBadge status={order.status} />
      </Box>

      {order.cancellationRequested && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Cancellation Requested - Customer requested to cancel this order on{' '}
          {new Date(order.cancellationRequestedDate).toLocaleDateString()}
          <Button sx={{ ml: 2 }} onClick={() => {/* Handle review cancellation */}}>
            Review Cancellation Request
          </Button>
        </Alert>
      )}

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Placed on {new Date(order.createdAt).toLocaleString()}
      </Typography>

      <Grid container spacing={3}>
        {/* Update Status Card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2 }}>
                Update Status
              </Typography>
              <TextField
                fullWidth
                select
                label="Update Order Status"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                size="small"
                sx={{ mb: 2 }}
              >
                {statusOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
              <Button
                fullWidth
                variant="contained"
                onClick={handleStatusUpdate}
                sx={{ mb: 2, backgroundColor: '#1976D2' }}
              >
                Update
              </Button>
              {isRentalOrder && order.status === 'preparing' && (
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => setPrepareModalOpen(true)}
                  sx={{ backgroundColor: '#FF9800' }}
                >
                  Prepare for Pickup
                </Button>
              )}
              {isRentalOrder && order.status === 'renting' && (
                <Button fullWidth variant="contained" sx={{ backgroundColor: '#FF9800', mt: 1 }}>
                  Return Request
                </Button>
              )}
              {order.status === 'overdue' && (
                <Button fullWidth variant="contained" color="error" sx={{ mt: 1 }}>
                  Report an Issue
                </Button>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Customer Card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2 }}>
                Customer
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <PersonIcon fontSize="small" />
                <Typography>{order.customer?.name || 'N/A'}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <PhoneIcon fontSize="small" />
                <Typography>{order.customer?.phone || 'N/A'}</Typography>
              </Box>
              {order.customer?.address && (
                <>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <HomeIcon fontSize="small" />
                    <Typography variant="body2">{order.customer.address.label}</Typography>
                  </Box>
                  <Typography variant="body2" sx={{ ml: 4 }}>
                    {order.customer.address.street}
                  </Typography>
                  <Typography variant="body2" sx={{ ml: 4 }}>
                    {order.customer.address.city}, {order.customer.address.state}{' '}
                    {order.customer.address.zipCode}
                  </Typography>
                  <Typography variant="body2" sx={{ ml: 4 }}>
                    {order.customer.address.country}
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Rental Period Card (for rental orders) */}
        {isRentalOrder && order.rentalPeriod && (
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2 }}>
                  Rental Period
                </Typography>
                <Typography variant="body2">
                  {new Date(order.rentalPeriod.start).toLocaleDateString()} to{' '}
                  {new Date(order.rentalPeriod.end).toLocaleDateString()}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Duration {order.rentalPeriod.duration || 5} days
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Order Items */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
          {isPurchaseOrder ? 'Order Items' : 'Rental Items'} ({order.items?.length || 0})
        </Typography>
        <DataTable
          columns={itemColumns}
          rows={
            order.items?.map((item) => ({
              id: item.id,
              product: (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    component="img"
                    src={item.image || '/placeholder.png'}
                    alt={item.name}
                    sx={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 1 }}
                  />
                  <Box>
                    <Typography variant="body2" fontWeight="bold">
                      {item.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {item.details || item.variant}
                    </Typography>
                  </Box>
                </Box>
              ),
              condition: item.conditionAtPickup ? (
                <Box>
                  <Typography variant="body2">{item.conditionAtPickup}</Typography>
                  {item.pickupPhotos && item.pickupPhotos.length > 0 && (
                    <Button
                      size="small"
                      startIcon={<CameraAltIcon />}
                      onClick={() => {/* View photos */}}
                    >
                      View {item.pickupPhotos.length} pickup photos
                    </Button>
                  )}
                </Box>
              ) : (
                'N/A'
              ),
              price: `$${parseFloat(item.price || 0).toFixed(2)}`,
              dailyRate: `$${parseFloat(item.dailyRate || 0).toFixed(2)}`,
              quantity: item.quantity || 1,
              total: `$${parseFloat(item.total || item.price * (item.quantity || 1)).toFixed(2)}`,
            })) || []
          }
          emptyMessage="No items"
        />
      </Paper>

      {/* Order Summary */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
          Order Summary
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography>
                {isPurchaseOrder ? 'Subtotal' : 'Rental Subtotal'}
              </Typography>
              <Typography>${parseFloat(order.subtotal || 0).toFixed(2)}</Typography>
            </Box>
            {isPurchaseOrder && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Shipping</Typography>
                <Typography>${parseFloat(order.shipping || 0).toFixed(2)}</Typography>
              </Box>
            )}
            {isRentalOrder && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Security Deposit</Typography>
                <Typography>${parseFloat(order.securityDeposit || 0).toFixed(2)}</Typography>
              </Box>
            )}
            {order.discount > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography sx={{ color: '#4CAF50' }}>
                  Discount (Coupon)
                </Typography>
                <Typography sx={{ color: '#4CAF50' }}>
                  -${parseFloat(order.discount).toFixed(2)}
                </Typography>
              </Box>
            )}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, pt: 2, borderTop: '1px solid #e0e0e0' }}>
              <Typography variant="h6" fontWeight="bold">
                Grand Total
              </Typography>
              <Typography variant="h6" fontWeight="bold">
                ${parseFloat(order.grandTotal || order.total || 0).toFixed(2)}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
        <Button
          variant="outlined"
          startIcon={<PrintIcon />}
          onClick={() => {/* View invoice */}}
        >
          View Invoice
        </Button>
      </Box>

      {/* Prepare for Pickup Modal */}
      <Dialog open={prepareModalOpen} onClose={() => setPrepareModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Prepare for Pickup</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            select
            label="Select Bike Item"
            value={prepareData.bikeItem}
            onChange={(e) => setPrepareData({ ...prepareData, bikeItem: e.target.value })}
            sx={{ mb: 2, mt: 1 }}
          >
            <MenuItem value="bike1">Bike Item 1</MenuItem>
          </TextField>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Description"
            value={prepareData.description}
            onChange={(e) => setPrepareData({ ...prepareData, description: e.target.value })}
            placeholder="No scratches whatsoever."
            sx={{ mb: 2 }}
          />
          <Typography variant="body2" sx={{ mb: 1 }}>
            Photo Evidence
          </Typography>
          <input type="file" accept="image/*" multiple />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPrepareModalOpen(false)}>Cancel</Button>
          <Button variant="contained" sx={{ backgroundColor: '#FF9800' }}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminOrderDetail;
