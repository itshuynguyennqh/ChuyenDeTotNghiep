import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

// Import các component từ Material-UI
import { Grid, Box, Typography, Button, CircularProgress, Divider } from '@mui/material';

function ProductDetail() {
  const [product, setProduct] = useState(null);
  const { id } = useParams();

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

  if (!product) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Backend đã trả về URL đầy đủ, nên chúng ta chỉ cần sử dụng nó trực tiếp.
  const imageUrl = product.image 
    ? product.image // Sử dụng trực tiếp URL từ API
    : `https://via.placeholder.com/500?text=${product.name.replace(/\s/g, '+')}`;

  return (
    <Box sx={{ flexGrow: 1, p: { xs: 2, md: 4 } }}>
      <Grid container spacing={{ xs: 2, md: 4 }}>
        {/* CỘT BÊN TRÁI: HÌNH ẢNH SẢN PHẨM */}
        <Grid item xs={12} md={6}>
          <Box
            component="img"
            sx={{
              width: '100%',
              height: 'auto',
              borderRadius: '16px',
              boxShadow: 3,
            }}
            alt={product.name}
            src={imageUrl} // Sử dụng URL ảnh đã xử lý
          />
        </Grid>

        {/* CỘT BÊN PHẢI: THÔNG TIN SẢN PHẨM */}
        <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
            {product.name}
          </Typography>

          <Typography variant="h5" color="primary" sx={{ mb: 2, fontWeight: 'medium' }}>
            ${product.list_price}
          </Typography>
          
          <Divider sx={{ my: 2 }} />

          <Typography variant="body1" paragraph sx={{ flexGrow: 1 }}>
            {product.description || "Sản phẩm này chưa có mô tả."}
          </Typography>
          
          <Divider sx={{ my: 2 }} />

          <Box sx={{ mt: 'auto' }}>
            <Button 
              variant="contained" 
              size="large" 
              fullWidth
              sx={{ py: 1.5, textTransform: 'none', fontSize: '1rem' }}
            >
              Thêm vào giỏ hàng
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}

export default ProductDetail;
