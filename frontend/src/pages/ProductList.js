import React, { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom'; // Tạm thời không dùng Breadcrumbs link
import {
    Container,
    Grid,
    Typography,
    // Breadcrumbs,
    // Link as MuiLink,
    Box,
    Pagination,
    Paper,
    Divider,
    FormGroup,
    FormControlLabel,
    Checkbox,
    Button,
    Rating,
    Stack
} from '@mui/material';
// import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import './ProductList.css';
import ProductCard from '../components/common/ProductCard';
import MenuIcon from '@mui/icons-material/Menu';
import CategoryDrawer from '../components/common/CategoryDrawer';
// import CategoryList from '../components/common/CategoryList'; // Không dùng component cũ nữa
// import ProductFilters from '../components/common/ProductFilters'; // Không dùng sort cũ nữa

function ProductList() {
    const [products, setProducts] = useState([]);
    // const [categories, setCategories] = useState([]); // Tạm thời chưa dùng data danh mục thật để khớp giao diện ảnh
    // const [selectedSubCategoryId, setSelectedSubCategoryId] = useState(null);
    // const [sortOrder, setSortOrder] = useState('');

    const [page, setPage] = useState(1);
    const itemsPerPage = 9; // Ảnh hiển thị lưới 3x3 = 9 sản phẩm

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

    // --- Phần logic category cũ tạm thời comment lại để tập trung vào giao diện ---
    /* useEffect(() => {
        const fetchCategories = async () => {
           // ... (giữ nguyên logic cũ nếu cần dùng lại sau này)
        };
        fetchCategories();
    }, []);

    const [openCategoryId, setOpenCategoryId] = useState(null);
    const handleToggle = (id) => { setOpenCategoryId(openCategoryId === id ? null : id); };
    const handleSelectSubCategory = (id) => { setSelectedSubCategoryId(id); setPage(1); };
    const handleSortChange = (type) => { setSortOrder(type); setPage(1); };
    */
    // -------------------------------------------------------------------------


    // Logic lọc đơn giản (hiện tại chỉ lấy tất cả để hiển thị)
    const getFilteredProducts = () => {
        let result = Array.isArray(products) ? [...products] : [];
        // Logic lọc thật sẽ được thêm lại sau khi có API hỗ trợ các filter mới
        return result;
    };

    const filteredProducts = getFilteredProducts();
    // Chỉ lấy 9 sản phẩm đầu tiên để hiển thị giống ảnh mẫu (nếu dữ liệu ít)
    const productsToShow = filteredProducts.slice(0, 9);
    // Nếu muốn phân trang thật dựa trên dữ liệu tải về thì dùng dòng dưới:
    // const productsToShow = filteredProducts.slice((page - 1) * itemsPerPage, page * itemsPerPage);


    // Component Sidebar giả lập theo ảnh
    const MockSidebar = () => (
        <Paper elevation={0} sx={{ p: 2, backgroundColor: 'transparent' }} className="sidebar-filters">
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>Filters</Typography>

            <Box mt={3}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>BIKE CONDITION</Typography>
                <FormGroup>
                    <FormControlLabel control={<Checkbox size="small" />} label={<Typography variant="body2">New Arrival</Typography>} />
                    <FormControlLabel control={<Checkbox size="small" />} label={<Typography variant="body2">Like New / Good</Typography>} />
                    <FormControlLabel control={<Checkbox size="small" />} label={<Typography variant="body2">Clearance</Typography>} />
                </FormGroup>
            </Box>
            <Divider sx={{ my: 2 }} />

            <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>PRICE RANGE</Typography>
                <FormGroup>
                    <FormControlLabel control={<Checkbox size="small" />} label={<Typography variant="body2">Under $1000</Typography>} />
                    <FormControlLabel control={<Checkbox size="small" />} label={<Typography variant="body2">$1000 - $2000</Typography>} />
                    <FormControlLabel control={<Checkbox size="small" />} label={<Typography variant="body2">$2000 - $3000</Typography>} />
                    <FormControlLabel control={<Checkbox size="small" />} label={<Typography variant="body2">Above $3000</Typography>} />
                </FormGroup>
            </Box>
            <Divider sx={{ my: 2 }} />

            <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>SIZE</Typography>
                <Stack direction="row" spacing={1}>
                    <Button variant="outlined" size="small" sx={{ minWidth: '40px' }}>S</Button>
                    <Button variant="outlined" size="small" sx={{ minWidth: '40px' }}>M</Button>
                    <Button variant="outlined" size="small" sx={{ minWidth: '40px', bgcolor: '#e0e0e0' }}>L</Button>
                    <Button variant="outlined" size="small" sx={{ minWidth: '40px' }}>XL</Button>
                </Stack>
            </Box>
            <Divider sx={{ my: 2 }} />

            <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>COLOR</Typography>
                <Stack direction="row" spacing={1}>
                    <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: '#d32f2f', cursor: 'pointer' }} />
                    <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: '#1976d2', cursor: 'pointer' }} />
                    <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: '#000000', cursor: 'pointer', border: '2px solid #ddd' }} />
                    <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: '#fbc02d', cursor: 'pointer' }} />
                </Stack>
            </Box>
            <Divider sx={{ my: 2 }} />

            <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>RATING</Typography>
                <Stack spacing={1}>
                    <Rating value={5} readOnly size="small" />
                    <Rating value={4} readOnly size="small" />
                    <Rating value={3} readOnly size="small" />
                    <Rating value={2} readOnly size="small" />
                    <Rating value={1} readOnly size="small" />
                </Stack>
            </Box>

            <Button variant="contained" fullWidth sx={{ mt: 3, bgcolor: '#1976d2' }}>Apply</Button>
        </Paper>
    );

    return (
        <Container maxWidth="xl" sx={{ backgroundColor: '#fcf6f0', minHeight: '100vh', py: 4 }} >

            {/* Thêm wrap="nowrap" để đảm bảo không bao giờ bị rớt dòng nếu nội dung quá lớn */}
            <Grid container spacing={3}>

                {/* --- CỘT SIDEBAR (FILTERS) --- */}
                {/* xs={3}: Luôn chiếm 25% chiều rộng màn hình bất kể kích thước */}
                <Grid item xs={3} md={2.5}>
                    <MockSidebar />
                </Grid>

                {/* --- CỘT NỘI DUNG CHÍNH (SẢN PHẨM) --- */}
                {/* xs={9}: Luôn chiếm 75% chiều rộng màn hình còn lại */}
                <Grid item xs={9} md={9.5} width={"80%"}>

                    <Typography variant="h4" component="h1" sx={{ color: '#1976d2', fontWeight: 'bold', mb: 3 }}>
                        Mountain Bikes
                    </Typography>

                    <Paper elevation={0} sx={{ p: 3, bgcolor: 'transparent', border: '1px solid #e0e0e0', borderRadius: 2 }}>
                        <Grid container spacing={3}>
                            {productsToShow.map((product) => (
                                // Điều chỉnh responsive cho thẻ sản phẩm bên trong
                                // xs={12} (1 cột trên mobile nhỏ), sm={6} (2 cột), md={4} (3 cột)
                                <Grid item key={product.ProductID} xs={12} sm={6} md={4} lg={4}>
                                    <ProductCard product={product} />
                                </Grid>
                            ))}
                        </Grid>
                    </Paper>

                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                        <Pagination
                            count={3}
                            page={page}
                            onChange={handlePageChange}
                            color="primary"
                            shape="rounded"
                        />
                    </Box>
                </Grid>
            </Grid>
        </Container>
    );
}

export default ProductList;