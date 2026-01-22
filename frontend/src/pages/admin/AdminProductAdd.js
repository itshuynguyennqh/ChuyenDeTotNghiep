import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  Switch,
  FormControlLabel,
  Paper,
  IconButton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import { createAdminProduct } from '../../api/adminApi';
import { getAdminCategories } from '../../api/adminApi';
import StatusBadge from '../../components/admin/StatusBadge';

const AdminProductAdd = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    totalStock: '',
    availableStock: '',
    maintenanceStock: '',
    rentingStock: '',
    size: '',
    color: '',
    condition: 'New',
    sellingPrice: '',
    status: 'In Stock',
    allowRental: false,
    rentalPrice: '',
    securityDeposit: '',
    description: '',
    images: [],
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await getAdminCategories();
      // API returns PagedResponse with structure: {status, code, data: [...], pagination}
      // Extract the actual array from response.data.data
      setCategories(response.data?.data || []);
    } catch (error) {
      console.error('Failed to load categories:', error);
      setCategories([]); // Set empty array on error
    }
  };

  const handleChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [field]: value });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setFormData({
      ...formData,
      images: [...formData.images, ...files.map((file) => URL.createObjectURL(file))],
    });
  };

  const handleRemoveImage = (index) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createAdminProduct(formData);
      navigate('/admin/products');
    } catch (error) {
      console.error('Failed to create product:', error);
      alert('Failed to create product');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <IconButton onClick={() => navigate('/admin/products')}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" fontWeight="bold" sx={{ color: '#1A1A2E' }}>
          Add New Product
        </Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Fill in the details to add a new bicycle or accessory.
      </Typography>

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Product Name"
                value={formData.name}
                onChange={handleChange('name')}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Category"
                value={formData.category}
                onChange={handleChange('category')}
                required
              >
                {categories.map((cat) => (
                  <MenuItem key={cat.id} value={cat.name}>
                    {cat.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2 }}>
                  Stock Quantity
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      fullWidth
                      label="Total stock"
                      type="number"
                      value={formData.totalStock}
                      onChange={handleChange('totalStock')}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      fullWidth
                      label="Available stock"
                      type="number"
                      value={formData.availableStock}
                      onChange={handleChange('availableStock')}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      fullWidth
                      label="Maintenance"
                      type="number"
                      value={formData.maintenanceStock}
                      onChange={handleChange('maintenanceStock')}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      fullWidth
                      label="Renting"
                      type="number"
                      value={formData.rentingStock}
                      onChange={handleChange('rentingStock')}
                      required
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Size"
                value={formData.size}
                onChange={handleChange('size')}
                placeholder="S,M,L,XL"
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Color"
                value={formData.color}
                onChange={handleChange('color')}
                placeholder="Black, White"
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                select
                label="Condition"
                value={formData.condition}
                onChange={handleChange('condition')}
                required
              >
                <MenuItem value="New">New</MenuItem>
                <MenuItem value="Used">Used</MenuItem>
                <MenuItem value="Refurbished">Refurbished</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Selling Price"
                type="number"
                value={formData.sellingPrice}
                onChange={handleChange('sellingPrice')}
                InputProps={{ startAdornment: '$' }}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Status"
                value={formData.status}
                onChange={handleChange('status')}
                required
              >
                <MenuItem value="In Stock">In Stock</MenuItem>
                <MenuItem value="Low Stock">Low Stock</MenuItem>
                <MenuItem value="Out Of Stock">Out Of Stock</MenuItem>
                <MenuItem value="Rented Out">Rented Out</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.allowRental}
                    onChange={handleChange('allowRental')}
                    color="primary"
                  />
                }
                label="Allow Rental ?"
                sx={{ alignItems: 'center' }}
              />
            </Grid>

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
                    InputProps={{ startAdornment: '$' }}
                    required={formData.allowRental}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Security Deposit"
                    type="number"
                    value={formData.securityDeposit}
                    onChange={handleChange('securityDeposit')}
                    InputProps={{ startAdornment: '$' }}
                    required={formData.allowRental}
                  />
                </Grid>
              </>
            )}

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Description"
                value={formData.description}
                onChange={handleChange('description')}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                Product Images
              </Typography>
              <Box
                sx={{
                  border: '2px dashed #ccc',
                  borderRadius: 2,
                  p: 3,
                  textAlign: 'center',
                  cursor: 'pointer',
                  '&:hover': { borderColor: '#FF9800' },
                }}
              >
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="image-upload"
                  type="file"
                  multiple
                  onChange={handleImageUpload}
                />
                <label htmlFor="image-upload">
                  <CloudUploadIcon sx={{ fontSize: '3rem', color: '#999', mb: 1, cursor: 'pointer' }} />
                  <Typography variant="body2" color="text.secondary">
                    Click to upload images
                  </Typography>
                </label>
              </Box>
              {formData.images.length > 0 && (
                <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
                  {formData.images.map((img, index) => (
                    <Box key={index} sx={{ position: 'relative' }}>
                      <Box
                        component="img"
                        src={img}
                        alt={`Preview ${index + 1}`}
                        sx={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 1 }}
                      />
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveImage(index)}
                        sx={{
                          position: 'absolute',
                          top: -8,
                          right: -8,
                          backgroundColor: 'white',
                          '&:hover': { backgroundColor: '#f5f5f5' },
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              )}
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button variant="outlined" onClick={() => navigate('/admin/products')}>
                  Cancel
                </Button>
                <Button type="submit" variant="contained" sx={{ backgroundColor: '#FF9800' }}>
                  Save
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default AdminProductAdd;
