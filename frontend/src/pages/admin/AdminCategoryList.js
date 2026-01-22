import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  getAdminCategories,
  createAdminCategory,
  updateAdminCategory,
  deleteAdminCategory,
} from '../../api/adminApi';
import DataTable from '../../components/admin/DataTable';
import SearchFilterBar from '../../components/admin/SearchFilterBar';
import ConfirmDialog from '../../components/admin/ConfirmDialog';

const AdminCategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editCategory, setEditCategory] = useState(null);
  const [categoryName, setCategoryName] = useState('');
  const [deleteDialog, setDeleteDialog] = useState({ open: false, category: null });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await getAdminCategories();
      // API returns PagedResponse with structure: {status, code, data: [...], pagination}
      // Extract the actual array from response.data.data
      setCategories(response.data?.data || []);
    } catch (error) {
      console.error('Failed to load categories:', error);
      setCategories([]); // Set empty array on error to prevent filter errors
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (category = null) => {
    setEditCategory(category);
    setCategoryName(category?.name || '');
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditCategory(null);
    setCategoryName('');
  };

  const handleSave = async () => {
    try {
      if (editCategory) {
        await updateAdminCategory(editCategory.id, { name: categoryName });
      } else {
        await createAdminCategory({ name: categoryName });
      }
      loadCategories();
      handleCloseModal();
    } catch (error) {
      console.error('Failed to save category:', error);
      alert('Failed to save category');
    }
  };

  const handleDelete = async () => {
    if (deleteDialog.category) {
      try {
        await deleteAdminCategory(deleteDialog.category.id);
        loadCategories();
        setDeleteDialog({ open: false, category: null });
      } catch (error) {
        console.error('Failed to delete category:', error);
        alert('Failed to delete category');
      }
    }
  };

  const columns = [
    { id: 'name', label: 'CATEGORY NAME' },
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
              handleOpenModal(row);
            }}
            sx={{ color: '#FF9800' }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              setDeleteDialog({ open: true, category: row });
            }}
            sx={{ color: '#F44336' }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  const filteredCategories = (Array.isArray(categories) ? categories : []).filter((category) => {
    if (searchValue) {
      return category.name?.toLowerCase().includes(searchValue.toLowerCase());
    }
    return true;
  });

  const rows = filteredCategories.map((category) => ({
    id: category.id,
    name: category.name,
    ...category,
  }));

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight="bold" sx={{ color: '#1A1A2E' }}>
          Category Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenModal()}
          sx={{ backgroundColor: '#FF9800', '&:hover': { backgroundColor: '#F57C00' } }}
        >
          Add New Category
        </Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <SearchFilterBar
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          searchPlaceholder="Search categories..."
        />
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <DataTable columns={columns} rows={rows} emptyMessage="No categories found" />
      )}

      {/* Add/Edit Modal */}
      <Dialog open={modalOpen} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editCategory ? 'Edit Category' : 'Add New Category'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {editCategory
              ? 'Update the category name'
              : 'Create a new section for your bicycle inventory.'}
          </Typography>
          <TextField
            fullWidth
            label="Category Name"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Cancel</Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={!categoryName.trim()}
            sx={{ backgroundColor: '#FF9800' }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, category: null })}
        onConfirm={handleDelete}
        title="Confirm Deletion"
        message={`Are you sure you want to delete "${deleteDialog.category?.name}"?`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="error"
        type="delete"
      />
    </Box>
  );
};

export default AdminCategoryList;
