import React, { useState, useEffect } from 'react';
import {
    Container,
    Grid,
    Typography,
    Box,
    Pagination,
    Paper,
    Divider,
    FormGroup,
    FormControlLabel,
    Checkbox,
    Button,
    Rating,
    Stack,
    CircularProgress,
    Alert
} from '@mui/material';
import './ProductList.css';
import ProductCard from '../components/common/ProductCard';
import { searchProducts } from '../api/storeApi';

function ProductList() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const itemsPerPage = 8; // 8 sản phẩm mỗi trang

    // Filter states
    const [selectedCategoryId, setSelectedCategoryId] = useState(null);
    const [condition, setCondition] = useState(null);
    const [priceRange, setPriceRange] = useState(null);
    const [sizes, setSizes] = useState([]);
    const [colors, setColors] = useState([]);
    const [minRating, setMinRating] = useState(null);
    const [search, setSearch] = useState('');

    const handlePageChange = (event, value) => {
        setPage(value);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const params = {
                    page,
                    limit: itemsPerPage,
                };

                // Add filters if selected
                if (selectedCategoryId) params.category_id = selectedCategoryId;
                if (condition) params.condition = condition;
                if (priceRange) params.price_range = priceRange;
                if (sizes.length > 0) params.size = sizes;
                if (colors.length > 0) params.color = colors;
                if (minRating) params.min_rating = minRating;
                if (search) params.search = search;

                const response = await searchProducts(params);
                
                // Debug: Log response để kiểm tra structure
                console.log('API Response:', response);
                console.log('Response data:', response.data);
                
                // API returns PagedResponse: {status, code, data: [...], pagination}
                // Hoặc có thể response.data trực tiếp là array nếu API trả về khác format
                let productsData = [];
                let pagination = {};
                
                if (response.data) {
                    // Kiểm tra nếu response.data là array trực tiếp
                    if (Array.isArray(response.data)) {
                        productsData = response.data;
                    } 
                    // Kiểm tra nếu response.data có .data property (PagedResponse format)
                    else if (response.data.data && Array.isArray(response.data.data)) {
                        productsData = response.data.data;
                        pagination = response.data.pagination || {};
                    }
                    // Kiểm tra nếu response.data có structure khác
                    else if (response.data.status === 'success' && Array.isArray(response.data.data)) {
                        productsData = response.data.data;
                        pagination = response.data.pagination || {};
                    }
                }
                
                console.log('Products data:', productsData);
                console.log('Pagination:', pagination);
                
                setProducts(productsData);
                setTotalPages(pagination.total_pages || 1);
            } catch (error) {
                console.error("Có lỗi xảy ra khi lấy dữ liệu sản phẩm!", error);
                setError(error.message || 'Không thể tải danh sách sản phẩm');
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [page, selectedCategoryId, condition, priceRange, sizes, colors, minRating, search]);

    // Filter handlers
    const handleConditionChange = (value) => {
        setCondition(condition === value ? null : value);
        setPage(1);
    };

    const handlePriceRangeChange = (value) => {
        setPriceRange(priceRange === value ? null : value);
        setPage(1);
    };

    const handleSizeToggle = (size) => {
        setSizes(prev => 
            prev.includes(size) 
                ? prev.filter(s => s !== size)
                : [...prev, size]
        );
        setPage(1);
    };

    const handleColorToggle = (color) => {
        setColors(prev => 
            prev.includes(color) 
                ? prev.filter(c => c !== color)
                : [...prev, color]
        );
        setPage(1);
    };

    const handleRatingChange = (rating) => {
        setMinRating(minRating === rating ? null : rating);
        setPage(1);
    };


    // Component Sidebar với filters thật
    const FilterSidebar = () => (
        <Paper elevation={0} sx={{ p: 2, backgroundColor: 'transparent' }} className="sidebar-filters">
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>Filters</Typography>

            <Box mt={3}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>BIKE CONDITION</Typography>
                <FormGroup>
                    <FormControlLabel 
                        control={<Checkbox size="small" checked={condition === 'New'} onChange={() => handleConditionChange('New')} />} 
                        label={<Typography variant="body2">New Arrival</Typography>} 
                    />
                    <FormControlLabel 
                        control={<Checkbox size="small" checked={condition === 'Good'} onChange={() => handleConditionChange('Good')} />} 
                        label={<Typography variant="body2">Like New / Good</Typography>} 
                    />
                    <FormControlLabel 
                        control={<Checkbox size="small" checked={condition === 'Clearance'} onChange={() => handleConditionChange('Clearance')} />} 
                        label={<Typography variant="body2">Clearance</Typography>} 
                    />
                </FormGroup>
            </Box>
            <Divider sx={{ my: 2 }} />

            <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>PRICE RANGE</Typography>
                <FormGroup>
                    <FormControlLabel 
                        control={<Checkbox size="small" checked={priceRange === 'under 1000'} onChange={() => handlePriceRangeChange('under 1000')} />} 
                        label={<Typography variant="body2">Under $1000</Typography>} 
                    />
                    <FormControlLabel 
                        control={<Checkbox size="small" checked={priceRange === '1000-2000'} onChange={() => handlePriceRangeChange('1000-2000')} />} 
                        label={<Typography variant="body2">$1000 - $2000</Typography>} 
                    />
                    <FormControlLabel 
                        control={<Checkbox size="small" checked={priceRange === '2000-3000'} onChange={() => handlePriceRangeChange('2000-3000')} />} 
                        label={<Typography variant="body2">$2000 - $3000</Typography>} 
                    />
                    <FormControlLabel 
                        control={<Checkbox size="small" checked={priceRange === 'above 3000'} onChange={() => handlePriceRangeChange('above 3000')} />} 
                        label={<Typography variant="body2">Above $3000</Typography>} 
                    />
                </FormGroup>
            </Box>
            <Divider sx={{ my: 2 }} />

            <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>SIZE</Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                    {['S', 'M', 'L', 'XL'].map(size => (
                        <Button 
                            key={size}
                            variant={sizes.includes(size) ? "contained" : "outlined"} 
                            size="small" 
                            sx={{ minWidth: '40px' }}
                            onClick={() => handleSizeToggle(size)}
                        >
                            {size}
                        </Button>
                    ))}
                </Stack>
            </Box>
            <Divider sx={{ my: 2 }} />

            <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>COLOR</Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                    {[
                        { name: 'Red', value: '#d32f2f' },
                        { name: 'Blue', value: '#1976d2' },
                        { name: 'Black', value: '#000000' },
                        { name: 'Yellow', value: '#fbc02d' }
                    ].map(color => (
                        <Box 
                            key={color.name}
                            sx={{ 
                                width: 24, 
                                height: 24, 
                                borderRadius: '50%', 
                                bgcolor: color.value, 
                                cursor: 'pointer',
                                border: colors.includes(color.name) ? '2px solid #1976d2' : '2px solid #ddd'
                            }}
                            onClick={() => handleColorToggle(color.name)}
                        />
                    ))}
                </Stack>
            </Box>
            <Divider sx={{ my: 2 }} />

            <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>RATING</Typography>
                <Stack spacing={1}>
                    {[5, 4, 3, 2, 1].map(rating => (
                        <Box 
                            key={rating}
                            sx={{ cursor: 'pointer', opacity: minRating === rating ? 1 : 0.6 }}
                            onClick={() => handleRatingChange(rating)}
                        >
                            <Rating value={rating} readOnly size="small" />
                        </Box>
                    ))}
                </Stack>
            </Box>

            {(condition || priceRange || sizes.length > 0 || colors.length > 0 || minRating) && (
                <Button 
                    variant="outlined" 
                    fullWidth 
                    sx={{ mt: 3, bgcolor: '#fff' }}
                    onClick={() => {
                        setCondition(null);
                        setPriceRange(null);
                        setSizes([]);
                        setColors([]);
                        setMinRating(null);
                        setPage(1);
                    }}
                >
                    Clear Filters
                </Button>
            )}
        </Paper>
    );

    return (
        <Container maxWidth="xl" sx={{ backgroundColor: '#F4E9DB', minHeight: '100vh', py: 4 }} >

            {/* Thêm wrap="nowrap" để đảm bảo không bao giờ bị rớt dòng nếu nội dung quá lớn */}
            <Grid container spacing={3}>

                {/* --- CỘT SIDEBAR (FILTERS) --- */}
                {/* xs={3}: Luôn chiếm 25% chiều rộng màn hình bất kể kích thước */}
                <Grid item xs={3} md={2.5} backgroundColor={"#FFF"} >
                    <FilterSidebar />
                </Grid>

                {/* --- CỘT NỘI DUNG CHÍNH (SẢN PHẨM) --- */}
                {/* xs={9}: Luôn chiếm 75% chiều rộng màn hình còn lại */}
                <Grid item xs={9} md={9.5} width={"80%"}>

                    <Typography variant="h4" component="h1" sx={{ color: '#1976d2', fontWeight: 'bold', mb: 3 }}>
                        Mountain Bikes
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {error}
                        </Alert>
                    )}

                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <Paper 
                            elevation={0} 
                            sx={{ 
                                p: 3, 
                                bgcolor: 'transparent', 
                                border: '1px solid #e0e0e0', 
                                borderRadius: 2,
                                width: '100%',
                                minHeight: 'auto',
                                height: 'auto',
                                display: 'flex',
                                flexDirection: 'column'
                            }}
                        >
                        <Grid 
                            container 
                            spacing={1}
                            sx={{
                                justifyContent: 'space-between',
                                alignItems: 'stretch'
                            }}
                        >
                            {products.length === 0 ? (
                                <Grid item xs={12}>
                                    <Box sx={{ textAlign: 'center', py: 5, width: '100%' }}>
                                        <Typography variant="h6" color="text.secondary">
                                            Không tìm thấy sản phẩm nào
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                            Số lượng sản phẩm: {products.length}
                                        </Typography>
                                    </Box>
                                </Grid>
                            ) : (
                                products.map((product) => (
                                    <Grid 
                                        item 
                                        key={product.id || product.product_id} 
                                        xs={12} 
                                        sm={6} 
                                        md={4} 
                                        lg={4}
                                        sx={{
                                            display: 'flex',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        <ProductCard product={product} />
                                    </Grid>
                                ))
                            )}
                        </Grid>
                        </Paper>
                    )}

                    {!loading && totalPages > 1 && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                            <Pagination
                                count={totalPages}
                                page={page}
                                onChange={handlePageChange}
                                color="primary"
                                shape="rounded"
                            />
                        </Box>
                    )}
                </Grid>
            </Grid>
        </Container>
    );
}

export default ProductList;