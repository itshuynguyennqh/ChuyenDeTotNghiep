import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  Paper,
  IconButton,
  CircularProgress,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { getAdminPromotion, updateAdminPromotion } from '../../api/adminApi';

const AdminPromotionEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    valueType: 'percentage',
    value: '',
    quantityLimit: '',
    duration: '',
    condition: '',
    status: 'draft',
  });

  useEffect(() => {
    loadPromotion();
  }, [id]);

  const loadPromotion = async () => {
    try {
      setLoading(true);
      const response = await getAdminPromotion(id);
      const p = response.data?.data || response.data;
      const dc = p.discount_config || {};
      const valueType = dc.type === 'amount' ? 'fixed' : (dc.type || 'percentage');
      // Handle value: if it's 0, still show "0", don't convert to empty string
      const value = dc.value != null && dc.value !== '' ? String(dc.value) : '';
      const quantityLimit = p.quantity != null ? String(p.quantity) : '';
      let duration = '';
      if (p.start_date && p.end_date) {
        const start = new Date(p.start_date);
        const end = new Date(p.end_date);
        const days = Math.round((end - start) / (1000 * 60 * 60 * 24));
        duration = days > 0 ? String(days) : '';
      }
      const condition = p.min_order_amount != null && Number(p.min_order_amount) > 0
        ? String(p.min_order_amount)
        : '';
      const status = p.status === true ? 'active' : 'draft';
      setFormData({
        name: p.name || '',
        code: p.code || '',
        valueType,
        value,
        quantityLimit,
        duration,
        condition,
        status,
      });
    } catch (error) {
      console.error('Failed to load promotion:', error);
      alert('Failed to load promotion details');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validate value is provided and not empty
      const discountValue = parseFloat(formData.value);
      if (isNaN(discountValue) || discountValue < 0) {
        alert('Please enter a valid discount value (must be a positive number)');
        return;
      }
      
      const payload = {
        name: formData.name.trim(),
        code: formData.code.trim(),
        discount_config: {
          type: formData.valueType === 'fixed' ? 'amount' : 'percentage',
          value: discountValue,
        },
        status: formData.status === 'active' || formData.status === 'scheduled',
      };
      if (formData.quantityLimit !== '' && formData.quantityLimit != null) {
        const q = parseInt(formData.quantityLimit, 10);
        if (!Number.isNaN(q) && q >= 0) payload.quantity = q;
      }
      // Add min_order_amount if condition field has a value
      if (formData.condition !== '' && formData.condition != null) {
        const minOrder = parseFloat(formData.condition);
        if (!Number.isNaN(minOrder) && minOrder >= 0) {
          payload.min_order_amount = minOrder;
        }
      } else {
        // If condition is empty, set min_order_amount to 0 (no minimum)
        payload.min_order_amount = 0;
      }
      await updateAdminPromotion(id, payload);
      navigate('/admin/promotions');
    } catch (error) {
      console.error('Failed to update promotion:', error);
      const detail = error?.response?.data?.detail;
      const msg = Array.isArray(detail) ? detail.map((x) => x?.msg ?? JSON.stringify(x)).join(', ') : (detail || 'Failed to update promotion');
      alert(msg);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <IconButton onClick={() => navigate('/admin/promotions')}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" fontWeight="bold" sx={{ color: '#1A1A2E' }}>
          Edit Promotion
        </Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Update the promotion details below.
      </Typography>

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Promotion Name"
                value={formData.name}
                onChange={handleChange('name')}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Promotion Code"
                value={formData.code}
                onChange={handleChange('code')}
                required
                placeholder="e.g., SUMMER2024"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Value Type"
                value={formData.valueType}
                onChange={handleChange('valueType')}
                required
              >
                <MenuItem value="percentage">Percentage (%)</MenuItem>
                <MenuItem value="fixed">Fixed Amount ($)</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Value"
                type="number"
                value={formData.value}
                onChange={handleChange('value')}
                required
                InputProps={{
                  endAdornment: formData.valueType === 'percentage' ? '%' : '$',
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Quantity Limit"
                type="number"
                value={formData.quantityLimit}
                onChange={handleChange('quantityLimit')}
                placeholder="Leave empty for unlimited"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Duration (days)"
                type="number"
                value={formData.duration}
                onChange={handleChange('duration')}
                placeholder="How long the promotion is valid"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Condition"
                value={formData.condition}
                onChange={handleChange('condition')}
                multiline
                rows={2}
                placeholder="e.g., Minimum purchase of $100"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Status"
                value={formData.status}
                onChange={handleChange('status')}
                required
              >
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="scheduled">Scheduled</MenuItem>
                <MenuItem value="paused">Paused</MenuItem>
                <MenuItem value="expired">Expired</MenuItem>
                <MenuItem value="limit_reached">Limit Reached</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button variant="outlined" onClick={() => navigate('/admin/promotions')}>
                  Cancel
                </Button>
                <Button type="submit" variant="contained" sx={{ backgroundColor: '#FF9800' }}>
                  Save
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default AdminPromotionEdit;
