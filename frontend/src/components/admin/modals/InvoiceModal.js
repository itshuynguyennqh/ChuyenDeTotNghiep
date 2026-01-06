import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, Typography, Box, IconButton, Chip, Table,
    TableBody, TableCell, TableContainer, TableHead, TableRow,
    Divider
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import PrintIcon from '@mui/icons-material/Print';
import PhoneIcon from '@mui/icons-material/Phone';
import { fetchInvoiceAPI, downloadInvoicePDFAPI } from '../../../api/staffApi';

const InvoiceModal = ({ open, onClose, orderId, order }) => {
    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open && orderId) {
            loadInvoice();
        }
    }, [open, orderId]);

    const loadInvoice = async () => {
        try {
            setLoading(true);
            const response = await fetchInvoiceAPI(orderId);
            setInvoice(response.data || order);
        } catch (error) {
            console.error('Failed to fetch invoice:', error);
            setInvoice(order);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPDF = async () => {
        try {
            const response = await downloadInvoicePDFAPI(orderId);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `invoice-${orderId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Failed to download PDF:', error);
            alert('Failed to download PDF');
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
        });
    };

    const invoiceData = invoice || order;
    const isPaid = invoiceData?.PaymentStatus === 'Paid' || invoiceData?.paymentStatus === 'Paid';

    return (
        <Dialog 
            open={open} 
            onClose={onClose}
            maxWidth="md"
            fullWidth
        >
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="h6" fontWeight="bold">
                        Invoice {invoiceData?.InvoiceNumber || `#INV-${orderId}`}
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                        size="small"
                        startIcon={<DownloadIcon />}
                        onClick={handleDownloadPDF}
                        variant="outlined"
                    >
                        Download PDF
                    </Button>
                    <Button
                        size="small"
                        startIcon={<PrintIcon />}
                        onClick={handlePrint}
                        variant="outlined"
                    >
                        Print
                    </Button>
                    <IconButton onClick={onClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>
            <DialogContent>
                <Box sx={{ mb: 3 }}>
                    <Chip
                        label={isPaid ? 'Paid' : 'Unpaid'}
                        color={isPaid ? 'success' : 'warning'}
                        sx={{ mb: 1 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                        Issued on {formatDate(invoiceData?.OrderDate || invoiceData?.orderdate)}
                    </Typography>
                    {invoiceData?.DueDate && (
                        <Typography variant="body2" color="text.secondary">
                            Due Date: {formatDate(invoiceData.DueDate || invoiceData.dueDate)}
                        </Typography>
                    )}
                </Box>

                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                        TO
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                        {invoiceData?.CustomerName || invoiceData?.customerName || 'John Doe'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {invoiceData?.DeliveryAddress || invoiceData?.deliveryAddress || '456 Rider Way, Adventure Town, AT 67890'}
                    </Typography>
                    {invoiceData?.CustomerPhone && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                            <PhoneIcon fontSize="small" />
                            <Typography variant="body2" color="text.secondary">
                                {invoiceData.CustomerPhone || invoiceData.customerPhone}
                            </Typography>
                        </Box>
                    )}
                </Box>

                <Divider sx={{ my: 3 }} />

                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                    Order Items ({invoiceData?.Items?.length || invoiceData?.items?.length || 0})
                </Typography>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell><strong>Product</strong></TableCell>
                                <TableCell align="right"><strong>Price</strong></TableCell>
                                <TableCell align="center"><strong>Quantity</strong></TableCell>
                                <TableCell align="right"><strong>Total</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {(invoiceData?.Items || invoiceData?.items || []).map((item, index) => (
                                <TableRow key={index}>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                            {item.Image && (
                                                <Box
                                                    component="img"
                                                    src={item.Image}
                                                    alt={item.ProductName}
                                                    sx={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 1 }}
                                                />
                                            )}
                                            <Box>
                                                <Typography variant="body1">
                                                    {item.ProductName || item.productName}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell align="right">
                                        ${parseFloat(item.Price || item.price || 0).toFixed(2)}
                                    </TableCell>
                                    <TableCell align="center">
                                        {item.Quantity || item.quantity || 1}
                                    </TableCell>
                                    <TableCell align="right">
                                        ${parseFloat(item.Total || item.total || 0).toFixed(2)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Divider sx={{ my: 3 }} />

                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Box sx={{ minWidth: 250 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography>Subtotal:</Typography>
                            <Typography>${parseFloat(invoiceData?.Subtotal || invoiceData?.subtotal || 0).toFixed(2)}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography>Shipping:</Typography>
                            <Typography>${parseFloat(invoiceData?.Freight || invoiceData?.freight || 0).toFixed(2)}</Typography>
                        </Box>
                        {invoiceData?.Discount && parseFloat(invoiceData.Discount || invoiceData.discount || 0) > 0 && (
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography>Discount (Coupon):</Typography>
                                <Typography>${parseFloat(invoiceData.Discount || invoiceData.discount || 0).toFixed(2)}</Typography>
                            </Box>
                        )}
                        <Divider sx={{ my: 1 }} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="h6" fontWeight="bold">
                                Grand Total:
                            </Typography>
                            <Typography variant="h6" fontWeight="bold">
                                ${parseFloat(invoiceData?.TotalDue || invoiceData?.totaldue || 0).toFixed(2)}
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose} variant="outlined">
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default InvoiceModal;
