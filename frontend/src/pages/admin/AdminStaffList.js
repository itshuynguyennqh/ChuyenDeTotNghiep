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
  Grid,
  Card,
  CardContent,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import InventoryIcon from '@mui/icons-material/Inventory';
import {
  getAdminStaff,
  createAdminStaff,
  updateAdminStaff,
  deleteAdminStaff,
} from '../../api/adminApi';
import DataTable from '../../components/admin/DataTable';
import SearchFilterBar from '../../components/admin/SearchFilterBar';
import StatusBadge from '../../components/admin/StatusBadge';
import ConfirmDialog from '../../components/admin/ConfirmDialog';

const AdminStaffList = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editStaff, setEditStaff] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    password: '',
    role: 'Order Staff',
    status: 'active',
  });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, staff: null });

  useEffect(() => {
    loadStaff();
  }, [roleFilter, statusFilter]);

  const loadStaff = async () => {
    try {
      setLoading(true);
      const response = await getAdminStaff({ role: roleFilter, status: statusFilter, search: searchValue });
      setStaff(response.data);
    } catch (error) {
      console.error('Failed to load staff:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (staffMember = null) => {
    if (staffMember) {
      setEditStaff(staffMember);
      setFormData({
        fullName: staffMember.fullName || '',
        phone: staffMember.phone || '',
        email: staffMember.email || '',
        password: '',
        role: staffMember.role || 'Order Staff',
        status: staffMember.status || 'active',
      });
    } else {
      setEditStaff(null);
      setFormData({
        fullName: '',
        phone: '',
        email: '',
        password: '',
        role: 'Order Staff',
        status: 'active',
      });
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditStaff(null);
    setFormData({
      fullName: '',
      phone: '',
      email: '',
      password: '',
      role: 'Order Staff',
      status: 'active',
    });
  };

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleSave = async () => {
    try {
      if (editStaff) {
        await updateAdminStaff(editStaff.id, formData);
      } else {
        await createAdminStaff(formData);
      }
      loadStaff();
      handleCloseModal();
    } catch (error) {
      console.error('Failed to save staff:', error);
      alert('Failed to save staff');
    }
  };

  const handleDelete = async () => {
    if (deleteDialog.staff) {
      try {
        await deleteAdminStaff(deleteDialog.staff.id);
        loadStaff();
        setDeleteDialog({ open: false, staff: null });
      } catch (error) {
        console.error('Failed to delete staff:', error);
        alert('Failed to delete staff');
      }
    }
  };

  const roleOptions = [
    { value: 'all', label: 'All Roles' },
    { value: 'Order Staff', label: 'Order Staff' },
    { value: 'Product Staff', label: 'Product Staff' },
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ];

  const columns = [
    {
      id: 'fullName',
      label: 'FULL NAME',
      render: (value) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PersonIcon fontSize="small" sx={{ color: '#666' }} />
          <Typography variant="body2">{value}</Typography>
        </Box>
      ),
    },
    { id: 'phone', label: 'PHONE NUMBER' },
    { id: 'email', label: 'LOGIN ACCOUNT' },
    {
      id: 'role',
      label: 'ROLE',
      render: (value) => (
        <Box
          sx={{
            display: 'inline-block',
            px: 2,
            py: 0.5,
            borderRadius: 1,
            backgroundColor: value === 'Order Staff' ? '#E1BEE7' : '#BBDEFB',
            color: value === 'Order Staff' ? '#7B1FA2' : '#1976D2',
            fontWeight: 500,
          }}
        >
          {value}
        </Box>
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
              setDeleteDialog({ open: true, staff: row });
            }}
            sx={{ color: '#F44336' }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  const filteredStaff = staff.filter((member) => {
    if (searchValue) {
      const searchLower = searchValue.toLowerCase();
      return (
        member.fullName?.toLowerCase().includes(searchLower) ||
        member.email?.toLowerCase().includes(searchLower) ||
        member.phone?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const rows = filteredStaff.map((member) => ({
    id: member.id,
    fullName: member.fullName,
    phone: member.phone,
    email: member.email,
    role: member.role,
    status: member.status,
    ...member,
  }));

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight="bold" sx={{ color: '#1A1A2E' }}>
            Staff Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage employee accounts, roles, and access permissions for the store.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenModal()}
          sx={{ backgroundColor: '#1976D2', '&:hover': { backgroundColor: '#1565C0' } }}
        >
          Add New Staff
        </Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <SearchFilterBar
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          searchPlaceholder="Search staff..."
          filters={[
            {
              label: 'Role',
              value: roleFilter,
              onChange: setRoleFilter,
              options: roleOptions,
            },
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
        <DataTable columns={columns} rows={rows} emptyMessage="No staff members found" />
      )}

      {/* Add/Edit Modal */}
      <Dialog open={modalOpen} onClose={handleCloseModal} maxWidth="md" fullWidth>
        <DialogTitle>
          {editStaff ? 'Edit Staff' : 'Add New Staff'}
          {editStaff && (
            <Typography variant="body2" color="text.secondary">
              Create a new staff account and assign permissions.
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                PERSONAL INFORMATION
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Full Name *"
                value={formData.fullName}
                onChange={handleChange('fullName')}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone Number *"
                value={formData.phone}
                onChange={handleChange('phone')}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1, mt: 2 }}>
                ACCOUNT SETTINGS
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Login Email *"
                type="email"
                value={formData.email}
                onChange={handleChange('email')}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Password *"
                type="password"
                value={formData.password}
                onChange={handleChange('password')}
                required={!editStaff}
                helperText={editStaff ? 'Leave empty to keep current password' : ''}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1, mt: 2 }}>
                Role Assignment
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      border: formData.role === 'Order Staff' ? '2px solid #1976D2' : '1px solid #e0e0e0',
                      backgroundColor: formData.role === 'Order Staff' ? '#E3F2FD' : 'white',
                    }}
                    onClick={() => setFormData({ ...formData, role: 'Order Staff' })}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <ShoppingCartIcon sx={{ fontSize: '2.5rem', color: '#1976D2' }} />
                        <Box>
                          <Typography variant="subtitle1" fontWeight="bold">
                            Order Staff
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Manages incoming orders, shipping details.
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      border: formData.role === 'Product Staff' ? '2px solid #1976D2' : '1px solid #e0e0e0',
                      backgroundColor: formData.role === 'Product Staff' ? '#E3F2FD' : 'white',
                    }}
                    onClick={() => setFormData({ ...formData, role: 'Product Staff' })}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <InventoryIcon sx={{ fontSize: '2.5rem', color: '#1976D2' }} />
                        <Box>
                          <Typography variant="subtitle1" fontWeight="bold">
                            Product Staff
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Manages inventory, categories, pricing, and stock levels.
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1, mt: 2 }}>
                Account Status
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Determines if this staff member can log in
              </Typography>
              <FormControl component="fieldset">
                <RadioGroup
                  row
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <FormControlLabel value="active" control={<Radio />} label="Active" />
                  <FormControlLabel value="inactive" control={<Radio />} label="Inactive" />
                </RadioGroup>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseModal}>Cancel</Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={!formData.fullName || !formData.email || (!editStaff && !formData.password)}
            sx={{ backgroundColor: '#1976D2' }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, staff: null })}
        onConfirm={handleDelete}
        title="Confirm Deletion"
        message={`Are you sure you want to delete this staff member from the system?`}
        confirmText="Confirm Delete"
        cancelText="Cancel"
        confirmColor="error"
        type="delete"
        showInput={true}
        inputLabel="Staff Member"
        inputValue={deleteDialog.staff?.fullName}
        warningMessage="If this staff member has associated sales records, their status will be changed to 'Inactive' instead of being permanently removed to preserve history."
      />
    </Box>
  );
};

export default AdminStaffList;
