import React, { useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, Typography, Box, Alert, IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import InfoIcon from '@mui/icons-material/Info';
import { cancelOrderAPI } from '../../../api/staffApi';

const CancellationRequestModal = ({ open, onClose, orderId, order, onSuccess }) => {
    const [loading, setLoading] = useState(false);

    const handleAccept = async () => {
        try {
            setLoading(true);
            await cancelOrderAPI(orderId, 'Accepted by staff');
            if (onSuccess) onSuccess();
            onClose();
        } catch (error) {
            console.error('Failed to accept cancellation:', error);
            alert('Failed to accept cancellation request');
        } finally {
            setLoading(false);
        }
    };

    const handleDecline = async () => {
        try {
            setLoading(true);
            // You might want to add a decline API endpoint
            // await declineCancellationAPI(orderId);
            onClose();
        } catch (error) {
            console.error('Failed to decline cancellation:', error);
        } finally {
            setLoading(false);
        }
    };

    const cancellationReason = order?.CancellationReason || 
                              order?.cancellationReason || 
                              "I found a better price for the Mountain Trekker X200 on another website and would like to cancel my order immediately. Sorry for the inconvenience.";

    return (
        <Dialog 
            open={open} 
            onClose={onClose}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <WarningAmberIcon sx={{ color: 'error.main' }} />
                    <Typography variant="h6" fontWeight="bold">
                        Cancellation Request
                    </Typography>
                </Box>
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
                    REASON FOR CANCELLATION
                </Typography>
                <Box
                    sx={{
                        p: 2,
                        backgroundColor: '#f5f5f5',
                        borderRadius: 1,
                        border: '1px solid #e0e0e0',
                        mb: 3,
                        fontStyle: 'italic',
                        color: '#666'
                    }}
                >
                    {cancellationReason}
                </Box>
                <Alert 
                    severity="info" 
                    icon={<InfoIcon />}
                    sx={{
                        backgroundColor: '#FFF4E6',
                        border: '1px solid #FE7E15',
                        '& .MuiAlert-icon': {
                            color: '#FE7E15'
                        }
                    }}
                >
                    <Typography variant="body2">
                        Accepting this request will automatically refund the payment and restore stock.
                    </Typography>
                </Alert>
            </DialogContent>
            <DialogActions sx={{ p: 2, gap: 1 }}>
                <Button
                    onClick={handleDecline}
                    variant="outlined"
                    disabled={loading}
                    sx={{ borderColor: '#666', color: '#666' }}
                >
                    Decline
                </Button>
                <Button
                    onClick={handleAccept}
                    variant="contained"
                    disabled={loading}
                    sx={{ backgroundColor: '#1976d2' }}
                >
                    Accept
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CancellationRequestModal;
