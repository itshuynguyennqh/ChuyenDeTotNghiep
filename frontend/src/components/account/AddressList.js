import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Button, Card, CardContent, CardActions,
    Grid, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
    CircularProgress
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import { fetchAddressesAPI, addAddressAPI, updateAddressAPI, deleteAddressAPI } from '../../api/productApi';

const AddressList = () => {
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);

    const fetchAddresses = async () => {
        try {
            setLoading(true);
            const response = await fetchAddressesAPI();
            setAddresses(response.data);
        } catch (error) {
            console.error("Failed to fetch addresses:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAddresses();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this address?")) {
            try {
                await deleteAddressAPI(id);
                fetchAddresses();
            } catch (error) {
                console.error("Failed to delete address:", error);
            }
        }
    };

    const handleEdit = (address) => {
        setEditingAddress(address);
        setIsFormOpen(true);
    };

    const handleAddNew = () => {
        setEditingAddress(null);
        setIsFormOpen(true);
    };

    const handleFormClose = () => {
        setIsFormOpen(false);
        setEditingAddress(null);
    };

    const handleSave = async (event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const data = {
            addressline1: formData.get('addressline1'),
            contactname: formData.get('contactname'),
            phonenumber: formData.get('phonenumber'),
            modifieddate: new Date().toISOString(),
        };

        try {
            if (editingAddress) {
                await updateAddressAPI(editingAddress.AddressID, data);
            } else {
                await addAddressAPI(data);
            }
            fetchAddresses();
            handleFormClose();
        } catch (error) {
            console.error("Failed to save address:", error);
        }
    };

    if (loading && addresses.length === 0) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>;
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight="bold">Saved Addresses</Typography>
                <Button 
                    variant="contained" 
                    startIcon={<AddIcon />} 
                    onClick={handleAddNew} 
                    sx={{ backgroundColor: '#ff8c00', '&:hover': { backgroundColor: '#e67e00' } }}
                >
                    Add New Address
                </Button>
            </Box>

            <Grid container spacing={3}>
                {addresses.map((address) => (
                    <Grid item xs={12} md={6} key={address.AddressID}>
                        <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <CardContent sx={{ flexGrow: 1 }}>
                                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>{address.AddressLine1}</Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    Name: <Typography component="span" variant="body2" color="text.primary">{address.ContactName}</Typography>
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    Phone: <Typography component="span" variant="body2" color="text.primary">{address.PhoneNumber}</Typography>
                                </Typography>
                            </CardContent>
                            <CardActions sx={{ justifyContent: 'flex-end', borderTop: '1px solid #eee' }}>
                                <Button size="small" startIcon={<EditIcon />} onClick={() => handleEdit(address)}>
                                    Edit
                                </Button>
                                <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={() => handleDelete(address.AddressID)}>
                                    Delete
                                </Button>
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
                {!loading && addresses.length === 0 && (
                    <Grid item xs={12}>
                        <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 4 }}>
                            You haven't saved any addresses yet.
                        </Typography>
                    </Grid>
                )}
            </Grid>

            <Dialog open={isFormOpen} onClose={handleFormClose} fullWidth maxWidth="sm">
                <DialogTitle>{editingAddress ? 'Edit Address' : 'Add New Address'}</DialogTitle>
                <DialogContent>
                    <Box component="form" id="address-form" onSubmit={handleSave} sx={{ mt: 1 }}>
                        <TextField
                            autoFocus
                            margin="dense"
                            name="addressline1"
                            label="Address (House number, Street)"
                            type="text"
                            fullWidth
                            variant="outlined"
                            defaultValue={editingAddress?.AddressLine1}
                            required
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            margin="dense"
                            name="contactname"
                            label="Contact Name"
                            type="text"
                            fullWidth
                            variant="outlined"
                            defaultValue={editingAddress?.ContactName}
                            required
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            margin="dense"
                            name="phonenumber"
                            label="Phone Number"
                            type="text"
                            fullWidth
                            variant="outlined"
                            defaultValue={editingAddress?.PhoneNumber}
                            required
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleFormClose}>Cancel</Button>
                    <Button 
                        type="submit" 
                        form="address-form" 
                        variant="contained" 
                        sx={{ backgroundColor: '#ff8c00', '&:hover': { backgroundColor: '#e67e00' } }}
                    >
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AddressList;