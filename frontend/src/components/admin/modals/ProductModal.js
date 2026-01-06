import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, Typography, Box, IconButton,
    Select, MenuItem, FormControl, InputLabel, Switch,
    FormControlLabel, Grid
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { createProductAPI, updateProductAPI, fetchCategoriesAPI } from '../../../api/productApi';

const ProductModal = ({ open, onClose, product, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        productName: '',
        category: '',
        totalStock: '',
        availableStock: '',
        maintenance: '',
        renting: '',
        size: '',
        color: '',
        condition: 'New',
        sellingPrice: '',
        status: 'In Stock',
        allowRental: false,
        rentalPrice: '',
        securityDeposit: '',
        description: '',
        images: []
    });

    const isEdit = !!product;

    useEffect(() => {
        if (open) {
            loadCategories();
            if (product) {
                setFormData({
                    productName: product.Name || product.name || '',
                    category: product.CategoryID || product.categoryID || product.Category || '',
                    totalStock: product.TotalStock || product.totalStock || product.Stock || '',
                    availableStock: product.AvailableStock || product.availableStock || product.Available || '',
                    maintenance: product.MaintenanceStock || product.maintenanceStock || product.Maintenance || '',
                    renting: product.RentingStock || product.rentingStock || product.Renting || '',
                    size: product.Size || product.size || '',
                    color: product.Color || product.color || '',
                    condition: product.Condition || product.condition || 'New',
                    sellingPrice: product.ListPrice || product.listPrice || product.SellPrice || '',
                    status: product.Status || product.status || 'In Stock',
                    allowRental: product.AllowRental || product.allowRental || false,
                    rentalPrice: product.RentalPrice || product.rentalPrice || product.DailyRate || '',
                    securityDeposit: product.SecurityDeposit || product.securityDeposit || '',
                    description: product.Description || product.description || '',
                    images: product.Images || product.images || []
                });
            } else {
                resetForm();
            }
        }
    }, [open, product]);

    const loadCategories = async () => {
        try {
            const response = await fetchCategoriesAPI();
            setCategories(response.data || []);
        } catch (error) {
            console.error('Failed to load categories:', error);
        }
    };

    const resetForm = () => {
        setFormData({
            productName: '',
            category: '',
            totalStock: '',
            availableStock: '',
            maintenance: '',
            renting: '',
            size: '',
            color: '',
            condition: 'New',
            sellingPrice: '',
            status: 'In Stock',
            allowRental: false,
            rentalPrice: '',
            securityDeposit: '',
            description: '',
            images: []
        });
    };

    const handleChange = (field) => (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        setFormData(prev => ({
            ...prev,
            images: [...prev.images, ...files]
        }));
    };

    const handleRemoveImage = (index) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async () => {
        if (!formData.productName || !formData.category) {
            alert('Please fill in required fields');
            return;
        }

        try {
            setLoading(true);
            const submitData = {
                Name: formData.productName,
                CategoryID: formData.category,
                TotalStock: parseInt(formData.totalStock) || 0,
                AvailableStock: parseInt(formData.availableStock) || 0,
                MaintenanceStock: parseInt(formData.maintenance) || 0,
                RentingStock: parseInt(formData.renting) || 0,
                Size: formData.size,
                Color: formData.color,
                Condition: formData.condition,
                ListPrice: parseFloat(formData.sellingPrice) || 0,
                Status: formData.status,
                AllowRental: formData.allowRental,
                RentalPrice: formData.allowRental ? (parseFloat(formData.rentalPrice) || 0) : null,
                SecurityDeposit: formData.allowRental ? (parseFloat(formData.securityDeposit) || 0) : null,
                Description: formData.description
            };

            if (isEdit) {
                const id = product.ProductID || product.productID || product.id;
                await updateProductAPI(id, submitData);
            } else {
                await createProductAPI(submitData);
            }

            if (onSuccess) onSuccess();
        } catch (error) {
            console.error('Failed to save product:', error);
            alert('Failed to save product');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog 
            open={open} 
            onClose={onClose}
            maxWidth="md"
            fullWidth
        >
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" fontWeight="bold">
                    {isEdit ? 'Edit Product' : 'Add New Product'}
                </Typography>
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            {!isEdit && (
                <Box sx={{ px: 3, pb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                        Fill in the details to add a new bicycle or accessory.
                    </Typography>
                </Box>
            )}
            <DialogContent sx={{ maxHeight: '70vh', overflowY: 'auto' }}>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                    {/* Product Name */}
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Product Name"
                            value={formData.productName}
                            onChange={handleChange('productName')}
                            required
                        />
                    </Grid>

                    {/* Category */}
                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                            <InputLabel>Category</InputLabel>
                            <Select
                                value={formData.category}
                                label="Category"
                                onChange={handleChange('category')}
                                required
                            >
                                <MenuItem value="">Select category</MenuItem>
                                {categories.map(cat => (
                                    <MenuItem 
                                        key={cat.ProductCategoryID || cat.productCategoryID || cat.id} 
                                        value={cat.ProductCategoryID || cat.productCategoryID || cat.id}
                                    >
                                        {cat.CategoryName || cat.categoryName || cat.Name || cat.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* Stock Quantity Grid */}
                    <Grid item xs={12}>
                        <Typography variant="body2" fontWeight="medium" gutterBottom>
                            Stock Quantity
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={6} md={3}>
                                <TextField
                                    fullWidth
                                    label="Total stock"
                                    type="number"
                                    value={formData.totalStock}
                                    onChange={handleChange('totalStock')}
                                />
                            </Grid>
                            <Grid item xs={6} md={3}>
                                <TextField
                                    fullWidth
                                    label="Available stock"
                                    type="number"
                                    value={formData.availableStock}
                                    onChange={handleChange('availableStock')}
                                />
                            </Grid>
                            <Grid item xs={6} md={3}>
                                <TextField
                                    fullWidth
                                    label="Maintenance"
                                    type="number"
                                    value={formData.maintenance}
                                    onChange={handleChange('maintenance')}
                                />
                            </Grid>
                            <Grid item xs={6} md={3}>
                                <TextField
                                    fullWidth
                                    label="Renting"
                                    type="number"
                                    value={formData.renting}
                                    onChange={handleChange('renting')}
                                />
                            </Grid>
                        </Grid>
                    </Grid>

                    {/* Size and Color */}
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Size"
                            value={formData.size}
                            onChange={handleChange('size')}
                            placeholder="S,M,L,XL"
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Color"
                            value={formData.color}
                            onChange={handleChange('color')}
                            placeholder="Black, White"
                        />
                    </Grid>

                    {/* Condition and Status */}
                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                            <InputLabel>Condition</InputLabel>
                            <Select
                                value={formData.condition}
                                label="Condition"
                                onChange={handleChange('condition')}
                            >
                                <MenuItem value="New">New</MenuItem>
                                <MenuItem value="Used">Used</MenuItem>
                                <MenuItem value="Refurbished">Refurbished</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                            <InputLabel>Status</InputLabel>
                            <Select
                                value={formData.status}
                                label="Status"
                                onChange={handleChange('status')}
                            >
                                <MenuItem value="In Stock">In Stock</MenuItem>
                                <MenuItem value="Low Stock">Low Stock</MenuItem>
                                <MenuItem value="Out Of Stock">Out Of Stock</MenuItem>
                                <MenuItem value="Rented Out">Rented Out</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* Selling Price */}
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Selling Price"
                            type="number"
                            value={formData.sellingPrice}
                            onChange={handleChange('sellingPrice')}
                            InputProps={{
                                startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>
                            }}
                        />
                    </Grid>

                    {/* Allow Rental Toggle */}
                    <Grid item xs={12} md={6}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={formData.allowRental}
                                    onChange={handleChange('allowRental')}
                                    color="primary"
                                />
                            }
                            label="Allow Rental ?"
                            sx={{ mt: 2 }}
                        />
                    </Grid>

                    {/* Rental Price and Security Deposit */}
                    {formData.allowRental && (
                        <>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Rental Price"
                                    type="number"
                                    value={formData.rentalPrice}
                                    onChange={handleChange('rentalPrice')}
                                    placeholder="Price per Day"
                                    InputProps={{
                                        startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Security Deposit"
                                    type="number"
                                    value={formData.securityDeposit}
                                    onChange={handleChange('securityDeposit')}
                                    InputProps={{
                                        startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>
                                    }}
                                />
                            </Grid>
                        </>
                    )}

                    {/* Description */}
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Description"
                            multiline
                            rows={4}
                            value={formData.description}
                            onChange={handleChange('description')}
                        />
                    </Grid>

                    {/* Product Images */}
                    <Grid item xs={12}>
                        <Typography variant="body2" fontWeight="medium" gutterBottom>
                            Product Images
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                            {formData.images.map((image, index) => (
                                <Box key={index} sx={{ position: 'relative' }}>
                                    <Box
                                        component="img"
                                        src={typeof image === 'string' ? image : URL.createObjectURL(image)}
                                        alt={`Product ${index + 1}`}
                                        sx={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 1 }}
                                    />
                                    <IconButton
                                        size="small"
                                        onClick={() => handleRemoveImage(index)}
                                        sx={{
                                            position: 'absolute',
                                            top: -8,
                                            right: -8,
                                            backgroundColor: 'error.main',
                                            color: 'white',
                                            '&:hover': { backgroundColor: 'error.dark' }
                                        }}
                                    >
                                        <CloseIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                            ))}
                        </Box>
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
                                multiple
                                onChange={handleImageUpload}
                            />
                        </Button>
                    </Grid>
                </Grid>
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
                    disabled={loading}
                    sx={{ backgroundColor: '#FE7E15' }}
                >
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ProductModal;
