import React from 'react';
import { Link } from 'react-router-dom';
import {
    Card,
    CardContent,
    CardMedia,
    Typography,
    Box,
    Stack,
    Rating,
    Badge,
} from '@mui/material';

function ProductCard({ product }) {
    const listPrice = parseFloat(product.ListPrice);
    const standardCost = parseFloat(product.StandardCost);
    const hasDiscount = standardCost > 0 && listPrice > standardCost;
    const percentOff = hasDiscount ? Math.round(((listPrice - standardCost) / listPrice) * 100) : 0;

    return (
        <Card
            className="product-card"
            sx={{
                height: '100%',
                backgroundColor: '#fdf6ec',
                boxShadow: 'none',
                border: '1px solid #eee',
                transition: '0.3s',
                '&:hover': { transform: 'translateY(-5px)', boxShadow: 3 },
                position: 'relative',
            }}
        >
            {hasDiscount && (
                <Badge
                    badgeContent={`-${percentOff}%`}
                    color="error"
                    sx={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                    }}
                />
            )}
            <Link to={`/products/${product.ProductID}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <Box sx={{ p: 2, backgroundColor: '#fff', m: 1, borderRadius: 1 }}>
                    <CardMedia
                        component="img"
                        height="140"
                        image={`https://demo.componentone.com/ASPNET/AdventureWorks/ProductImage.ashx?ProductID=${product.ProductID}&size=large`}
                        alt={product.Name}
                        sx={{ objectFit: 'contain' }}
                        onError={(e) => { e.target.onerror = null; e.target.src = `https://via.placeholder.com/300x200?text=No+Image`; }}
                    />
                </Box>
                <CardContent sx={{ pb: '16px !important', textAlign: 'left' }}>
                    <Typography gutterBottom variant="body2" component="div" fontWeight="bold" className="product-name">
                        {product.Name}
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 1 }}>
                        <Rating value={4.5} precision={0.5} readOnly size="small" sx={{ color: '#ffc107' }} />
                        <Typography variant="caption" color="text.secondary">(175)</Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Stack>
                            <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
                                ${standardCost.toFixed(2)}
                            </Typography>
                            {hasDiscount && (
                                <Typography variant="caption" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                                    ${listPrice.toFixed(2)}
                                </Typography>
                            )}
                        </Stack>
                        <Typography variant="caption" color="text.secondary">
                            {product.Inventory} in stock
                        </Typography>
                    </Stack>
                </CardContent>
            </Link>
        </Card>
    );
}

export default ProductCard;
