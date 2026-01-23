import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button, CircularProgress, Alert, Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControlLabel, Checkbox, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { fetchAddressesAPI, addAddressAPI, updateAddressAPI, deleteAddressAPI } from '../../api/userApi';

const AddressList = () => {
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [formData, setFormData] = useState({
        address_line1: '',
        city: '',
        postal_code: '',
        phone_number: '',
        is_default: false
    });
    const [formError, setFormError] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadAddresses();
    }, []);

    const loadAddresses = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await fetchAddressesAPI();
            setAddresses(response.data.data || []);
        } catch (err) {
            setError(err.response?.data?.detail || err.message || 'Failed to load addresses');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenAddDialog = () => {
        setEditingAddress(null);
        setFormData({
            address_line1: '',
            city: '',
            postal_code: '',
            phone_number: '',
            is_default: addresses.length === 0 // Auto set default if first address
        });
        setFormError('');
        setOpenDialog(true);
    };

    const handleOpenEditDialog = (address) => {
        setEditingAddress(address);
        setFormData({
            address_line1: address.address_line1 || '',
            city: address.city || '',
            postal_code: address.postal_code || '',
            phone_number: address.phone_number || '',
            is_default: address.is_default || false
        });
        setFormError('');
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingAddress(null);
        setFormData({
            address_line1: '',
            city: '',
            postal_code: '',
            phone_number: '',
            is_default: false
        });
        setFormError('');
    };

    const handleSaveAddress = async () => {
        // Validation
        if (!formData.address_line1.trim()) {
            setFormError('Address line is required');
            return;
        }
        if (!formData.city.trim()) {
            setFormError('City is required');
            return;
        }
        if (!formData.phone_number.trim()) {
            setFormError('Phone number is required');
            return;
        }
        // Validate phone number format (9-15 digits)
        if (!/^\d{9,15}$/.test(formData.phone_number.replace(/\s/g, ''))) {
            setFormError('Phone number must be 9-15 digits');
            return;
        }

        setFormError('');
        setSaving(true);

        try {
            const data = {
                address_line1: formData.address_line1.trim(),
                city: formData.city.trim(),
                postal_code: formData.postal_code.trim() || undefined,
                phone_number: formData.phone_number.replace(/\s/g, ''),
                is_default: formData.is_default
            };

            if (editingAddress) {
                await updateAddressAPI(editingAddress.address_id, data);
            } else {
                await addAddressAPI(data);
            }

            await loadAddresses();
            handleCloseDialog();
        } catch (err) {
            setFormError(err.response?.data?.detail || err.message || 'Failed to save address');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteAddress = async (address) => {
        if (address.is_default && addresses.length > 1) {
            setFormError('Cannot delete default address. Please set another address as default first.');
            return;
        }

        setDeleteConfirm(address);
    };

    const confirmDelete = async () => {
        if (!deleteConfirm) return;

        try {
            await deleteAddressAPI(deleteConfirm.address_id);
            await loadAddresses();
            setDeleteConfirm(null);
        } catch (err) {
            setError(err.response?.data?.detail || err.message || 'Failed to delete address');
            setDeleteConfirm(null);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>Saved Addresses</Typography>
            <Paper variant="outlined" sx={{ p: 4, borderRadius: '20px', width: '100%' }}>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                        {error}
                    </Alert>
                )}
                
                {addresses.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                            No saved addresses yet
                        </Typography>
                        <Button 
                            startIcon={<AddIcon />} 
                            onClick={handleOpenAddDialog}
                            sx={{ color: '#000', textTransform: 'none', fontWeight: 'bold' }}
                        >
                            Add new address
                        </Button>
                    </Box>
                ) : (
                    <>
                        {addresses.map((address, index) => (
                            <Box 
                                key={address.address_id} 
                                sx={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    alignItems: 'flex-start',
                                    mb: index < addresses.length - 1 ? 3 : 0,
                                    pb: index < addresses.length - 1 ? 3 : 0,
                                    borderBottom: index < addresses.length - 1 ? '1px solid #E0E0E0' : 'none'
                                }}
                            >
                                <Box>
                                    <Typography variant="h6" color="#1976d2" fontWeight="bold" gutterBottom>
                                        {address.is_default ? 'Default Address' : `Address ${index + 1}`}
                                    </Typography>
                                    <Typography variant="body1" fontWeight="bold">
                                        {address.phone_number ? `(+84) ${address.phone_number}` : 'No phone number'}
                                    </Typography>
                                    <Typography variant="body1" color="text.secondary" sx={{ maxWidth: '900px', my: 1 }}>
                                        {address.address_line1}, {address.city}, {address.postal_code}
                                    </Typography>
                                    {address.is_default && (
                                        <Box sx={{ border: '1px solid #d32f2f', color: '#d32f2f', display: 'inline-block', px: 1.5, py: 0.2, borderRadius: '4px', fontSize: '0.8rem' }}>
                                            Default
                                        </Box>
                                    )}
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <IconButton 
                                        size="small" 
                                        onClick={() => handleOpenEditDialog(address)}
                                        sx={{ color: '#1976d2' }}
                                    >
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton 
                                        size="small" 
                                        onClick={() => handleDeleteAddress(address)}
                                        disabled={address.is_default && addresses.length === 1}
                                        sx={{ color: '#d32f2f' }}
                                    >
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                            </Box>
                        ))}
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                            <Button 
                                startIcon={<AddIcon />} 
                                onClick={handleOpenAddDialog}
                                sx={{ color: '#000', textTransform: 'none', fontWeight: 'bold' }}
                            >
                                Add new address
                            </Button>
                        </Box>
                    </>
                )}
            </Paper>

            {/* Add/Edit Address Dialog */}
            <Dialog 
                open={openDialog} 
                onClose={handleCloseDialog}
                PaperProps={{ sx: { borderRadius: '20px', padding: '20px', minWidth: '500px' } }}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{ fontWeight: 'bold', fontSize: '1.5rem', pb: 1 }}>
                    {editingAddress ? 'Edit Address' : 'Add New Address'}
                </DialogTitle>
                <DialogContent>
                    {formError && (
                        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setFormError('')}>
                            {formError}
                        </Alert>
                    )}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
                        <TextField
                            fullWidth
                            label="Address Line"
                            placeholder="Street address, building number"
                            value={formData.address_line1}
                            onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
                            required
                            error={!!formError && !formData.address_line1.trim()}
                        />
                        <TextField
                            fullWidth
                            label="City"
                            placeholder="City name"
                            value={formData.city}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                            required
                            error={!!formError && !formData.city.trim()}
                        />
                        <TextField
                            fullWidth
                            label="Postal Code"
                            placeholder="Postal code (optional)"
                            value={formData.postal_code}
                            onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                        />
                        <TextField
                            fullWidth
                            label="Phone Number"
                            placeholder="9-15 digits"
                            value={formData.phone_number}
                            onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                            required
                            error={!!formError && (!formData.phone_number.trim() || !/^\d{9,15}$/.test(formData.phone_number.replace(/\s/g, '')))}
                            helperText={formError && !/^\d{9,15}$/.test(formData.phone_number.replace(/\s/g, '')) ? 'Phone number must be 9-15 digits' : ''}
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={formData.is_default}
                                    onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                                />
                            }
                            label="Set as default address"
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button 
                        onClick={handleCloseDialog}
                        sx={{ textTransform: 'none', color: '#666' }}
                        disabled={saving}
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleSaveAddress}
                        variant="contained"
                        disabled={saving}
                        sx={{ 
                            bgcolor: '#FF8C00', 
                            '&:hover': { bgcolor: '#e67e00' },
                            textTransform: 'none'
                        }}
                    >
                        {saving ? <CircularProgress size={20} /> : (editingAddress ? 'Update' : 'Add')}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog 
                open={!!deleteConfirm} 
                onClose={() => setDeleteConfirm(null)}
                PaperProps={{ sx: { borderRadius: '20px', padding: '20px', minWidth: '400px' } }}
            >
                <DialogTitle sx={{ fontWeight: 'bold', fontSize: '1.25rem' }}>
                    Delete Address
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete this address? This action cannot be undone.
                    </Typography>
                    {deleteConfirm && (
                        <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: '8px' }}>
                            <Typography variant="body2" fontWeight="bold">
                                {deleteConfirm.address_line1}, {deleteConfirm.city}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {deleteConfirm.phone_number}
                            </Typography>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button 
                        onClick={() => setDeleteConfirm(null)}
                        sx={{ textTransform: 'none', color: '#666' }}
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={confirmDelete}
                        variant="contained"
                        color="error"
                        sx={{ textTransform: 'none' }}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AddressList;