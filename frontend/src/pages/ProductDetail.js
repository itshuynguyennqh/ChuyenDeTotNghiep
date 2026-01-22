import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    Grid, Box, Typography, Button, CircularProgress, Stack, Rating, Card, CardContent,
    CardMedia, Breadcrumbs, Link as MuiLink, Tabs, Tab, Avatar, IconButton, Paper, Divider
} from '@mui/material';
// Import các Icon từ Material UI
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { Container } from '@mui/system';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { getProductDetail, getProductReviews, getSimilarProducts, addToCart } from '../api/storeApi';
import './ProductDetail.css';

function ProductDetail() {
    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [averageRating, setAverageRating] = useState(0);
    const [totalReviews, setTotalReviews] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [selectedTab, setSelectedTab] = useState(1); // 0 for Rent, 1 for Buy
    const [selectedSize, setSelectedSize] = useState(null);
    const [selectedColor, setSelectedColor] = useState(null);
    const [selectedImage, setSelectedImage] = useState(0);
    const [rentalStartDate, setRentalStartDate] = useState('12/25/2025');
    const [rentalEndDate, setRentalEndDate] = useState('12/31/2025');
    const [loading, setLoading] = useState(true);
    const [addToCartLoading, setAddToCartLoading] = useState(false);
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const response = await getProductDetail(id);
                // Backend trả về: {status, code, data: {...}}
                // axios response.data = {status, code, data: {...}}
                // Vậy product data thực sự là response.data.data
                const productData = response.data?.data || response.data;
                console.log('Product data:', productData); // Debug log
                
                if (!productData) {
                    console.error("No product data received");
                    return;
                }
                
                setProduct(productData);
                
                // Set default selected color and size from variants
                if (productData.variants && productData.variants.length > 0) {
                    const firstVariant = productData.variants[0];
                    if (!selectedColor && firstVariant.color) {
                        setSelectedColor(firstVariant.color);
                    }
                    if (!selectedSize && firstVariant.size) {
                        setSelectedSize(firstVariant.size);
                    }
                }
            } catch (error) {
                console.error("Error fetching product details!", error);
                console.error("Error details:", error.response?.data || error.message);
            } finally {
                setLoading(false);
            }
        };
        if (id) {
            fetchProduct();
        }
    }, [id]);

    useEffect(() => {
        const fetchRelatedProducts = async () => {
            try {
                const response = await getSimilarProducts(id);
                // Backend trả về: {status, code, data: [...]}
                const products = response.data?.data || response.data || [];
                setRelatedProducts(Array.isArray(products) ? products : []);
            } catch (error) {
                console.error("Error fetching related products!", error);
                setRelatedProducts([]);
            }
        };
        if (id) {
            fetchRelatedProducts();
        }
    }, [id]);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const response = await getProductReviews(id, 1, 5);
                // Backend trả về: {status, code, data: [...], pagination: {...}, average_rating: ...}
                const responseData = response.data;
                const reviewsData = responseData?.data || responseData;
                const reviewsArray = Array.isArray(reviewsData) 
                    ? reviewsData 
                    : (Array.isArray(reviewsData?.data) ? reviewsData.data : []);
                setReviews(reviewsArray);
                setAverageRating(responseData?.average_rating || response.average_rating || 0);
                setTotalReviews(responseData?.pagination?.total_items || response.pagination?.total_items || 0);
            } catch (error) {
                console.error("Error fetching reviews!", error);
                setReviews([]); // Ensure reviews is always an array even on error
                setAverageRating(0);
                setTotalReviews(0);
            }
        };
        if (id) {
            fetchReviews();
        }
    }, [id]);

    const handleQuantityChange = (type) => {
        if (type === 'increment') {
            setQuantity(q => q + 1);
        } else if (type === 'decrement' && quantity > 1) {
            setQuantity(q => q - 1);
        }
    };

    const handleAddToCart = async () => {
        if (addToCartLoading) return;
        setAddToCartLoading(true);
        try {
            const transactionType = selectedTab === 0 ? 'rent' : 'buy';
            const data = {
                product_id: product.product_id || product.id,
                quantity: quantity,
                transaction_type: transactionType
            };
            if (transactionType === 'rent') {
                const startDate = new Date(rentalStartDate);
                const endDate = new Date(rentalEndDate);
                const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
                data.rental_days = days || 1;
            }
            await addToCart(data);
            window.dispatchEvent(new CustomEvent('cartUpdated'));
            alert('Added to cart successfully!');
        } catch (error) {
            console.error('Error adding to cart:', error);
            if (error?.status === 401) {
                alert('Please log in to add items to cart.');
                navigate('/login', { state: { from: '/products/' + (product?.product_id || product?.id) } });
                return;
            }
            alert(error?.message || 'Failed to add to cart!');
        } finally {
            setAddToCartLoading(false);
        }
    };

    const handleBuyNow = () => {
        const productId = product.product_id || product.id;
        const productPrice = parseFloat(product.price) || 0;
        const orderData = {
            type: 'buy',
            product: {
                ProductID: productId,
                Name: product.name,
                Price: productPrice,
                Quantity: quantity,
                Size: selectedSize,
                Color: selectedColor,
                Image: product.thumbnail || (product.images && product.images[0]?.url) || ''
            }
        };
        navigate('/payment', { state: orderData });
    };

    const handleRentNow = () => {
        // Calculate days between rental dates
        const startDate = new Date(rentalStartDate);
        const endDate = new Date(rentalEndDate);
        const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days
        
        const productId = product.product_id || product.id;
        const rentPrice = product.rental_info?.rent_price ? parseFloat(product.rental_info.rent_price) : 20;
        const securityDeposit = product.rental_info?.security_deposit ? parseFloat(product.rental_info.security_deposit) : 0;
        
        const orderData = {
            type: 'rent',
            product: {
                ProductID: productId,
                Name: product.name,
                PricePerDay: rentPrice,
                Quantity: quantity,
                Size: selectedSize,
                Color: selectedColor,
                RentalStartDate: rentalStartDate,
                RentalEndDate: rentalEndDate,
                Days: days || 1,
                SecurityDeposit: securityDeposit,
                Image: product.thumbnail || (product.images && product.images[0]?.url) || ''
            }
        };
        navigate('/payment', { state: orderData });
    };

    const renderRentSection = () => {
        if (!product.rental_info?.is_rentable) {
            return (
                <Paper elevation={0} sx={{
                    border: '1px solid #ddd',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    mt: 2,
                    bgcolor: '#fcfcfc',
                    p: 3
                }}>
                    <Typography variant="body1" color="text.secondary">
                        This product is not available for rent.
                    </Typography>
                </Paper>
            );
        }

        const rentPrice = product.rental_info?.rent_price ? parseFloat(product.rental_info.rent_price) : 20;
        const rentUnit = product.rental_info?.rent_unit || 'day';
        
        // Get unique colors and sizes from variants
        const availableColors = [...new Set(product.variants?.filter(v => v.is_rentable).map(v => v.color).filter(Boolean))] || [];
        const availableSizes = [...new Set(product.variants?.filter(v => v.is_rentable).map(v => v.size).filter(Boolean))] || [];

        return (
            <Paper elevation={0} sx={{
                border: '1px solid #ddd',
                borderRadius: '20px',
                overflow: 'hidden',
                mt: 2,
                bgcolor: '#fcfcfc'
            }}>
                <Box sx={{ p: 3 }}>
                    {/* Price Per Day */}
                    <Typography variant="h4" fontWeight="bold" sx={{ mb: 2 }}>
                        ${rentPrice.toFixed(2)} <Typography component="span" variant="h6" color="text.secondary">/ {rentUnit}</Typography>
                    </Typography>

                    {/* Selection Group: Color & Size */}
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                        {/* Color Selection */}
                        {availableColors.length > 0 && (
                            <Grid item xs={6}>
                                <Typography variant="body2" fontWeight="bold" color="#666" sx={{ mb: 1 }}>
                                    Color: <Typography component="span" fontWeight="normal" color="text.secondary">{selectedColor || availableColors[0]}</Typography>
                                </Typography>
                                <Stack direction="row" spacing={1}>
                                    {availableColors.map((color) => (
                                        <Box
                                            key={color}
                                            onClick={() => setSelectedColor(color)}
                                            sx={{
                                                width: 32, height: 32, 
                                                bgcolor: color.toLowerCase() === 'black' ? '#1E1E1E' : 
                                                         color.toLowerCase() === 'white' ? '#FFFFFF' : '#ccc',
                                                borderRadius: '50%',
                                                border: selectedColor === color ? '2px solid #FF8C00' : '1px solid #ddd',
                                                p: '2px', cursor: 'pointer'
                                            }}
                                        />
                                    ))}
                                </Stack>
                            </Grid>
                        )}

                        {/* Size Selection */}
                        {availableSizes.length > 0 && (
                            <Grid item xs={6}>
                                <Typography variant="body2" fontWeight="bold" color="#666" sx={{ mb: 1 }}>Size</Typography>
                                <Stack direction="row" spacing={1}>
                                    {availableSizes.map((s) => (
                                        <Box
                                            key={s}
                                            onClick={() => setSelectedSize(s)}
                                            sx={{
                                                px: 1.5, py: 0.5, borderRadius: '8px', border: '1px solid #ddd',
                                                fontSize: '0.8rem', fontWeight: 'bold',
                                                color: selectedSize === s ? '#FF8C00' : '#666',
                                                borderColor: selectedSize === s ? '#FF8C00' : '#ddd',
                                                bgcolor: selectedSize === s ? '#FFF5EE' : 'transparent',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            {s}
                                        </Box>
                                    ))}
                                </Stack>
                            </Grid>
                        )}
                    </Grid>

                    {/* Quantity Stepper */}
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="body2" fontWeight="bold" color="#666" sx={{ mb: 1 }}>Quantity</Typography>
                        <Box sx={{
                            display: 'flex', alignItems: 'center', border: '1px solid #000',
                            borderRadius: '20px', width: 'fit-content', px: 1
                        }}>
                            <IconButton size="small" onClick={() => handleQuantityChange('decrement')}><RemoveIcon fontSize="small" /></IconButton>
                            <Typography sx={{ mx: 2, fontWeight: 'bold' }}>{quantity}</Typography>
                            <IconButton size="small" onClick={() => handleQuantityChange('increment')}><AddIcon fontSize="small" /></IconButton>
                        </Box>
                    </Box>

                    {/* Rental Period Picker */}
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="body2" fontWeight="bold" color="#666" sx={{ mb: 1 }}>Rental Period</Typography>
                        <Box sx={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            border: '1px solid #ddd', borderRadius: '12px', p: 1.5, bgcolor: '#fff'
                        }}>
                            <Typography variant="body2">12/25/2025</Typography>
                            <CalendarTodayIcon sx={{ fontSize: 18, color: '#666' }} />
                            <Typography variant="body2">→</Typography>
                            <Typography variant="body2">12/31/2025</Typography>
                            <CalendarTodayIcon sx={{ fontSize: 18, color: '#666' }} />
                        </Box>
                    </Box>

                    {/* Refundable Deposit Section */}
                    {product.rental_info?.security_deposit && parseFloat(product.rental_info.security_deposit) > 0 && (
                        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                            <Typography fontWeight="bold" color="#FF8C00">REFUNDABLE DEPOSIT</Typography>
                            <Typography variant="h4" fontWeight="bold">
                                ${parseFloat(product.rental_info.security_deposit).toFixed(2)}
                            </Typography>
                        </Box>
                    )}

                    {/* Info Box */}
                    <Box sx={{
                        bgcolor: '#FFF0E5', p: 1.5, borderRadius: '12px', mb: 3,
                        display: 'flex', gap: 1, alignItems: 'flex-start', border: '1px solid #FFE0CC'
                    }}>
                        <Box sx={{
                            width: 16, height: 16, borderRadius: '50%', border: '1px solid #4caf50',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 0.3
                        }}>
                            <Typography sx={{ color: '#4caf50', fontSize: '10px', fontWeight: 'bold' }}>✓</Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                            This amount is held temporarily. It will be fully released immediately after the bike is returned safely.
                        </Typography>
                    </Box>

                    {/* Action Buttons */}
                    <Stack direction="row" spacing={2}>
                        <Button
                            variant="contained"
                            fullWidth
                            disabled={addToCartLoading}
                            startIcon={addToCartLoading ? <CircularProgress size={20} color="inherit" /> : <ShoppingCartIcon />}
                            onClick={handleAddToCart}
                            sx={{
                                bgcolor: '#555', color: '#fff', borderRadius: '12px',
                                py: 1.5, textTransform: 'none', fontWeight: 'bold',
                                '&:hover': { bgcolor: '#333' }
                            }}
                        >
                            {addToCartLoading ? 'Adding...' : 'Add to cart'}
                        </Button>
                        <Button
                            variant="contained"
                            fullWidth
                            onClick={handleRentNow}
                            sx={{
                                bgcolor: '#FF8C00', color: '#fff', borderRadius: '12px',
                                py: 1.5, textTransform: 'none', fontWeight: 'bold',
                                '&:hover': { bgcolor: '#e67e00' }
                            }}
                        >
                            Rent Now
                        </Button>
                    </Stack>
                </Box>
            </Paper>
        );
    };

    const renderBuySection = () => {
        const productPrice = parseFloat(product.price) || 0;
        
        // Get unique colors and sizes from variants
        const availableColors = [...new Set(product.variants?.map(v => v.color).filter(Boolean))] || [];
        const availableSizes = [...new Set(product.variants?.map(v => v.size).filter(Boolean))] || [];

        return (
            <Paper elevation={0} sx={{
                border: '1px solid #ddd',
                borderRadius: '20px',
                overflow: 'hidden',
                mt: 2,
                bgcolor: '#fcfcfc'
            }}>
                <Box sx={{ p: 3 }}>
                    {/* Price Section */}
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="h4" fontWeight="bold" color="#000">
                            ${productPrice.toFixed(2)}
                        </Typography>
                    </Box>

                    {/* Selection Group: Color & Size */}
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                        {/* Color Selection */}
                        {availableColors.length > 0 && (
                            <Grid item xs={6}>
                                <Typography variant="body2" fontWeight="bold" color="#666" sx={{ mb: 1 }}>
                                    Color: <Typography component="span" fontWeight="normal" color="text.secondary">{selectedColor || availableColors[0]}</Typography>
                                </Typography>
                                <Stack direction="row" spacing={1}>
                                    {availableColors.map((color) => (
                                        <Box
                                            key={color}
                                            onClick={() => setSelectedColor(color)}
                                            sx={{
                                                width: 32, height: 32,
                                                bgcolor: color.toLowerCase() === 'black' ? '#1E1E1E' : 
                                                         color.toLowerCase() === 'white' ? '#FFFFFF' : '#ccc',
                                                borderRadius: '50%',
                                                border: selectedColor === color ? '2px solid #FF8C00' : '1px solid #ddd',
                                                p: '2px', cursor: 'pointer'
                                            }}
                                        />
                                    ))}
                                </Stack>
                            </Grid>
                        )}

                        {/* Size Selection */}
                        {availableSizes.length > 0 && (
                            <Grid item xs={6}>
                                <Typography variant="body2" fontWeight="bold" color="#666" sx={{ mb: 1 }}>Size</Typography>
                                <Stack direction="row" spacing={1}>
                                    {availableSizes.map((s) => (
                                        <Box
                                            key={s}
                                            onClick={() => setSelectedSize(s)}
                                            sx={{
                                                px: 1.5, py: 0.5, borderRadius: '8px', border: '1px solid #ddd',
                                                fontSize: '0.8rem', fontWeight: 'bold', 
                                                color: selectedSize === s ? '#FF8C00' : '#666',
                                                borderColor: selectedSize === s ? '#FF8C00' : '#ddd',
                                                bgcolor: selectedSize === s ? '#FFF5EE' : 'transparent',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            {s}
                                        </Box>
                                    ))}
                                </Stack>
                            </Grid>
                        )}
                    </Grid>

                    {/* Quantity Stepper */}
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="body2" fontWeight="bold" color="#666" sx={{ mb: 1 }}>Quantity</Typography>
                        <Box sx={{
                            display: 'flex', alignItems: 'center', border: '1px solid #000',
                            borderRadius: '20px', width: 'fit-content', px: 1
                        }}>
                            <IconButton size="small" onClick={() => handleQuantityChange('decrement')}>
                                <RemoveIcon fontSize="small" />
                            </IconButton>
                            <Typography sx={{ mx: 2, fontWeight: 'bold' }}>{quantity}</Typography>
                            <IconButton size="small" onClick={() => handleQuantityChange('increment')}>
                                <AddIcon fontSize="small" />
                            </IconButton>
                        </Box>
                    </Box>

                    {/* Action Buttons */}
                    <Stack direction="row" spacing={2}>
                        <Button
                            variant="contained"
                            fullWidth
                            disabled={addToCartLoading}
                            startIcon={addToCartLoading ? <CircularProgress size={20} color="inherit" /> : <ShoppingCartIcon />}
                            onClick={handleAddToCart}
                            sx={{
                                bgcolor: '#555', color: '#fff', borderRadius: '12px',
                                py: 1.5, textTransform: 'none', fontWeight: 'bold',
                                '&:hover': { bgcolor: '#333' }
                            }}
                        >
                            {addToCartLoading ? 'Adding...' : 'Add to cart'}
                        </Button>
                    <Button
                        variant="contained"
                        fullWidth
                        onClick={handleBuyNow}
                        sx={{
                            bgcolor: '#FF8C00', color: '#fff', borderRadius: '12px',
                            py: 1.5, textTransform: 'none', fontWeight: 'bold',
                            '&:hover': { bgcolor: '#e67e00' }
                        }}
                    >
                        Buy Now
                    </Button>
                    </Stack>
                </Box>
            </Paper>
        );
    };

    if (loading) {
        return (
            <Box className="loading-container">
                <CircularProgress />
            </Box>
        );
    }

    if (!product) {
        return (
            <Box className="loading-container">
                <Typography variant="h6" color="text.secondary">
                    Product not found
                </Typography>
            </Box>
        );
    }

    // Get product images from API
    const productImages = product.images && product.images.length > 0 
        ? product.images.map(img => img.url)
        : product.thumbnail 
        ? [product.thumbnail]
        : [];

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
    };

    // Build specifications from API data
    const specifications = [];
    if (product.specs) {
        if (product.specs.model) specifications.push({ key: "Model", value: product.specs.model });
        if (product.specs.color) specifications.push({ key: "Color", value: product.specs.color });
        if (product.specs.frame_material) specifications.push({ key: "Frame material", value: product.specs.frame_material });
        if (product.specs.frame_size) specifications.push({ key: "Frame size", value: product.specs.frame_size });
        if (product.specs.wheel_size) specifications.push({ key: "Wheel size", value: product.specs.wheel_size });
        if (product.specs.suspension) specifications.push({ key: "Suspension", value: product.specs.suspension });
    }

    // Get buyer images from reviews
    const buyerImages = Array.isArray(reviews)
        ? reviews
            .filter(review => review && review.review_image)
            .map(review => review.review_image)
            .slice(0, 4)
        : [];

    return (
        <Box className="product-detail-page">
            <Container maxWidth="xl">
                {/* Breadcrumb */}
                <Breadcrumbs
                    separator={<NavigateNextIcon fontSize="small" />}
                    className="breadcrumb"
                >
                    <MuiLink component={Link} to="/" className="breadcrumb-link">
                        Home
                    </MuiLink>
                    <MuiLink component={Link} to="/products" className="breadcrumb-link">
                        Mountain Bikes
                    </MuiLink>
                    <Typography className="breadcrumb-current">
                        {product.name}
                    </Typography>
                </Breadcrumbs>

                <Grid container spacing={4}>
                    {/* Left Side - Product Images */}
                    <Grid item xs={12} md={6} flexGrow={1}>
                        <Box className="image-gallery">
                            {productImages.length > 1 && (
                                <Stack className="thumbnail-column">
                                    {productImages.slice(0, Math.min(5, productImages.length)).map((img, index) => (
                                        <Box
                                            key={index}
                                            className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                                            onClick={() => setSelectedImage(index)}
                                        >
                                            <img src={img} alt={`Product ${index + 1}`} />
                                        </Box>
                                    ))}
                                </Stack>
                            )}
                            <Box className="main-image-container">
                                <img
                                    src={productImages[selectedImage] || product.thumbnail || ''}
                                    alt={product.name}
                                    className="main-image"
                                />
                            </Box>
                        </Box>
                    </Grid>

                    {/* Right Side - Product Info */}
                    <Grid item xs={12} md={6}>
                        <Box className="product-info-card" width="600px">
                            <Typography variant="h4" className="product-title">
                                {product.name}
                            </Typography>
                            {product.description && (
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
                                    {product.description}
                                </Typography>
                            )}

                            <Box className="tab-container">
                                <Tabs
                                    value={selectedTab}
                                    onChange={(e, newValue) => setSelectedTab(newValue)}
                                    className="purchase-tabs"
                                >
                                    <Tab label="Rent" />
                                    <Tab label="Buy" />
                                </Tabs>
                            </Box>

                            {selectedTab === 0 ? renderRentSection() : renderBuySection()}
                        </Box>
                    </Grid>
                </Grid>

                {/* Specifications Section */}
                <Box className="specifications-section">
                    <Typography variant="h5" className="section-title">Specifications</Typography>
                    <Box className="specs-grid">
                        {specifications.map((spec, index) => (
                            <Box className="spec-row" key={index}>
                                <Typography className="spec-label">{spec.key}</Typography>
                                <Typography className="spec-value">{spec.value}</Typography>
                            </Box>
                        ))}
                    </Box>
                </Box>

                {/* Product Ratings Section */}
                <Box className="ratings-section">
                    <Box className="ratings-header">
                        <Typography variant="h5" className="section-title">Product ratings</Typography>
                        <MuiLink href="#" className="view-all-link">
                            View All <NavigateNextIcon fontSize="small" />
                        </MuiLink>
                    </Box>

                    <Box className="rating-summary">
                        <Stack direction="row" spacing={1} alignItems="center">
                            <Rating value={averageRating} precision={0.1} readOnly size="medium" />
                            <Typography className="rating-score">{averageRating.toFixed(1)}/5</Typography>
                            <Typography className="rating-count">({totalReviews} reviews)</Typography>
                        </Stack>
                    </Box>

                    {/* Pictures from buyers */}
                    {buyerImages.length > 0 && (
                        <Box className="buyer-pictures">
                            <Typography className="subsection-title">Pictures from buyers</Typography>
                            <Stack direction="row" spacing={1} className="buyer-images-grid">
                                {buyerImages.map((img, index) => (
                                    <Box key={index} className="buyer-image">
                                        <img src={img} alt={`Buyer ${index + 1}`} />
                                    </Box>
                                ))}
                                {totalReviews > buyerImages.length && (
                                    <Box className="buyer-image more-images">
                                        <Typography>+{totalReviews - buyerImages.length}</Typography>
                                    </Box>
                                )}
                            </Stack>
                            {totalReviews > buyerImages.length && (
                                <MuiLink href="#" className="view-all-small">
                                    View All ({totalReviews}) <NavigateNextIcon fontSize="small" />
                                </MuiLink>
                            )}
                        </Box>
                    )}

                    {/* Customer Reviews */}
                    <Box className="reviews-list">
                        {Array.isArray(reviews) && reviews.length > 0 ? (
                            reviews.map((review, index) => {
                                const initials = review.username ? review.username.substring(0, 2).toUpperCase() : 'AN';
                                return (
                                    <Box key={index} className="review-item">
                                        <Stack direction="row" spacing={2}>
                                            <Avatar className="review-avatar">{initials}</Avatar>
                                            <Box className="review-content">
                                                <Box className="review-header">
                                                    <Typography className="reviewer-name">{review.username || 'Anonymous'}</Typography>
                                                    <Rating value={review.rate} readOnly size="small" />
                                                    <Typography className="review-date">{formatDate(review.date)}</Typography>
                                                </Box>
                                                {review.comment && (
                                                    <Typography className="review-comment">
                                                        {review.comment}
                                                    </Typography>
                                                )}
                                                {review.review_image && (
                                                    <Box className="review-image">
                                                        <img
                                                            src={review.review_image}
                                                            alt="Review"
                                                        />
                                                    </Box>
                                                )}
                                                <Box className="review-actions">
                                                    <Button
                                                        size="small"
                                                        startIcon={<ThumbUpOutlinedIcon />}
                                                        className="helpful-btn"
                                                    >
                                                        Helpful ({review.is_helpful || 0})
                                                    </Button>
                                                    <Button size="small" className="report-btn">
                                                        Report abuse
                                                    </Button>
                                                </Box>
                                            </Box>
                                        </Stack>
                                    </Box>
                                );
                            })
                        ) : (
                            <Typography variant="body2" color="text.secondary">
                                No reviews yet. Be the first to review this product!
                            </Typography>
                        )}
                    </Box>
                </Box>

                {/* You may also like Section */}
                {relatedProducts.length > 0 && (
                    <Box className="related-products-section">
                        <Typography className="section-subtitle">You may also like</Typography>
                        <Grid container spacing={2}>
                            {relatedProducts.map((relatedProduct) => (
                                <Grid item key={relatedProduct.product_id || relatedProduct.id} xs={6} sm={4} md={3} lg={2.4}>
                                    <Card className="related-product-card">
                                        <Link
                                            to={`/products/${relatedProduct.product_id || relatedProduct.id}`}
                                            className="product-link"
                                        >
                                            <CardMedia
                                                component="img"
                                                image={relatedProduct.thumbnail || 'https://via.placeholder.com/150'}
                                                alt={relatedProduct.name}
                                                className="related-product-image"
                                            />
                                            <CardContent className="related-product-content">
                                                <Typography className="related-product-name">
                                                    {relatedProduct.name}
                                                </Typography>
                                                <Rating value={relatedProduct.average_rating || 0} precision={0.5} readOnly size="small" />
                                                <Typography className="related-product-reviews">
                                                    ({relatedProduct.total_sold || 0})
                                                </Typography>
                                                <Box className="related-product-footer">
                                                    <Typography className="related-product-price">
                                                        ${parseFloat(relatedProduct.price || 0).toFixed(2)}
                                                    </Typography>
                                                    <Typography className="related-product-sold">
                                                        {relatedProduct.total_sold || 0} sold
                                                    </Typography>
                                                </Box>
                                            </CardContent>
                                        </Link>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                )}
            </Container>
        </Box>
    );
}

export default ProductDetail;