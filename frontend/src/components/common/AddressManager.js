import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, List, ListItem,
    ListItemText, IconButton, TextField, Box, Radio, Typography, Divider, Stack,
    Switch, FormControlLabel
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CloseIcon from '@mui/icons-material/Close';
import { fetchAddressesAPI, addAddressAPI, updateAddressAPI, deleteAddressAPI } from '../../api/productApi';

function AddressManager({ open, onClose, onSelectAddress, selectedAddressId }) {
    const [addresses, setAddresses] = useState([]);
    const [editingAddress, setEditingAddress] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedId, setSelectedId] = useState(selectedAddressId || null);
    const [isDefault, setIsDefault] = useState(false);

    useEffect(() => {
        if (open) {
            fetchAddresses();
            setSelectedId(selectedAddressId || null);
        }
    }, [open, selectedAddressId]);

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
        setIsDefault(address.IsDefault || false);
        setIsFormOpen(true);
    };

    const handleAddNew = () => {
        setEditingAddress(null);
        setIsDefault(false);
        setIsFormOpen(true);
    };

    const handleFormClose = () => {
        setIsFormOpen(false);
        setEditingAddress(null);
        setIsDefault(false);
    };

    const handleSave = async (event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const data = {
            addressline1: formData.get('streetaddress'),
            contactname: formData.get('name'),
            phonenumber: formData.get('phonenumber'),
            city: formData.get('city'),
            state: formData.get('state'),
            isdefault: isDefault,
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

    const handleSelect = (address) => {
        setSelectedId(address.AddressID);
        onSelectAddress(address);
    };

    return (
        <>
            <Dialog 
                open={open} 
                onClose={onClose} 
                fullWidth 
                maxWidth="sm"
                PaperProps={{
                    sx: {
                        backgroundColor: '#F3E8DB',
                        borderRadius: 2
                    }
                }}
            >
                <DialogTitle sx={{ 
                    fontWeight: 'bold', 
                    fontSize: '1.25rem',
                    pb: 1,
                    borderBottom: '1px solid #ddd'
                }}>
                    My address
                </DialogTitle>
                <DialogContent sx={{ p: 0, mt: 2 }}>
                    <List sx={{ pb: 0 }}>
                        {addresses.map((address) => {
                            const isSelected = selectedId === address.AddressID;
                            return (
                                <ListItem
                                    key={address.AddressID}
                                    onClick={() => handleSelect(address)}
                                    sx={{
                                        cursor: 'pointer',
                                        py: 2,
                                        px: 3,
                                        '&:hover': {
                                            backgroundColor: 'rgba(0, 0, 0, 0.02)'
                                        }
                                    }}
                                >
                                    <Radio
                                        checked={isSelected}
                                        sx={{
                                            color: isSelected ? '#d32f2f' : '#ccc',
                                            '&.Mui-checked': {
                                                color: '#d32f2f'
                                            },
                                            mr: 2
                                        }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleSelect(address);
                                        }}
                                    />
                                    <Box sx={{ flexGrow: 1 }}>
                                        <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 0.5 }}>
                                            {address.ContactName || 'No name'}{address.PhoneNumber && ` (${address.PhoneNumber})`}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                                            {address.AddressLine1}
                                            {address.City && `, ${address.City}`}
                                            {address.PostalCode && `, ${address.PostalCode}`}
                                        </Typography>
                                    </Box>
                                    <ChevronRightIcon 
                                        sx={{ 
                                            color: '#666',
                                            ml: 1,
                                            cursor: 'pointer'
                                        }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleEdit(address);
                                        }}
                                    />
                                </ListItem>
                            );
                        })}
                    </List>
                    <Box sx={{ p: 2, pt: 1 }}>
                        <Button 
                            fullWidth
                            startIcon={
                                <Box sx={{
                                    width: 24,
                                    height: 24,
                                    borderRadius: '50%',
                                    border: '2px solid #000',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mr: 1
                                }}>
                                    <AddIcon sx={{ fontSize: 18 }} />
                                </Box>
                            }
                            onClick={handleAddNew}
                            sx={{
                                mt: 2,
                                py: 1.5,
                                fontWeight: 'bold',
                                color: '#000',
                                textTransform: 'none',
                                border: '1px solid #ddd',
                                borderRadius: 2,
                                backgroundColor: '#fff',
                                '&:hover': {
                                    backgroundColor: '#f5f5f5'
                                }
                            }}
                        >
                            Add new address
                        </Button>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2, pt: 1 }}>
                    <Button 
                        onClick={onClose}
                        sx={{
                            textTransform: 'none',
                            fontWeight: 'bold'
                        }}
                    >
                        Done
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog 
                open={isFormOpen} 
                onClose={handleFormClose} 
                fullWidth 
                maxWidth="sm"
                PaperProps={{
                    sx: {
                        backgroundColor: '#F3E8DB',
                        borderRadius: 2
                    }
                }}
            >
                <Box sx={{ position: 'relative', p: 4 }}>
                    <IconButton
                        onClick={handleFormClose}
                        sx={{
                            position: 'absolute',
                            right: 16,
                            top: 16,
                            color: '#1976d2'
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                    
                    <Box component="form" id="address-form" onSubmit={handleSave} sx={{ mt: 2 }}>
                        <Stack spacing={3}>
                            <TextField
                                autoFocus
                                name="name"
                                placeholder="Name"
                                type="text"
                                fullWidth
                                variant="outlined"
                                defaultValue={editingAddress?.ContactName}
                                required
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        backgroundColor: 'rgba(255, 255, 255, 0.7)',
                                        '& fieldset': {
                                            borderColor: '#ddd',
                                            borderWidth: '1px',
                                            borderStyle: 'solid',
                                            borderTop: 'none',
                                            borderLeft: 'none',
                                            borderRight: 'none',
                                            borderRadius: 0
                                        },
                                        '&:hover fieldset': {
                                            borderColor: '#999'
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#1976d2'
                                        }
                                    },
                                    '& .MuiInputBase-input': {
                                        textAlign: 'center',
                                        py: 1.5
                                    }
                                }}
                            />
                            <TextField
                                name="phonenumber"
                                placeholder="Phone number"
                                type="text"
                                fullWidth
                                variant="outlined"
                                defaultValue={editingAddress?.PhoneNumber}
                                required
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        backgroundColor: 'rgba(255, 255, 255, 0.7)',
                                        '& fieldset': {
                                            borderColor: '#ddd',
                                            borderWidth: '1px',
                                            borderStyle: 'solid',
                                            borderTop: 'none',
                                            borderLeft: 'none',
                                            borderRight: 'none',
                                            borderRadius: 0
                                        },
                                        '&:hover fieldset': {
                                            borderColor: '#999'
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#1976d2'
                                        }
                                    },
                                    '& .MuiInputBase-input': {
                                        textAlign: 'center',
                                        py: 1.5
                                    }
                                }}
                            />
                            <TextField
                                name="streetaddress"
                                placeholder="Street Address"
                                type="text"
                                fullWidth
                                variant="outlined"
                                defaultValue={editingAddress?.AddressLine1}
                                required
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        backgroundColor: 'rgba(255, 255, 255, 0.7)',
                                        '& fieldset': {
                                            borderColor: '#ddd',
                                            borderWidth: '1px',
                                            borderStyle: 'solid',
                                            borderTop: 'none',
                                            borderLeft: 'none',
                                            borderRight: 'none',
                                            borderRadius: 0
                                        },
                                        '&:hover fieldset': {
                                            borderColor: '#999'
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#1976d2'
                                        }
                                    },
                                    '& .MuiInputBase-input': {
                                        textAlign: 'center',
                                        py: 1.5
                                    }
                                }}
                            />
                            <TextField
                                name="city"
                                placeholder="City"
                                type="text"
                                fullWidth
                                variant="outlined"
                                defaultValue={editingAddress?.City}
                                required
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        backgroundColor: 'rgba(255, 255, 255, 0.7)',
                                        '& fieldset': {
                                            borderColor: '#ddd',
                                            borderWidth: '1px',
                                            borderStyle: 'solid',
                                            borderTop: 'none',
                                            borderLeft: 'none',
                                            borderRight: 'none',
                                            borderRadius: 0
                                        },
                                        '&:hover fieldset': {
                                            borderColor: '#999'
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#1976d2'
                                        }
                                    },
                                    '& .MuiInputBase-input': {
                                        textAlign: 'center',
                                        py: 1.5
                                    }
                                }}
                            />
                            <TextField
                                name="state"
                                placeholder="State"
                                type="text"
                                fullWidth
                                variant="outlined"
                                defaultValue={editingAddress?.StateProvince}
                                required
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        backgroundColor: 'rgba(255, 255, 255, 0.7)',
                                        '& fieldset': {
                                            borderColor: '#ddd',
                                            borderWidth: '1px',
                                            borderStyle: 'solid',
                                            borderTop: 'none',
                                            borderLeft: 'none',
                                            borderRight: 'none',
                                            borderRadius: 0
                                        },
                                        '&:hover fieldset': {
                                            borderColor: '#999'
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#1976d2'
                                        }
                                    },
                                    '& .MuiInputBase-input': {
                                        textAlign: 'center',
                                        py: 1.5
                                    }
                                }}
                            />
                            
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1 }}>
                                <Typography variant="body1" fontWeight="bold">
                                    Set as default address
                                </Typography>
                                <Switch
                                    checked={isDefault}
                                    onChange={(e) => setIsDefault(e.target.checked)}
                                    sx={{
                                        '& .MuiSwitch-switchBase.Mui-checked': {
                                            color: '#1976d2'
                                        },
                                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                            backgroundColor: '#1976d2'
                                        }
                                    }}
                                />
                            </Box>
                        </Stack>
                    </Box>
                    
                    <Box sx={{ display: 'flex', gap: 2, mt: 4, justifyContent: 'space-between' }}>
                        <Button
                            onClick={handleFormClose}
                            sx={{
                                flex: 1,
                                py: 1.5,
                                backgroundColor: '#ff8c00',
                                color: '#fff',
                                fontWeight: 'bold',
                                borderRadius: 2,
                                textTransform: 'none',
                                '&:hover': {
                                    backgroundColor: '#e67e00'
                                }
                            }}
                        >
                            Back
                        </Button>
                        <Button
                            type="submit"
                            form="address-form"
                            sx={{
                                flex: 1,
                                py: 1.5,
                                backgroundColor: '#1976d2',
                                color: '#fff',
                                fontWeight: 'bold',
                                borderRadius: 2,
                                textTransform: 'none',
                                '&:hover': {
                                    backgroundColor: '#1565c0'
                                }
                            }}
                        >
                            Complete
                        </Button>
                    </Box>
                </Box>
            </Dialog>
        </>
    );
}

export default AddressManager;
