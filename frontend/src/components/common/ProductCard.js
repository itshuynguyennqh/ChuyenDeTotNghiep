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
} from '@mui/material';

function ProductCard({ product }) {
    // API mới trả về: id, name, price, thumbnail, rating, sold_count
    // Hỗ trợ cả format cũ (ProductID, ListPrice) và format mới (id, price)
    const productId = product.id || product.product_id || product.ProductID;
    const productName = product.name || product.Name;
    const productPrice = parseFloat(product.price || product.ListPrice || 0);
    const rating = product.rating || product.average_rating || 0;
    const soldCount = product.sold_count || product.total_sold || 0;
    
    // Logic lấy ảnh: Ưu tiên URL động với ProductID như API cũ, fallback về thumbnail từ API nếu không có ProductID
    const getProductImage = () => {
        if (productId) {
            // Luôn ưu tiên dùng URL động với ProductID như API cũ đã làm
            return `https://demo.componentone.com/ASPNET/AdventureWorks/ProductImage.ashx?ProductID=${productId}&size=large`;
        }
        // Nếu không có ProductID, dùng thumbnail từ API
        return product.thumbnail || product.Thumbnail || 'https://via.placeholder.com/300x200?text=No+Image';
    };
    
    const productImage = getProductImage();

    return (
        <Card
            className="product-card"
            sx={{
                width: '100%',
                maxWidth: '100%',
                height: '100%',
                backgroundColor: '#fff', // Nền trắng giống ảnh
                boxShadow: 'none',
                border: '1px solid #e0e0e0', // Viền mỏng
                borderRadius: '4px',
                transition: '0.3s',
                display: 'flex',
                flexDirection: 'column',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                },
                position: 'relative',
            }}
        >
            <Link to={`/products/${productId}`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>

                {/* Phần ảnh sản phẩm */}
                <Box sx={{ 
                    p: 2, 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center',
                    width: '100%',
                    minHeight: '200px'
                }}>
                    <CardMedia
                        component="img"
                        height="160"
                        image={productImage}
                        alt={productName}
                        sx={{ 
                            objectFit: 'contain', 
                            width: 'auto', 
                            maxWidth: '100%',
                            maxHeight: '160px'
                        }}
                        onError={(e) => {
                            // Nếu URL động lỗi, thử dùng thumbnail từ API
                            const thumbnail = product.thumbnail || product.Thumbnail;
                            if (thumbnail && e.target.src !== thumbnail) {
                                e.target.src = thumbnail;
                            } else {
                                // Cuối cùng fallback về placeholder
                                e.target.onerror = null;
                                e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                            }
                        }}
                    />
                </Box>

                <CardContent sx={{ p: '12px !important', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>

                    {/* Tên sản phẩm */}
                    <Box sx={{ minHeight: '48px', mb: 1 }}>
                        <Typography
                            variant="subtitle1"
                            component="div"
                            fontWeight="500"
                            sx={{
                                fontSize: '0.95rem',
                                display: '-webkit-box',
                                overflow: 'hidden',
                                WebkitBoxOrient: 'vertical',
                                WebkitLineClamp: 2, // Giới hạn 2 dòng
                                lineHeight: 1.3
                            }}
                        >
                            {productName}
                        </Typography>
                    </Box>

                    {/* Rating */}
                    <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 1 }}>
                        <Rating
                            value={rating}
                            precision={0.5}
                            readOnly
                            size="small"
                            sx={{ color: '#ffc107', fontSize: '1rem' }}
                        />
                        {rating > 0 && (
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                                ({rating.toFixed(1)})
                            </Typography>
                        )}
                    </Stack>

                    {/* Giá và Sold Count (Layout giống ảnh: Giá trái, Sold phải) */}
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-end" sx={{ mt: 'auto' }}>
                        <Typography variant="h6" fontWeight="bold" color="text.primary" sx={{ fontSize: '1.1rem' }}>
                            ${productPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </Typography>

                        {soldCount > 0 && (
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                                {soldCount} Sold
                            </Typography>
                        )}
                    </Stack>

                </CardContent>
            </Link>
        </Card>
    );
}

export default ProductCard;