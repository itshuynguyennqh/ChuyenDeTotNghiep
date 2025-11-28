import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import {
    Box,
    Container,
    Grid,
    Card,
    CardContent,
    CardMedia,
    Typography,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Breadcrumbs,
    Link as MuiLink,
    Paper,
    Button,
    Stack,
    Rating,
    Pagination,
    Collapse,
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import './ProductList.css';

function ProductList() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    
    const [page, setPage] = useState(1);
    const itemsPerPage = 10;

    const handlePageChange = (event, value) => {
        setPage(value);
    };

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/products/');
                setProducts(response.data);
            } catch (error) {
                console.error("Có lỗi xảy ra khi lấy dữ liệu sản phẩm!", error);
            }
        };
        fetchProducts();
    }, []);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/categories/');
                setCategories(response.data);
            } catch (error) {
                console.error("Có lỗi xảy ra khi lấy dữ liệu danh mục!", error);
            }
        };
        fetchCategories();
    }, []);


    // 1. Khởi tạo state để theo dõi ID của danh mục đang được mở.
    const [openCategoryId, setOpenCategoryId] = useState(null);

    // 2. Hàm xử lý click để đóng/mở
    const handleToggle = (id) => {
        // Nếu ID hiện tại đang mở, đóng nó (set về null)
        // Nếu ID hiện tại đang đóng, mở nó (set về ID đó)
        setOpenCategoryId(openCategoryId === id ? null : id);
    };


    const productsToShow = products.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    return (
        <Container maxWidth="xl" sx={{ backgroundColor: '#fcf6f0', minHeight: '100vh', py: 4 }} >

            <Grid container spacing={2} wrap="nowrap">
                {/*side bar*/}
                <Grid item xs={12} md={2.5} minWidth={"auto"} >
                    <Box sx={{ pr: 2 }}>
                        {/*tiêu đề*/}
                        <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>Categories</Typography>
                        {/* danh sách các danh mục */}
                        <List component="nav">
                            {categories.map((category) => {
                                const isExpanded = openCategoryId === category.productcategoryid;

                                return (
                                    // Dùng React.Fragment để bọc ListItem và Collapse lại
                                    <React.Fragment key={category.productcategoryid}>
                                        <ListItem disablePadding sx={{ mr: 2 }}>

                                            {/* ListItemButton là nút bấm chính */}
                                            <ListItemButton
                                                onClick={() => handleToggle(category.productcategoryid)}
                                                sx={{
                                                    color: '#2c3e50',
                                                    '&:hover': { color: '#f37021', backgroundColor: 'transparent' }
                                                }}
                                            >
                                                <ListItemText primary={
                                                    <Typography variant="body1" fontWeight={500}>
                                                        {category.name}
                                                    </Typography>
                                                } />

                                                {/* icon mũi tên toggle */}
                                                {category.subcategories && category.subcategories.length > 0 &&
                                                    (isExpanded ? <ExpandLess /> : <ExpandMore />)
                                                }
                                            </ListItemButton>
                                        </ListItem>

                                        {/* hiển thị subcategories */}
                                        {category.subcategories && category.subcategories.length > 0 && (
                                            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                                                <List component="div" disablePadding sx={{ pl: 2, borderLeft: '2px solid #ddd', ml: 1.5 }}>
                                                    {category.subcategories.map((subcat) => (
                                                        <ListItemButton key={subcat.id} sx={{ py: 0.5 }}>
                                                            <ListItemText primary={
                                                                <Typography variant="body2" color="text.secondary">
                                                                    {subcat.name}
                                                                </Typography>
                                                            } />
                                                        </ListItemButton>
                                                    ))}
                                                </List>
                                            </Collapse>
                                        )}

                                    </React.Fragment>
                                );
                            })}
                        </List>
                    </Box>
                </Grid>

                {/*produclist*/}
                <Grid item xs={12} md={9.5} >
                    {/*đường link*/}
                    <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb" sx={{ mb: 2 }}>
                        <MuiLink underline="hover" color="inherit" component={Link} to="/">Home</MuiLink>
                        <Typography color="primary">Products</Typography>
                    </Breadcrumbs>
                    {/*filter*/}
                    <Box sx={{ mb: 4 }}>
                        <Paper elevation={0} sx={{ backgroundColor: '#f3e5d8', p: 2, borderRadius: 1 }}>
                            <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>Filters</Typography>
                            <Box sx={{ backgroundColor: '#fff', p: 1, borderRadius: 1, display: 'inline-flex', gap: 1 }}>
                                {['Catalogs', 'Price', 'Rating'].map((label) => (
                                    <Button
                                        key={label}
                                        variant="outlined"
                                        endIcon={<ArrowDropDownIcon />}
                                        sx={{ color: '#333', borderColor: '#ddd', textTransform: 'none', '&:hover': { borderColor: '#aaa', backgroundColor: '#f5f5f5' } }}
                                        size="small"
                                    >
                                        {label}
                                    </Button>
                                ))}
                            </Box>
                        </Paper>
                    </Box>
                    {/*List san  pham*/}
                    <Grid container spacing={2}>
                        {productsToShow.map((product) => (
                            <Grid item key={product.productid} xs={12} sm={6} md={4} lg={3}>
                                {/* THÊM className VÀO ĐÂY */}
                                <Card
                                    className="product-card"
                                    sx={{
                                        height: '100%',
                                        backgroundColor: '#fdf6ec',
                                        boxShadow: 'none',
                                        border: '1px solid #eee',
                                        transition: '0.3s',
                                        '&:hover': { transform: 'translateY(-5px)', boxShadow: 3 }
                                    }}
                                >
                                    {/*ảnh card*/}
                                    <Box sx={{ p: 2, backgroundColor: '#fff', m: 1, borderRadius: 1 }}>
                                        <CardMedia
                                            component="img"
                                            height="140"
                                            image={`https://demo.componentone.com/ASPNET/AdventureWorks/ProductImage.ashx?ProductID=${product.productid}&size=large`}
                                            alt={product.name}
                                            sx={{ objectFit: 'contain' }}
                                            onError={(e) => { e.target.onerror = null; e.target.src = `https://via.placeholder.com/300x200?text=No+Image`; }}
                                        />
                                    </Box>

                                    {/*nội dung card*/}
                                    <CardContent sx={{ pb: '16px !important', textAlign: 'left' }}>
                                        <Link to={`/products/${product.productid}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                            {/*tên sản phẩm*/}
                                            <Typography gutterBottom variant="body2" component="div" fontWeight="bold" className="product-name">
                                                {product.name}
                                            </Typography>
                                            {/*sao đánh giá*/}
                                            <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 1 }}>
                                                <Rating value={4.5} precision={0.5} readOnly size="small" sx={{ color: '#ffc107' }} />
                                                <Typography variant="caption" color="text.secondary">(175)</Typography>
                                            </Stack>
                                            {/*giá và số lượng đã bán*/}
                                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                {/*giá*/}
                                                <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
                                                    ${parseFloat(product.listprice).toFixed(2)}
                                                </Typography>
                                                {/*số lượng đã bán*/}
                                                <Typography variant="caption" color="text.secondary">
                                                    149 sold
                                                </Typography>
                                            </Stack>
                                        </Link>
                                    </CardContent>

                                </Card>
                            </Grid>
                        ))}
                    </Grid>

                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                        <Pagination
                            count={Math.ceil(products.length / itemsPerPage)}
                            page={page}
                            onChange={handlePageChange}
                            color="primary"
                        />
                    </Box>
                </Grid>


                </Grid>

        </Container>
    );
}

export default ProductList;
