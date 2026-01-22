import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  IconButton,
  CircularProgress,
  Avatar,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import StarIcon from '@mui/icons-material/Star';
import { getAdminProducts, deleteAdminProduct } from '../../api/adminApi';
import DataTable from '../../components/admin/DataTable';
import SearchFilterBar from '../../components/admin/SearchFilterBar';
import StatusBadge from '../../components/admin/StatusBadge';
import ConfirmDialog from '../../components/admin/ConfirmDialog';

const AdminProductList = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteDialog, setDeleteDialog] = useState({ open: false, product: null });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await getAdminProducts({ status: statusFilter, search: searchValue });
      // API returns PagedResponse with structure: {status, code, data: [...], pagination}
      // Extract the actual array from response.data.data
      setProducts(response.data?.data || []);
    } catch (error) {
      console.error('Failed to load products:', error);
      setProducts([]); // Set empty array on error to prevent filter errors
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [statusFilter]);

  const handleDelete = async () => {
    if (deleteDialog.product) {
      try {
        await deleteAdminProduct(deleteDialog.product.id);
        loadProducts();
        setDeleteDialog({ open: false, product: null });
      } catch (error) {
        console.error('Failed to delete product:', error);
        alert('Failed to delete product');
      }
    }
  };

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'in_stock', label: 'In Stock' },
    { value: 'low_stock', label: 'Low Stock' },
    { value: 'out_of_stock', label: 'Out Of Stock' },
    { value: 'rented_out', label: 'Rented Out' },
  ];

  const getStatusLabel = (status) => {
    const statusMap = {
      in_stock: 'In Stock',
      low_stock: 'Low Stock',
      out_of_stock: 'Out Of Stock',
      rented_out: 'Rented Out',
    };
    return statusMap[status] || status;
  };

  const columns = [
    {
      id: 'image',
      label: 'Image',
      render: (value, row) => (
        <Avatar
          src={row.image || '/placeholder.png'}
          alt={row.name}
          variant="rounded"
          sx={{ width: 56, height: 56 }}
        />
      ),
    },
    {
      id: 'name',
      label: 'Product Name',
      render: (value) => <Typography variant="body2" fontWeight="bold">{value}</Typography>,
    },
    {
      id: 'price',
      label: 'Price',
      render: (value, row) => (
        <Box>
          <Typography variant="body2">
            Sell: ${parseFloat(row.sellPrice || 0).toFixed(2)}
          </Typography>
          {row.rentPrice && (
            <Typography variant="caption" color="text.secondary">
              Rent: ${parseFloat(row.rentPrice).toFixed(2)}/days
            </Typography>
          )}
        </Box>
      ),
    },
    {
      id: 'rate',
      label: 'Rate',
      render: (value) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <StarIcon sx={{ fontSize: '1rem', color: '#FFC107' }} />
          <Typography variant="body2">{value || 'N/A'}</Typography>
        </Box>
      ),
    },
    {
      id: 'stock',
      label: 'Stock',
      render: (value, row) => (
        <Box>
          <Typography variant="body2">
            Total: {row.totalStock || 0}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Avail: {row.availableStock || 0}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'status',
      label: 'Status',
      render: (value) => <StatusBadge status={value} />,
    },
    {
      id: 'actions',
      label: 'Actions',
      align: 'center',
      render: (value, row) => (
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/admin/products/edit/${row.id}`);
            }}
            sx={{ color: '#FF9800' }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              setDeleteDialog({ open: true, product: row });
            }}
            sx={{ color: '#F44336' }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  const filteredProducts = (Array.isArray(products) ? products : []).filter((product) => {
    if (searchValue) {
      const searchLower = searchValue.toLowerCase();
      return (
        product.name?.toLowerCase().includes(searchLower) ||
        product.category?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const rows = filteredProducts.map((product) => ({
    id: product.id,
    image: product.image,
    name: product.name,
    price: product.sellPrice,
    rate: product.rate,
    stock: product.totalStock,
    status: product.status,
    ...product,
  }));

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight="bold" sx={{ color: '#1A1A2E' }}>
          Product Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/admin/products/add')}
          sx={{ backgroundColor: '#FF9800', '&:hover': { backgroundColor: '#F57C00' } }}
        >
          Add new product
        </Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <SearchFilterBar
          searchValue={searchValue}
          onSearchChange={(value) => {
            setSearchValue(value);
            // Debounce search or search on Enter
          }}
          searchPlaceholder="Search products..."
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
        <DataTable columns={columns} rows={rows} emptyMessage="No products found" />
      )}

      <ConfirmDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, product: null })}
        onConfirm={handleDelete}
        title="Confirm Deletion"
        message={`Are you sure you want to delete "${deleteDialog.product?.name}"?`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="error"
        type="delete"
      />
    </Box>
  );
};

export default AdminProductList;
