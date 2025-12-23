import React, { useState, useEffect } from 'react';
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
    Badge,
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
                const response = await fetch('http://localhost:8000/api/product');
                const data = await response.json();
                setProducts(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Có lỗi xảy ra khi lấy dữ liệu sản phẩm!", error);
            }
        };
        fetchProducts();
    }, []);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/ProductCategory');
                const data = await response.json();
                setCategories(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Có lỗi xảy ra khi lấy dữ liệu danh mục!", error);
            }
        };
        fetchCategories();
    }, []);


    const [openCategoryId, setOpenCategoryId] = useState(null);

    const handleToggle = (id) => {
        setOpenCategoryId(openCategoryId === id ? null : id);
    };


    const productsToShow = Array.isArray(products) ? products.slice((page - 1) * itemsPerPage, page * itemsPerPage) : [];

    return (
        <Container maxWidth="xl" sx={{ backgroundColor: '#fcf6f0', minHeight: '100vh', py: 4 }} >

            <Grid container spacing={2} wrap="nowrap">
                <Grid item xs={12} md={2.5} minWidth={"auto"} >
                    <Box sx={{ pr: 2 }}>
                        <Typography     variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>Categories</Typography>
                        <List component="nav">
                                {categories.map((category) => {
                                const isExpanded = openCategoryId === category.productcategoryid;

                                return (
                                    <React.Fragment key={category.productcategoryid}>
                                        <ListItem disablePadding sx={{ mr: 2 }}>
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
                                                {category.subcategories && category.subcategories.length > 0 &&
                                                    (isExpanded ? <ExpandLess /> : <ExpandMore />)
                                                }
                                            </ListItemButton>
                                        </ListItem>
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

                <Grid item xs={12} md={9.5} minWidth={"auto"} >
                    <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb" sx={{ mb: 2 }}>
                        <MuiLink underline="hover" color="inherit" component={Link} to="/">Home</MuiLink>
                        <Typography color="primary">Products</Typography>
                    </Breadcrumbs>
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
                    <Grid container spacing={2}>
                        {productsToShow.map((product) => {
                            const listPrice = parseFloat(product.listprice);
                            const standardCost = parseFloat(product.standardcost);
                            const hasDiscount = standardCost > 0 && listPrice > standardCost;
                            const percentOff = hasDiscount ? Math.round(((listPrice - standardCost) / listPrice) * 100) : 0;

                            return (
                                <Grid item key={product.productid} xs={12} sm={6} md={4} lg={3}>
                                    <Card
                                        className="product-card"
                                        sx={{
                                            height: '100%',
                                            backgroundColor: '#fdf6ec',
                                            boxShadow: 'none',
                                            border: '1px solid #eee',
                                            transition: '0.3s',
                                            '&:hover': { transform: 'translateY(-5px)', boxShadow: 3 },
                                            position: 'relative', // Needed for Badge positioning
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
                                        <Link to={`/products/${product.productid}`} style={{ textDecoration: 'none', color: 'inherit' }}>
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
                                            <CardContent sx={{ pb: '16px !important', textAlign: 'left' }}>
                                                <Typography gutterBottom variant="body2" component="div" fontWeight="bold" className="product-name">
                                                    {product.name}
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
                                                        {product.inventory} in stock
                                                    </Typography>
                                                </Stack>
                                            </CardContent>
                                        </Link>
                                    </Card>
                                </Grid>
                            );
                        })}
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
