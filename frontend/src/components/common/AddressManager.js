import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, List, ListItem,
    ListItemText, IconButton, TextField, Box
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { fetchAddressesAPI, addAddressAPI, updateAddressAPI, deleteAddressAPI } from '../../api/productApi';

function AddressManager({ open, onClose, onSelectAddress }) {
    const [addresses, setAddresses] = useState([]);
    const [editingAddress, setEditingAddress] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);

    useEffect(() => {
        if (open) {
            fetchAddresses();
        }
    }, [open]);

    const fetchAddresses = async () => {
        try {
            const response = await fetchAddressesAPI();
            setAddresses(response.data);
        } catch (error) {
            console.error("Failed to fetch addresses:", error);
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

    const handleDelete = async (id, event) => {
        event.stopPropagation();
        if (window.confirm("Are you sure you want to delete this address?")) {
            try {
                await deleteAddressAPI(id);
                fetchAddresses();
            } catch (error) {
                console.error("Failed to delete address:", error);
            }
        }
    };

    return (
        <>
            <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
                <DialogTitle>Select or Manage Addresses</DialogTitle>
                <DialogContent>
                    <List>
                        {addresses.map((address) => (
                            <ListItem
                                key={address.AddressID}
                                secondaryAction={
                                    <>
                                        <IconButton aria-label="edit" onClick={(e) => { e.stopPropagation(); handleEdit(address); }}>
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton edge="end" aria-label="delete" onClick={(e) => handleDelete(address.AddressID, e)}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </>
                                }
                                button
                                onClick={() => onSelectAddress(address)}
                            >
                                <ListItemText
                                    primary={address.AddressLine1}
                                    secondary={`${address.ContactName || ''} - ${address.PhoneNumber || ''}`}
                                />
                            </ListItem>
                        ))}
                    </List>
                    <Button startIcon={<AddIcon />} onClick={handleAddNew} sx={{ mt: 2 }}>
                        Add New Address
                    </Button>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Close</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={isFormOpen} onClose={handleFormClose} fullWidth maxWidth="sm">
                <DialogTitle>{editingAddress ? 'Edit Address' : 'Add New Address'}</DialogTitle>
                <DialogContent>
                    <Box component="form" id="address-form" onSubmit={handleSave}>
                        <TextField
                            autoFocus
                            margin="dense"
                            name="addressline1"
                            label="Address Line 1"
                            type="text"
                            fullWidth
                            variant="standard"
                            defaultValue={editingAddress?.AddressLine1}
                            required
                        />
                        <TextField
                            margin="dense"
                            name="contactname"
                            label="Contact Name"
                            type="text"
                            fullWidth
                            variant="standard"
                            defaultValue={editingAddress?.ContactName}
                            required
                        />
                        <TextField
                            margin="dense"
                            name="phonenumber"
                            label="Phone Number"
                            type="text"
                            fullWidth
                            variant="standard"
                            defaultValue={editingAddress?.PhoneNumber}
                            required
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleFormClose}>Cancel</Button>
                    <Button type="submit" form="address-form">Save</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default AddressManager;
