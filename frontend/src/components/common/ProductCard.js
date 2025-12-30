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
    // Trong AdventureWorks: ListPrice là giá bán niêm yết
    const listPrice = parseFloat(product.ListPrice);

    // Logic tạo số lượng "Sold" giả lập để giống ảnh (vì API thường không trả về field này)
    // Bạn có thể thay bằng dữ liệu thật nếu có: product.Sold
    const soldCount = 1661;
    const reviewCount = product.ReviewCount || 102; // Số lượng review giả lập hoặc lấy từ DB

    return (
        <Card
            className="product-card"
            sx={{
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
            <Link to={`/products/${product.ProductID}`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>

                {/* Phần ảnh sản phẩm */}
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <CardMedia
                        component="img"
                        height="160"
                        image={`https://demo.componentone.com/ASPNET/AdventureWorks/ProductImage.ashx?ProductID=${product.ProductID}&size=large`}
                        alt={product.Name}
                        sx={{ objectFit: 'contain', width: 'auto', maxWidth: '100%' }}
                        onError={(e) => { e.target.onerror = null; e.target.src = `https://via.placeholder.com/300x200?text=No+Image`; }}
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
                            {product.Name}
                        </Typography>
                    </Box>

                    {/* Rating */}
                    <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 1 }}>
                        <Rating
                            value={4.5}
                            precision={0.5}
                            readOnly
                            size="small"
                            sx={{ color: '#ffc107', fontSize: '1rem' }}
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                            ({reviewCount})
                        </Typography>
                    </Stack>

                    {/* Giá và Sold Count (Layout giống ảnh: Giá trái, Sold phải) */}
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-end" sx={{ mt: 'auto' }}>
                        <Typography variant="h6" fontWeight="bold" color="text.primary" sx={{ fontSize: '1.1rem' }}>
                            ${listPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </Typography>

                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                            {soldCount} Sold
                        </Typography>
                    </Stack>

                </CardContent>
            </Link>
        </Card>
    );
}

export default ProductCard;