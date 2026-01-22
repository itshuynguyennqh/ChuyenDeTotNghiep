import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  IconButton,
  CircularProgress,
  Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PercentIcon from '@mui/icons-material/Percent';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { getAdminPromotions, deleteAdminPromotion } from '../../api/adminApi';
import DataTable from '../../components/admin/DataTable';
import SearchFilterBar from '../../components/admin/SearchFilterBar';
import StatusBadge from '../../components/admin/StatusBadge';
import ConfirmDialog from '../../components/admin/ConfirmDialog';

const AdminPromotionList = () => {
  const navigate = useNavigate();
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [deleteDialog, setDeleteDialog] = useState({ open: false, promotion: null });

  useEffect(() => {
    loadPromotions();
  }, [statusFilter, typeFilter]);

  const loadPromotions = async () => {
    try {
      setLoading(true);
      const response = await getAdminPromotions({ status: statusFilter, type: typeFilter, search: searchValue });
      // API returns PagedResponse with structure: {status, code, data: [...], pagination}
      // Extract the actual array from response.data.data
      setPromotions(response.data?.data || []);
    } catch (error) {
      console.error('Failed to load promotions:', error);
      setPromotions([]); // Set empty array on error to prevent filter errors
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (deleteDialog.promotion) {
      try {
        await deleteAdminPromotion(deleteDialog.promotion.id);
        loadPromotions();
        setDeleteDialog({ open: false, promotion: null });
      } catch (error) {
        console.error('Failed to delete promotion:', error);
        alert('Failed to delete promotion');
      }
    }
  };

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'draft', label: 'Draft' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'paused', label: 'Paused' },
    { value: 'expired', label: 'Expired' },
    { value: 'limit_reached', label: 'Limit Reached' },
  ];

  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'percentage', label: 'Percentage' },
    { value: 'fixed', label: 'Fixed Amount' },
  ];

  const columns = [
    { id: 'name', label: 'PROMOTION NAME' },
    { id: 'code', label: 'CODE' },
    {
      id: 'value',
      label: 'VALUE',
      render: (value, row) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {row.valueType === 'percentage' ? (
            <>
              <PercentIcon fontSize="small" />
              <Typography>{row.value}% OFF</Typography>
            </>
          ) : (
            <>
              <AttachMoneyIcon fontSize="small" />
              <Typography>{row.value} Fixed</Typography>
            </>
          )}
        </Box>
      ),
    },
    {
      id: 'quantityLimit',
      label: 'QUANTITY LIMIT',
      render: (value) => value === 'unlimited' || value === 0 ? 'Unlimited' : value,
    },
    {
      id: 'duration',
      label: 'DURATION',
      render: (value, row) =>
        row.duration?.to ? (
          <Typography variant="body2">
            {new Date(row.duration.from).toLocaleDateString()} to{' '}
            {new Date(row.duration.to).toLocaleDateString()}
          </Typography>
        ) : (
          new Date(row.duration?.from || row.duration).toLocaleDateString()
        ),
    },
    {
      id: 'condition',
      label: 'CONDITIONS',
      render: (value) => (
        <Chip
          label={value === 'Diamond' ? 'Diamond Only' : 'Gold Only'}
          size="small"
          sx={{
            backgroundColor: '#FFF9C4',
            color: '#F57F17',
          }}
        />
      ),
    },
    {
      id: 'status',
      label: 'STATUS',
      render: (value) => <StatusBadge status={value} />,
    },
    {
      id: 'actions',
      label: 'ACTIONS',
      align: 'center',
      render: (value, row) => (
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/admin/promotions/edit/${row.id}`);
            }}
            sx={{ color: '#FF9800' }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              setDeleteDialog({ open: true, promotion: row });
            }}
            sx={{ color: '#F44336' }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  const filteredPromotions = (Array.isArray(promotions) ? promotions : []).filter((promotion) => {
    if (searchValue) {
      const searchLower = searchValue.toLowerCase();
      return (
        promotion.name?.toLowerCase().includes(searchLower) ||
        promotion.code?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const rows = filteredPromotions.map((promotion) => ({
    id: promotion.id,
    name: promotion.name,
    code: promotion.code,
    value: promotion.value,
    valueType: promotion.valueType,
    quantityLimit: promotion.quantityLimit,
    duration: promotion.duration,
    condition: promotion.condition,
    status: promotion.status,
    ...promotion,
  }));

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight="bold" sx={{ color: '#1A1A2E' }}>
          Promotion Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/admin/promotions/add')}
          sx={{ backgroundColor: '#FF9800', '&:hover': { backgroundColor: '#F57C00' } }}
        >
          Add new promotion
        </Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <SearchFilterBar
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          searchPlaceholder="Search promotions..."
          filters={[
            {
              label: 'Status',
              value: statusFilter,
              onChange: setStatusFilter,
              options: statusOptions,
            },
            {
              label: 'Type',
              value: typeFilter,
              onChange: setTypeFilter,
              options: typeOptions,
            },
          ]}
        />
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <DataTable columns={columns} rows={rows} emptyMessage="No promotions found" />
      )}

      <ConfirmDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, promotion: null })}
        onConfirm={handleDelete}
        title="Confirm Deletion"
        message={`Are you sure you want to delete "${deleteDialog.promotion?.name}"?`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="error"
        type="delete"
      />
    </Box>
  );
};

export default AdminPromotionList;
