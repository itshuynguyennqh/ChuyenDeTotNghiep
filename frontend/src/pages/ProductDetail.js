import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom'; // Thêm Link cho Breadcrumbs và Card
import {
    Grid, Box, Typography, Button, CircularProgress, Divider, Stack, Rating, Card, CardContent, CardMedia, Breadcrumbs, Link as MuiLink
} from '@mui/material';
import { Container } from '@mui/system';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { Table, TableBody, TableCell, TableContainer, TableRow } from '@mui/material'; // THÊM

// Dữ liệu giả lập cho phần Specs vì không có trong API Response
const productSpecifications = [
    { key: "Model", value: "Mountain 100" },
    { key: "Color", value: "Black" },
    { key: "Frame material", value: "High strength aluminum alloy" },
    { key: "Frame size", value: "48 cm" },
    { key: "Wheel size", value: "27.5 inchs" },
    { key: "Suspension", value: "Font suspension fork with shock absorb" },
];


function ProductDetail() {
    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]); // STATE MỚI cho sản phẩm liên quan
    const [quantity, setQuantity] = useState(1); // State cho số lượng
    const { id } = useParams();

    // --- LOGIC FETCH SẢN PHẨM CHÍNH ---
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/api/products/${id}/`);
                setProduct(response.data);
            } catch (error) {
                console.error("Có lỗi xảy ra khi lấy chi tiết sản phẩm!", error);
            }
        };
        fetchProduct();
    }, [id]);

    // --- LOGIC FETCH SẢN PHẨM LIÊN QUAN (Tái sử dụng) ---
    useEffect(() => {
        const fetchRelatedProducts = async () => {
            try {
                // Tái sử dụng endpoint list, giới hạn 10 sản phẩm
                const response = await axios.get('http://localhost:8000/api/products/?limit=10');
                setRelatedProducts(response.data.slice(0, 10)); // Lấy 10 sản phẩm đầu tiên
            } catch (error) {
                console.error("Có lỗi xảy ra khi lấy dữ liệu sản phẩm liên quan!", error);
            }
        };
        fetchRelatedProducts();
    }, []);
    // ----------------------------------------------------

    const handleQuantityChange = (type) => {
        if (type === 'increment') {
            setQuantity(q => q + 1);
        } else if (type === 'decrement' && quantity > 1) {
            setQuantity(q => q - 1);
        }
    };

    if (!product) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f3e5d8' }}>
                <CircularProgress />
            </Box>
        );
    }

    // Giá giả lập (dùng listprice làm giá bán, sale là giá ban đầu)
    const listPrice = parseFloat(product.listprice);
    const originalPrice = listPrice / 0.5; // Giả sử đang giảm 50%
    const percentOff = 50;

    // Tên giả lập
    const productName = product.name || "Mountain-100 Black, 48";


    return (
        <Box sx={{ flexGrow: 1, minHeight: '100vh', background: "#f3e5d8", py: 4 }} >
            <Container maxWidth="lg" sx={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', p: 4 }}>

                {/*Đường dẫn*/}
                <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb" sx={{ mb: 4 }}>
                    <MuiLink underline="hover" color="inherit" component={Link} to="/">Home</MuiLink>
                    <MuiLink underline="hover" color="inherit" component={Link} to="/products">Mountain Bikes</MuiLink>
                    <Typography color="text.primary">{productName}</Typography>
                </Breadcrumbs>
                {/*Ảnh/ nội dung sản phầm/specs/sản phẩm khác*/}
                <Grid container spacing={4}>
                    {/*Ảnh và ảnh khác*/}
                    <Grid item xs={12} md={5}>
                        <Stack direction="row" sx={{ width: 'fit-content' }}>
                            {/*Ảnh khác*/}
                            <Stack direction="column" spacing={1} sx={{ mt: 1, mr: 1, color: '#f37021' }}>
                                <Box component="span" sx={{ fontSize: 30, border: '2px solid #eee', borderRadius: 1, p: 0.5, cursor: 'pointer' }}>🚲</Box>
                                <Box component="span" sx={{ fontSize: 30, border: '2px solid #eee', borderRadius: 1, p: 0.5, cursor: 'pointer' }}>🚴</Box>
                            </Stack>
    
                            {/*Ảnh chính*/}
                            <Box sx={{display: 'flex',justifyContent: 'center', alignItems: 'center',   p: 1, border: '1px solid #eee', borderRadius: 1, backgroundColor: '#F4E9DB' }}>
                                <Box
                                    component="img"
                                    src={`https://demo.componentone.com/ASPNET/AdventureWorks/ProductImage.ashx?ProductID=${product.productid}&size=large`}
                                    alt={product.name}
                                    sx={{ width: '60vh', height: 'auto', borderRadius: '4px' }}
                                    onError={(e) => { e.target.onerror = null; e.target.src = `https://via.placeholder.com/400x300?text=${productName}`; }}
                                />
                            </Box>
                        </Stack>
                    </Grid>

                    {/*Nội dung sản phẩm*/}
                    <Grid item xs={12} md={7} flexGrow={'1'}>
                        {/* Tên sản phẩm */}
                        <Typography variant="h4" gutterBottom fontWeight="bold">{productName}</Typography>

                        {/* Thời gian khuyến mãi */}
                        <Box sx={{ backgroundColor: '#f44336', color: '#fff', display: 'inline-block', px: 1, py: 0.5, borderRadius: '4px', mb: 2 }}>
                            <Typography variant="caption" fontWeight="bold">Sale ends in 12 hours</Typography>
                        </Box>
                        <Typography variant="caption" display="block" color="text.secondary" sx={{ mb: 2 }}>
                            Local taxes included (where applicable)
                        </Typography>

                        {/* Giá */}
                        <Stack direction="row" spacing={2} alignItems="baseline" sx={{ mb: 3 }}>
                            <Typography variant="h5" color="primary" fontWeight="bold">${listPrice.toFixed(2)}</Typography>
                            <Typography variant="body1" color="text.secondary" sx={{ textDecoration: 'line-through' }}>${originalPrice.toFixed(2)}</Typography>
                            <Typography variant="body1" color="error" fontWeight="bold">({percentOff}% Off)</Typography>
                        </Stack>

                        <Divider sx={{ mb: 3 }} />

                        {/* Số lượng */}
                        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                            <Typography variant="subtitle1" fontWeight="bold">Quantity:</Typography>
                            <Stack direction="row" sx={{ border: '1px solid #ddd', borderRadius: 1, overflow: 'hidden' }}>
                                <Button onClick={() => handleQuantityChange('decrement')} size="small" sx={{ p: 1, minWidth: 40 }}><RemoveIcon /></Button>
                                <Typography sx={{ p: 1, borderLeft: '1px solid #ddd', borderRight: '1px solid #ddd' }}>{quantity}</Typography>
                                <Button onClick={() => handleQuantityChange('increment')} size="small" sx={{ p: 1, minWidth: 40 }}><AddIcon /></Button>
                            </Stack>
                            <Typography variant="body2" color="text.secondary">
                                + 750 in stock
                            </Typography>
                        </Stack>

                        {/* Nút bấm */}
                        <Stack spacing={1}>
                            <Button
                                variant="contained"
                                sx={{ backgroundColor: '#f37021', '&:hover': { backgroundColor: '#e0651d' } }}
                                startIcon={<ShoppingCartIcon />}
                                size="large"
                            >
                                ADD TO CART
                            </Button>
                            <Button
                                variant="contained"
                                color="primary"
                                size="large"
                            >
                                BUY IT NOW
                            </Button>
                        </Stack>
                    </Grid>

                    {/* --- 2. THÔNG SỐ KỸ THUẬT (SPECIFICATIONS) --- */}
                    <Grid item xs={12} flexGrow={1}>
                        <Box sx={{ background: "#fdf0e5", p: 3, borderRadius: '8px' }}>
                            <Typography variant="h6" fontWeight="bold" gutterBottom>Specifications</Typography>
                            {/* SỬA: Dùng Table để hiển thị 2 cột */}
                            <TableContainer>
                                <Table size="small" aria-label="product specifications">
                                    <TableBody>
                                        {productSpecifications.map((spec) => (
                                            <TableRow key={spec.key} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                                <TableCell component="th" scope="row" sx={{ fontWeight: 'bold', border: 'none', width: '30%', pl: 0 }}>{spec.key}</TableCell>
                                                <TableCell sx={{ border: 'none', color: 'text.secondary' }}>{spec.value}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>
                    </Grid>

                    {/* ---SẢN PHẨM LIÊN QUAN (RELATED PRODUCTS) --- */}
                    <Grid item xs={12} sx={{ mt: 3 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                            <Typography variant="h6" fontWeight="bold">Product ratings</Typography>
                            <MuiLink href="#" underline="hover" color="primary">View All</MuiLink>
                        </Stack>

                        {/* Grid Card Sản phẩm liên quan */}
                        <Grid container spacing={2} justifyContent={"center"} >
                            {relatedProducts.slice(0, 10).map((product) => (
                                <Grid item key={product.productid} xs={6} sm={4} md={3} lg={2.4}>
                                    {/* Sử dụng lg={2.4} để mô phỏng 5 cột trên màn hình lớn */}
                                    <Card
                                        // Sử dụng style giống ProductList.js
                                        sx={{
                                            height: '100%',
                                            backgroundColor: '#fdf6ec',
                                            boxShadow: 'none',
                                            border: '1px solid #eee',
                                            transition: '0.3s',
                                            '&:hover': { transform: 'translateY(-5px)', boxShadow: 3 }
                                        }}
                                    >
                                        <Link to={`/products/${product.productid}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                            <Box sx={{ p: 1, backgroundColor: '#fff', m: 0.5, borderRadius: 1 }}>
                                                <CardMedia
                                                    component="img"
                                                    height="100"
                                                    image={`https://demo.componentone.com/ASPNET/AdventureWorks/ProductImage.ashx?ProductID=${product.productid}&size=large`}
                                                    alt={product.name}
                                                    sx={{ objectFit: 'contain' }}
                                                    onError={(e) => { e.target.onerror = null; e.target.src = `https://via.placeholder.com/150x100?text=No+Image`; }}
                                                />
                                            </Box>
                                            <CardContent sx={{ pb: '8px !important', pt: 1, textAlign: 'left' }}>
                                                <Typography variant="caption" component="div" fontWeight="bold" className="product-name" sx={{ maxHeight: '2.4em', overflow: 'hidden' }}>
                                                    {product.name}
                                                </Typography>
                                                <Stack direction="row" alignItems="center" spacing={0.5} sx={{ my: 0.5 }}>
                                                    <Rating value={4.5} precision={0.5} readOnly size="small" sx={{ color: '#ffc107', fontSize: '0.8rem' }} />
                                                    <Typography variant="caption" color="text.secondary">(175)</Typography>
                                                </Stack>
                                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                    <Typography variant="subtitle2" fontWeight="bold" color="text.primary">
                                                        ${parseFloat(product.listprice).toFixed(2)}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        149 sold
                                                    </Typography>
                                                </Stack>
                                            </CardContent>
                                        </Link>
                                    </Card>

                                </Grid>
                            ))}
                        </Grid>

                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
}

export default ProductDetail;