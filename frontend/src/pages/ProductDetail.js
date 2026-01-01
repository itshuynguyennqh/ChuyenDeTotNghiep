import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    Grid, Box, Typography, Button, CircularProgress, Stack, Rating, Card, CardContent,
    CardMedia, Breadcrumbs, Link as MuiLink, Tabs, Tab, Avatar, IconButton
} from '@mui/material';
import { Container } from '@mui/system';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
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
    const { id } = useParams();

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

    if (!product) {
        return (
            <Box className="loading-container">
                <CircularProgress />
            </Box>
        );
    }

    const listPrice = parseFloat(product.ListPrice);
    const standardCost = parseFloat(product.StandardCost);
    const hasDiscount = standardCost > 0 && listPrice > standardCost;

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
                    <Grid item xs={12} md={6}>
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
                        <Box className="product-info-card">
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

                            <Box className="price-section">
                                <Typography className="current-price">
                                    ${standardCost.toFixed(2)}
                                </Typography>
                                {hasDiscount && (
                                    <Typography className="original-price">
                                        ${listPrice.toFixed(2)}
                                    </Typography>
                                )}
                            </Box>

                            <Box className="selection-group">
                                <Box className="color-selector">
                                    <Typography className="selector-label">
                                        Color: <span className="selector-value">{selectedColor}</span>
                                    </Typography>
                                    <Stack direction="row" spacing={1} className="color-options">
                                        <Box
                                            className={`color-option active`}
                                            style={{ backgroundColor: '#1E1E1E' }}
                                        />
                                        <Box
                                            className="color-option"
                                            style={{ backgroundColor: '#FFFFFF', border: '1px solid #ddd' }}
                                        />
                                    </Stack>
                                </Box>

                                <Box className="size-selector">
                                    <Typography className="selector-label">Size</Typography>
                                    <Stack direction="row" spacing={1} className="size-options">
                                        {['S', 'M', 'L', 'XL'].map((size) => (
                                            <Box
                                                key={size}
                                                className={`size-option ${selectedSize === size ? 'active' : ''}`}
                                                onClick={() => setSelectedSize(size)}
                                            >
                                                {size}
                                            </Box>
                                        ))}
                                    </Stack>
                                </Box>
                            </Box>

                            <Box className="quantity-selector">
                                <Typography className="selector-label">Quantity</Typography>
                                <Box className="quantity-controls">
                                    <button
                                        onClick={() => handleQuantityChange('decrement')}
                                        className="quantity-btn"
                                    >
                                        -
                                    </button>
                                    <span className="quantity-value">{quantity}</span>
                                    <button
                                        onClick={() => handleQuantityChange('increment')}
                                        className="quantity-btn"
                                    >
                                        +
                                    </button>
                                </Box>
                            </Box>

                            <Stack spacing={2} className="action-buttons">
                                <Button
                                    variant="contained"
                                    className="add-to-cart-btn"
                                    startIcon={<ShoppingCartIcon />}
                                    onClick={handleAddToCart}
                                >
                                    Add to cart
                                </Button>
                                <Button
                                    variant="contained"
                                    className="buy-now-btn"
                                >
                                    Buy Now
                                </Button>
                            </Stack>
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
