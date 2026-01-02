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
import { fetchProductDetailAPI, fetchProductsAPI, addToCartAPI } from '../api/productApi';
import './ProductDetail.css';

function ProductDetail() {
    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [quantity, setQuantity] = useState(1);
    const [selectedTab, setSelectedTab] = useState(1); // 0 for Rent, 1 for Buy
    const [selectedSize, setSelectedSize] = useState('L');
    const [selectedColor, setSelectedColor] = useState('Black');
    const [selectedImage, setSelectedImage] = useState(0);
    const [rentalStartDate, setRentalStartDate] = useState('12/25/2025');
    const [rentalEndDate, setRentalEndDate] = useState('12/31/2025');
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await fetchProductDetailAPI(id);
                const productData = Array.isArray(response.data) ? response.data[0] : response.data;
                setProduct(productData);
            } catch (error) {
                console.error("Error fetching product details!", error);
            }
        };
        fetchProduct();
    }, [id]);

    useEffect(() => {
        const fetchRelatedProducts = async () => {
            try {
                const response = await fetchProductsAPI({ limit: 10 });
                setRelatedProducts(response.data.slice(0, 10));
            } catch (error) {
                console.error("Error fetching related products!", error);
            }
        };
        fetchRelatedProducts();
    }, []);

    const handleQuantityChange = (type) => {
        if (type === 'increment') {
            setQuantity(q => q + 1);
        } else if (type === 'decrement' && quantity > 1) {
            setQuantity(q => q - 1);
        }
    };

    const handleAddToCart = async () => {
        try {
            await addToCartAPI({
                ProductID: product.ProductID,
                Quantity: quantity
            });
            window.dispatchEvent(new CustomEvent('cartUpdated'));
            alert('Added to cart successfully!');
        } catch (error) {
            console.error("Error adding to cart:", error);
            alert('Failed to add to cart!');
        }
    };

    const handleBuyNow = () => {
        const orderData = {
            type: 'buy',
            product: {
                ProductID: product.ProductID,
                Name: product.Name,
                Price: parseFloat(product.StandardCost),
                Quantity: quantity,
                Size: selectedSize,
                Color: selectedColor,
                Image: `https://demo.componentone.com/ASPNET/AdventureWorks/ProductImage.ashx?ProductID=${product.ProductID}&size=large`
            }
        };
        navigate('/payment', { state: orderData });
    };

    const handleRentNow = () => {
        // Calculate days between rental dates
        const startDate = new Date(rentalStartDate);
        const endDate = new Date(rentalEndDate);
        const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days
        
        const orderData = {
            type: 'rent',
            product: {
                ProductID: product.ProductID,
                Name: product.Name,
                PricePerDay: 20,
                Quantity: quantity,
                Size: selectedSize,
                Color: selectedColor,
                RentalStartDate: rentalStartDate,
                RentalEndDate: rentalEndDate,
                Days: days || 3, // Calculate from dates, fallback to 3
                SecurityDeposit: 2699.99,
                Image: `https://demo.componentone.com/ASPNET/AdventureWorks/ProductImage.ashx?ProductID=${product.ProductID}&size=large`
            }
        };
        navigate('/payment', { state: orderData });
    };

    const renderRentSection = () => {
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
                        $20 <Typography component="span" variant="h6" color="text.secondary">/ day</Typography>
                    </Typography>

                    {/* Selection Group: Color & Size */}
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                        {/* Color Selection */}
                        <Grid item xs={6}>
                            <Typography variant="body2" fontWeight="bold" color="#666" sx={{ mb: 1 }}>
                                Color: <Typography component="span" fontWeight="normal" color="text.secondary">Black</Typography>
                            </Typography>
                            <Stack direction="row" spacing={1}>
                                <Box sx={{
                                    width: 32, height: 32, bgcolor: '#1E1E1E', borderRadius: '50%',
                                    border: '2px solid #FF8C00', p: '2px', cursor: 'pointer'
                                }} />
                                <Box sx={{
                                    width: 32, height: 32, bgcolor: '#FFFFFF', borderRadius: '50%',
                                    border: '1px solid #ddd', cursor: 'pointer'
                                }} />
                            </Stack>
                        </Grid>

                        {/* Size Selection */}
                        <Grid item xs={6}>
                            <Typography variant="body2" fontWeight="bold" color="#666" sx={{ mb: 1 }}>Size</Typography>
                            <Stack direction="row" spacing={1}>
                                {['S', 'M', 'L', 'XL'].map((s) => (
                                    <Box key={s} sx={{
                                        px: 1.5, py: 0.5, borderRadius: '8px', border: '1px solid #ddd',
                                        fontSize: '0.8rem', fontWeight: 'bold', color: s === 'L' ? '#FF8C00' : '#666',
                                        borderColor: s === 'L' ? '#FF8C00' : '#ddd',
                                        bgcolor: s === 'L' ? '#FFF5EE' : 'transparent',
                                        cursor: 'pointer'
                                    }}>{s}</Box>
                                ))}
                            </Stack>
                        </Grid>
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
                    <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <Typography fontWeight="bold" color="#FF8C00">REFUNDABLE DEPOSIT</Typography>
                        <Typography variant="h4" fontWeight="bold">$2,699.99</Typography>
                    </Box>

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
                            startIcon={<ShoppingCartIcon />}
                            onClick={handleAddToCart}
                            sx={{
                                bgcolor: '#555', color: '#fff', borderRadius: '12px',
                                py: 1.5, textTransform: 'none', fontWeight: 'bold',
                                '&:hover': { bgcolor: '#333' }
                            }}
                        >
                            Add to cart
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
        const listPrice = parseFloat(product.ListPrice);
        const standardCost = parseFloat(product.StandardCost);
        const hasDiscount = standardCost > 0 && listPrice > standardCost;

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
                            ${standardCost.toFixed(2)}
                        </Typography>
                        {hasDiscount && (
                            <Typography variant="h6" color="text.secondary" sx={{ textDecoration: 'line-through', mt: 0.5 }}>
                                ${listPrice.toFixed(2)}
                            </Typography>
                        )}
                    </Box>

                    {/* Selection Group: Color & Size */}
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                        {/* Color Selection */}
                        <Grid item xs={6}>
                            <Typography variant="body2" fontWeight="bold" color="#666" sx={{ mb: 1 }}>
                                Color: <Typography component="span" fontWeight="normal" color="text.secondary">{selectedColor}</Typography>
                            </Typography>
                            <Stack direction="row" spacing={1}>
                                <Box
                                    sx={{
                                        width: 32, height: 32, bgcolor: '#1E1E1E', borderRadius: '50%',
                                        border: '2px solid #FF8C00', p: '2px', cursor: 'pointer'
                                    }}
                                    onClick={() => setSelectedColor('Black')}
                                />
                                <Box
                                    sx={{
                                        width: 32, height: 32, bgcolor: '#FFFFFF', borderRadius: '50%',
                                        border: '1px solid #ddd', cursor: 'pointer'
                                    }}
                                    onClick={() => setSelectedColor('White')}
                                />
                            </Stack>
                        </Grid>

                        {/* Size Selection */}
                        <Grid item xs={6}>
                            <Typography variant="body2" fontWeight="bold" color="#666" sx={{ mb: 1 }}>Size</Typography>
                            <Stack direction="row" spacing={1}>
                                {['S', 'M', 'L', 'XL'].map((s) => (
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
                            startIcon={<ShoppingCartIcon />}
                            onClick={handleAddToCart}
                            sx={{
                                bgcolor: '#555', color: '#fff', borderRadius: '12px',
                                py: 1.5, textTransform: 'none', fontWeight: 'bold',
                                '&:hover': { bgcolor: '#333' }
                            }}
                        >
                            Add to cart
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

    if (!product) {
        return (
            <Box className="loading-container">
                <CircularProgress />
            </Box>
        );
    }

    const productImages = [
        `https://demo.componentone.com/ASPNET/AdventureWorks/ProductImage.ashx?ProductID=${product.ProductID}&size=large`,
        `https://demo.componentone.com/ASPNET/AdventureWorks/ProductImage.ashx?ProductID=${product.ProductID}&size=large`
    ];

    const reviews = [
        {
            name: "mrbean",
            avatar: "MB",
            rating: 5,
            date: "Mar 7, 2022",
            comment: "Yo this bike's a beast fr. Been hittin' trails every weekend and it rides SMOOTH af. Light frame, sick design, brakes on point. 100% recommend if ur into off-road stuff.",
            hasImage: true
        },
        {
            name: "hulkbigboi",
            avatar: "HB",
            rating: 5,
            date: "Jul 19, 2022",
            comment: "Been commuting w/ this bad boy for 2 months now — no probs at all. Smooth gears, great balance, handles bumps like a champ. 10/10 would cop again",
            hasImage: true
        }
    ];

    const specifications = [
        { key: "Model", value: "Mountain 100" },
        { key: "Color", value: product.Color || "Black" },
        { key: "Frame material", value: "High strength aluminum alloy" },
        { key: "Frame size", value: "48 cm" },
        { key: "Wheel size", value: "27.5 Inchs" },
        { key: "Suspension", value: "Font suspension fork with shock absorb" }
    ];

    const buyerImages = [
        `https://demo.componentone.com/ASPNET/AdventureWorks/ProductImage.ashx?ProductID=${product.ProductID}&size=large`,
        `https://demo.componentone.com/ASPNET/AdventureWorks/ProductImage.ashx?ProductID=${product.ProductID}&size=large`,
        `https://demo.componentone.com/ASPNET/AdventureWorks/ProductImage.ashx?ProductID=${product.ProductID}&size=large`,
        `https://demo.componentone.com/ASPNET/AdventureWorks/ProductImage.ashx?ProductID=${product.ProductID}&size=large`,
    ];

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
                        {product.Name}
                    </Typography>
                </Breadcrumbs>

                <Grid container spacing={4}>
                    {/* Left Side - Product Images */}
                    <Grid item xs={12} md={6} flexGrow={1}>
                        <Box className="image-gallery">
                            <Stack className="thumbnail-column">
                                {productImages.slice(0, 2).map((img, index) => (
                                    <Box
                                        key={index}
                                        className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                                        onClick={() => setSelectedImage(index)}
                                    >
                                        <img src={img} alt={`Product ${index + 1}`} />
                                    </Box>
                                ))}
                            </Stack>
                            <Box className="main-image-container">
                                <img
                                    src={productImages[selectedImage]}
                                    alt={product.Name}
                                    className="main-image"
                                />
                            </Box>
                        </Box>
                    </Grid>

                    {/* Right Side - Product Info */}
                    <Grid item xs={12} md={6}>
                        <Box className="product-info-card" width="600px">
                            <Typography variant="h4" className="product-title">
                                {product.Name}
                            </Typography>

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
                    <Grid container spacing={2} className="specs-grid">
                        {specifications.map((spec, index) => (
                            <Grid item xs={12} sm={6} key={index}>
                                <Box className="spec-row">
                                    <Typography className="spec-label">{spec.key}</Typography>
                                    <Typography className="spec-value">{spec.value}</Typography>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
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
                            <Rating value={4.5} precision={0.5} readOnly size="medium" />
                            <Typography className="rating-score">4.5/5</Typography>
                            <Typography className="rating-count">(175 reviews)</Typography>
                        </Stack>
                    </Box>

                    {/* Pictures from buyers */}
                    <Box className="buyer-pictures">
                        <Typography className="subsection-title">Pictures from buyers</Typography>
                        <Stack direction="row" spacing={1} className="buyer-images-grid">
                            {buyerImages.map((img, index) => (
                                <Box key={index} className="buyer-image">
                                    <img src={img} alt={`Buyer ${index + 1}`} />
                                </Box>
                            ))}
                            <Box className="buyer-image more-images">
                                <Typography>+35</Typography>
                            </Box>
                        </Stack>
                        <MuiLink href="#" className="view-all-small">
                            View All (175) <NavigateNextIcon fontSize="small" />
                        </MuiLink>
                    </Box>

                    {/* Customer Reviews */}
                    <Box className="reviews-list">
                        {reviews.map((review, index) => (
                            <Box key={index} className="review-item">
                                <Stack direction="row" spacing={2}>
                                    <Avatar className="review-avatar">{review.avatar}</Avatar>
                                    <Box className="review-content">
                                        <Box className="review-header">
                                            <Typography className="reviewer-name">{review.name}</Typography>
                                            <Rating value={review.rating} readOnly size="small" />
                                            <Typography className="review-date">{review.date}</Typography>
                                        </Box>
                                        <Typography className="review-comment">
                                            {review.comment}
                                        </Typography>
                                        {review.hasImage && (
                                            <Box className="review-image">
                                                <img
                                                    src={productImages[0]}
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
                                                Helpful?
                                            </Button>
                                            <Button size="small" className="report-btn">
                                                Report abuse
                                            </Button>
                                        </Box>
                                    </Box>
                                </Stack>
                            </Box>
                        ))}
                    </Box>
                </Box>

                {/* You may also like Section */}
                <Box className="related-products-section">
                    <Typography className="section-subtitle">You may also like</Typography>
                    <Grid container spacing={2}>
                        {relatedProducts.slice(0, 10).map((relatedProduct) => (
                            <Grid item key={relatedProduct.ProductID} xs={6} sm={4} md={3} lg={2.4}>
                                <Card className="related-product-card">
                                    <Link
                                        to={`/products/${relatedProduct.ProductID}`}
                                        className="product-link"
                                    >
                                        <CardMedia
                                            component="img"
                                            image={`https://demo.componentone.com/ASPNET/AdventureWorks/ProductImage.ashx?ProductID=${relatedProduct.ProductID}&size=large`}
                                            alt={relatedProduct.Name}
                                            className="related-product-image"
                                        />
                                        <CardContent className="related-product-content">
                                            <Typography className="related-product-name">
                                                {relatedProduct.Name}
                                            </Typography>
                                            <Rating value={4.5} precision={0.5} readOnly size="small" />
                                            <Typography className="related-product-reviews">(175)</Typography>
                                            <Box className="related-product-footer">
                                                <Typography className="related-product-price">
                                                    ${parseFloat(relatedProduct.ListPrice).toFixed(2)}
                                                </Typography>
                                                <Typography className="related-product-sold">
                                                    142 sold
                                                </Typography>
                                            </Box>
                                        </CardContent>
                                    </Link>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            </Container>
        </Box>
    );
}

export default ProductDetail;