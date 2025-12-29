import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Button, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Paper, IconButton,
    CircularProgress
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { fetchProductsAPI, deleteProductAPI } from '../../api/productApi';

const AdminProductList = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadProducts = async () => {
        try {
            setLoading(true);
            const response = await fetchProductsAPI();
            setProducts(response.data);
        } catch (error) {
            console.error("Failed to fetch products", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProducts();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await deleteProductAPI(id);
                loadProducts(); // Reload list
            } catch (error) {
                console.error("Failed to delete product", error);
                alert("Failed to delete product");
            }
        }
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" fontWeight="bold">Product Management</Typography>
                <Button variant="contained" startIcon={<AddIcon />}>
                    Add Product
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                    <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Image</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>Product Number</TableCell>
                            <TableCell align="right">Price</TableCell>
                            <TableCell align="center">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {products.map((product) => (
                            <TableRow key={product.ProductID}>
                                <TableCell>{product.ProductID}</TableCell>
                                <TableCell>
                                    <img 
                                        src={`https://demo.componentone.com/ASPNET/AdventureWorks/ProductImage.ashx?ProductID=${product.ProductID}&size=small`} 
                                        alt={product.Name}
                                        style={{ width: 50, height: 50, objectFit: 'contain' }}
                                    />
                                </TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>{product.Name}</TableCell>
                                <TableCell>{product.ProductNumber}</TableCell>
                                <TableCell align="right">${parseFloat(product.ListPrice).toFixed(2)}</TableCell>
                                <TableCell align="center">
                                    <IconButton color="primary" aria-label="edit">
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton 
                                        color="error" 
                                        aria-label="delete"
                                        onClick={() => handleDelete(product.ProductID)}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default AdminProductList;