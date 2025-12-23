import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Container,
    Grid,
    Typography,
    Breadcrumbs,
    Link as MuiLink,
    Box,
    Pagination,
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import './ProductList.css';
import ProductCard from '../components/ProductCard';
import CategoryList from '../components/CategoryList';
import ProductFilters from '../components/ProductFilters';

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
                const response = await fetch('http://localhost:8000/api/Product');
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
                    <CategoryList 
                        categories={categories} 
                        openCategoryId={openCategoryId} 
                        handleToggle={handleToggle} 
                    />
                </Grid>

                <Grid item xs={12} md={9.5} minWidth={"auto"} >
                    <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb" sx={{ mb: 2 }}>
                        <MuiLink underline="hover" color="inherit" component={Link} to="/">Home</MuiLink>
                        <Typography color="primary">Products</Typography>
                    </Breadcrumbs>
                    
                    <ProductFilters />

                    <Grid container spacing={2}>
                        {productsToShow.map((product) => (
                            <Grid item key={product.ProductID} xs={12} sm={6} md={4} lg={3}>
                                <ProductCard product={product} />
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
