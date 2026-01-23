import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  Card,
  CardContent,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Alert,
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import BuildIcon from '@mui/icons-material/Build';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import InfoIcon from '@mui/icons-material/Info';
import { getRentalConfig, updateRentalConfig } from '../../api/adminApi';
import CircularProgress from '@mui/material/CircularProgress';

const AdminRentalConfig = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    minRentalDays: '',
    maxRentalDays: '',
    defaultDepositRate: 80,
    overdueFeeRate: 150,
    cancellationPolicy: 'Flexible',
    rentDeduction: 100,
  });

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const response = await getRentalConfig();
      // API returns: {status, code, data: {duration_limits, deposit, penalty, rent_to_own}}
      const data = response.data?.data || response.data;
      
      if (data) {
        // Map API response structure to formData structure
        setFormData({
          minRentalDays: data.duration_limits?.min_days || '',
          maxRentalDays: data.duration_limits?.max_days || '',
          defaultDepositRate: data.deposit?.default_rate || 80,
          overdueFeeRate: data.penalty?.overdue_fee_rate || 150,
          cancellationPolicy: data.penalty?.cancellation_policy 
            ? data.penalty.cancellation_policy.charAt(0).toUpperCase() + data.penalty.cancellation_policy.slice(1) 
            : 'Flexible',
          rentDeduction: data.rent_to_own?.rent_deduction || 100,
        });
      }
    } catch (error) {
      console.error('Failed to load rental config:', error);
      // Keep default values on error
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
      setSaving(true);
      // Map formData to API request structure
      const payload = {
        duration_limits: {
          min_days: parseInt(formData.minRentalDays) || 1,
          max_days: parseInt(formData.maxRentalDays) || null
        },
        deposit: {
          default_rate: parseFloat(formData.defaultDepositRate) || 80.0
        },
        penalty: {
          overdue_fee_rate: parseFloat(formData.overdueFeeRate) || 150.0,
          cancellation_policy: formData.cancellationPolicy.toLowerCase() || 'flexible'
        },
        rent_to_own: {
          enabled: true, // Always enabled based on UI
          rent_deduction: parseFloat(formData.rentDeduction) || 100.0
        }
      };
      await updateRentalConfig(payload);
      alert('Configuration saved successfully');
    } catch (error) {
      console.error('Failed to save configuration:', error);
      alert(error?.response?.data?.detail || error?.message || 'Failed to save configuration');
    } finally {
      setSaving(false);
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
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 3, color: '#1A1A2E' }}>
        Rental Configuration
      </Typography>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* General Settings - Min/Max Rental Days */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <SettingsIcon sx={{ color: '#1976D2' }} />
                  <Typography variant="h6" fontWeight="bold">
                    General Settings
                  </Typography>
                </Box>
                <TextField
                  fullWidth
                  label="Min Rental Days"
                  type="number"
                  value={formData.minRentalDays}
                  onChange={handleChange('minRentalDays')}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Max Rental Days"
                  type="number"
                  value={formData.maxRentalDays}
                  onChange={handleChange('maxRentalDays')}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Default Deposit Rate */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <AccountBalanceWalletIcon sx={{ color: '#4CAF50' }} />
                  <Typography variant="h6" fontWeight="bold">
                    Default Deposit Rate
                  </Typography>
                </Box>
                <TextField
                  fullWidth
                  label="Deposit Rate"
                  type="number"
                  value={formData.defaultDepositRate}
                  onChange={handleChange('defaultDepositRate')}
                  InputProps={{
                    endAdornment: <Typography sx={{ ml: 1 }}>%</Typography>,
                  }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Percentage of bike value held as deposit
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Penalty & Cancellation */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <BuildIcon sx={{ color: '#F44336' }} />
                  <Typography variant="h6" fontWeight="bold">
                    Penalty & Cancellation
                  </Typography>
                </Box>
                <TextField
                  fullWidth
                  label="Overdue Fee Rate"
                  type="number"
                  value={formData.overdueFeeRate}
                  onChange={handleChange('overdueFeeRate')}
                  InputProps={{
                    endAdornment: <Typography sx={{ ml: 1 }}>% of Daily Rate</Typography>,
                  }}
                  sx={{ mb: 3 }}
                />
                <FormControl component="fieldset">
                  <FormLabel component="legend">Cancellation Refund Policy</FormLabel>
                  <RadioGroup
                    value={formData.cancellationPolicy}
                    onChange={(e) => setFormData({ ...formData, cancellationPolicy: e.target.value })}
                  >
                    <FormControlLabel
                      value="Flexible"
                      control={<Radio />}
                      label="Flexible: Free cancellation up to 24h before pickup."
                    />
                    <FormControlLabel
                      value="Moderate"
                      control={<Radio />}
                      label="Moderate: 50% refund up to 24h before pickup."
                    />
                    <FormControlLabel
                      value="Strict"
                      control={<Radio />}
                      label="Strict: No refund for cancellations."
                    />
                  </RadioGroup>
                </FormControl>
              </CardContent>
            </Card>
          </Grid>

          {/* Rent-to-Own Rules */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <ShoppingBagIcon sx={{ color: '#9C27B0' }} />
                  <Typography variant="h6" fontWeight="bold">
                    Rent-to-Own Rules
                  </Typography>
                </Box>
                <TextField
                  fullWidth
                  label="Rent Deduction"
                  type="number"
                  value={formData.rentDeduction}
                  onChange={handleChange('rentDeduction')}
                  InputProps={{
                    endAdornment: <Typography sx={{ ml: 1 }}>%</Typography>,
                  }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', mb: 2 }}>
                  If a customer buys the bike, this % of their rental fees is subtracted from the price.
                </Typography>
                <Alert icon={<InfoIcon />} severity="info">
                  This feature is currently active. Changes will apply to new rentals only.
                </Alert>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button variant="outlined" onClick={() => loadConfig()}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={saving}
                sx={{ backgroundColor: '#1976D2' }}
              >
                {saving ? <CircularProgress size={24} /> : 'Save'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};

export default AdminRentalConfig;
