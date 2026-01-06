import React, { useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, Typography, Box, TextField, Select, MenuItem,
    FormControl, InputLabel, IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { prepareForPickupAPI } from '../../../api/staffApi';

const PrepareForPickupModal = ({ open, onClose, orderId, order, onSuccess }) => {
    const [selectedBike, setSelectedBike] = useState('');
    const [description, setDescription] = useState('');
    const [photoEvidence, setPhotoEvidence] = useState(null);
    const [loading, setLoading] = useState(false);

    const bikeItems = order?.Items || order?.items || [];

    const handleSubmit = async () => {
        try {
            setLoading(true);
            const formData = new FormData();
            formData.append('bikeItem', selectedBike);
            formData.append('description', description);
            if (photoEvidence) {
                formData.append('photoEvidence', photoEvidence);
            }
            await prepareForPickupAPI(orderId, formData);
            if (onSuccess) onSuccess();
            onClose();
            // Reset form
            setSelectedBike('');
            setDescription('');
            setPhotoEvidence(null);
        } catch (error) {
            console.error('Failed to prepare for pickup:', error);
            alert('Failed to prepare for pickup');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog 
            open={open} 
            onClose={onClose}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" fontWeight="bold">
                    Prepare for Pickup
                </Typography>
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                {/* Customer Info Banner */}
                <Box
                    sx={{
                        p: 2,
                        backgroundColor: '#E3F2FD',
                        borderRadius: 2,
                        mb: 3
                    }}
                >
                    <Typography variant="body2" gutterBottom>
                        <strong>Customer:</strong> {order?.CustomerName || order?.customerName || 'John Doe'}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                        <strong>Rental Period:</strong> {order?.RentalStartDate || 'Oct 12'} – {order?.RentalEndDate || 'Oct 15'}
                    </Typography>
                    <Typography variant="body2">
                        <strong>Status:</strong> Preparing
                    </Typography>
                </Box>

                <FormControl fullWidth sx={{ mb: 3 }}>
                    <InputLabel>Select Bike Item</InputLabel>
                    <Select
                        value={selectedBike}
                        label="Select Bike Item"
                        onChange={(e) => setSelectedBike(e.target.value)}
                    >
                        {bikeItems.map((item, index) => (
                            <MenuItem key={index} value={item.ProductName || item.productName}>
                                {item.ProductName || item.productName} - {item.Variant || item.variant || 'Medium'}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <TextField
                    fullWidth
                    label="Description"
                    multiline
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="No scratches whatsoever."
                    sx={{ mb: 3 }}
                />

                <Box>
                    <Typography variant="body2" gutterBottom>
                        Photo Evidence
                    </Typography>
                    <Button
                        variant="outlined"
                        component="label"
                        fullWidth
                        sx={{ py: 2, borderStyle: 'dashed' }}
                    >
                        Click to upload or drag and drop
                        <input
                            type="file"
                            hidden
                            accept="image/*"
                            onChange={(e) => setPhotoEvidence(e.target.files[0])}
                        />
                    </Button>
                    {photoEvidence && (
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                            Selected: {photoEvidence.name}
                        </Typography>
                    )}
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2, gap: 1 }}>
                <Button
                    onClick={onClose}
                    variant="outlined"
                    disabled={loading}
                    sx={{ borderColor: '#666', color: '#666' }}
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={loading || !selectedBike}
                    sx={{ backgroundColor: '#FE7E15' }}
                >
                    Confirm
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default PrepareForPickupModal;
