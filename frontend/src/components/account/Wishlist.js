import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, Card, CardMedia, CardContent, IconButton, Button, CircularProgress, Alert, Pagination } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import { getWishlistAPI, removeFromWishlistAPI } from '../../api/userApi';

const Wishlist = () => {
    const navigate = useNavigate();
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ total_items: 0, total_pages: 1 });

    useEffect(() => {
        loadWishlist();
    }, [page]);

    const loadWishlist = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await getWishlistAPI({ page, limit: 12 });
            const wishlistData = response.data?.data || response.data || [];
            setWishlist(Array.isArray(wishlistData) ? wishlistData : []);
            setPagination(response.data?.pagination || response.pagination || { total_items: 0, total_pages: 1 });
        } catch (err) {
            setError('Failed to load wishlist');
            console.error('Failed to load wishlist:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveFromWishlist = async (productId) => {
        if (!window.confirm('Remove this item from wishlist?')) {
            return;
        }

        try {
            await removeFromWishlistAPI(productId);
            loadWishlist();
        } catch (err) {
            setError(err.response?.data?.detail || err.message || 'Failed to remove item');
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>My Wishlist</Typography>
            
            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

            {wishlist.length === 0 ? (
                <Paper variant="outlined" sx={{ p: 4, borderRadius: '20px', textAlign: 'center' }}>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                        Your wishlist is empty
                    </Typography>
                    <Button 
                        variant="contained"
                        onClick={() => navigate('/')}
                        sx={{ bgcolor: '#FF8C00', '&:hover': { bgcolor: '#e67e00' } }}
                    >
                        Browse Products
                    </Button>
                </Paper>
            ) : (
                <>
                    <Grid container spacing={3}>
                        {wishlist.map((item) => (
                            <Grid item xs={12} sm={6} md={4} lg={3} key={item.id || item.product_id}>
                                <Card 
                                    sx={{ 
                                        height: '100%', 
                                        display: 'flex', 
                                        flexDirection: 'column',
                                        cursor: 'pointer',
                                        '&:hover': { boxShadow: 4 }
                                    }}
                                    onClick={() => navigate(`/products/${item.product_id}`)}
                                >
                                    <CardMedia
                                        component="img"
                                        height="200"
                                        image={item.product_image || '/placeholder.png'}
                                        alt={item.product_name}
                                        sx={{ objectFit: 'cover' }}
                                    />
                                    <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                        <Box>
                                            <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                                                {item.product_name}
                                            </Typography>
                                            <Typography variant="h6" color="primary" fontWeight="bold">
                                                ${parseFloat(item.price || 0).toFixed(2)}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                                            <Button 
                                                size="small" 
                                                variant="contained"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/products/${item.product_id}`);
                                                }}
                                                sx={{ bgcolor: '#FF8C00', '&:hover': { bgcolor: '#e67e00' } }}
                                            >
                                                View Details
                                            </Button>
                                            <IconButton 
                                                color="error"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRemoveFromWishlist(item.product_id);
                                                }}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                    
                    {pagination.total_pages > 1 && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                            <Pagination 
                                count={pagination.total_pages} 
                                page={page} 
                                onChange={(e, value) => setPage(value)}
                                color="primary"
                            />
                        </Box>
                    )}
                </>
            )}
        </Box>
    );
};

export default Wishlist;
