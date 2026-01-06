import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, Typography, Box, IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { createCategoryAPI, updateCategoryAPI } from '../../../api/staffApi';

const CategoryModal = ({ open, onClose, category, onSuccess }) => {
    const [categoryName, setCategoryName] = useState('');
    const [loading, setLoading] = useState(false);
    const isEdit = !!category;

    useEffect(() => {
        if (open) {
            if (category) {
                setCategoryName(
                    category.CategoryName || 
                    category.categoryName || 
                    category.Name || 
                    category.name || 
                    ''
                );
            } else {
                setCategoryName('');
            }
        }
    }, [open, category]);

    const handleSubmit = async () => {
        if (!categoryName.trim()) {
            alert('Please enter a category name');
            return;
        }

        try {
            setLoading(true);
            const data = {
                CategoryName: categoryName.trim(),
                Name: categoryName.trim()
            };

            if (isEdit) {
                const id = category.ProductCategoryID || category.productCategoryID || category.id;
                await updateCategoryAPI(id, data);
            } else {
                await createCategoryAPI(data);
            }
            
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error('Failed to save category:', error);
            alert('Failed to save category');
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
            <Box sx={{ backgroundColor: '#F4E9DB', p: 2 }}>
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 0 }}>
                    <Box>
                        <Typography variant="h5" fontWeight="bold" color="#1976d2">
                            {isEdit ? 'Edit Category' : 'Add New Category'}
                        </Typography>
                        {!isEdit && (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                Create a new section for your bicycle inventory.
                            </Typography>
                        )}
                    </Box>
                    <IconButton onClick={onClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
            </Box>
            <DialogContent sx={{ p: 3, backgroundColor: 'white' }}>
                <TextField
                    fullWidth
                    label="Category Name"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    placeholder="e.g., Mountain Bikes"
                    sx={{ mt: 2 }}
                />
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
                    disabled={loading || !categoryName.trim()}
                    sx={{ backgroundColor: '#FE7E15' }}
                >
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CategoryModal;
