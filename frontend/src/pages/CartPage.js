import React, { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { 
    Container, Grid, Typography, Box, Paper, Button, IconButton, 
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
    CircularProgress, TextField 
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { fetchCartAPI, deleteCartItemAPI, updateCartItemAPI } from '../api/productApi';

function CartPage() {
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchCart = async () => {
        try {
            const response = await fetchCartAPI();
            setCart(response.data);
        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu giỏ hàng", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCart();
    }, []);

    const handleDeleteItem = async (itemId) => {
        try {
            await deleteCartItemAPI(itemId);
            fetchCart(); // Tải lại giỏ hàng sau khi xóa
            window.dispatchEvent(new CustomEvent('cartUpdated')); // Báo cho Header cập nhật
        } catch (error) {
            console.error("Lỗi khi xóa sản phẩm:", error);
        }
    };

    const handleUpdateQuantity = async (itemId, newQuantity) => {
        if (newQuantity < 1) return;
        try {
            // Lưu ý: API update cần body chứa đủ thông tin, tùy vào serializer
            // Ở đây ta chỉ cập nhật quantity
            await updateCartItemAPI(itemId, { Quantity: newQuantity });
            fetchCart(); // Tải lại giỏ hàng
            window.dispatchEvent(new CustomEvent('cartUpdated'));
        } catch (error) {
            console.error("Lỗi khi cập nhật số lượng:", error);
        }
    };

    if (loading) {
        return <Container sx={{ textAlign: 'center', my: 5 }}><CircularProgress /></Container>;
    }

    if (!cart || !cart.Items || cart.Items.length === 0) {
        return <Container sx={{ textAlign: 'center', my: 5 }}><Typography variant="h6">Giỏ hàng của bạn đang trống.</Typography></Container>;
    }

    const cartTotal = cart.Total || cart.Items.reduce((total, item) => total + (item.Quantity * item.UnitPrice), 0);

    return (
        <Container sx={{ my: 5 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Giỏ hàng của bạn
            </Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Sản phẩm</TableCell>
                                    <TableCell align="right">Giá</TableCell>
                                    <TableCell align="center">Số lượng</TableCell>
                                    <TableCell align="right">Tạm tính</TableCell>
                                    <TableCell align="center">Xóa</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {cart.Items.map(item => (
                                    <TableRow key={item.CartItemID}>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <img
                                                    src={`https://demo.componentone.com/ASPNET/AdventureWorks/ProductImage.ashx?ProductID=${item.ProductID}&size=large`}
                                                    alt={item.Name}
                                                    style={{ width: 80, height: 80, objectFit: 'contain', marginRight: '16px' }}
                                                />
                                                <Typography component={RouterLink} to={`/products/${item.ProductID}`} variant="body1" sx={{ fontWeight: 'bold', textDecoration: 'none', color: 'inherit' }}>
                                                    {item.Name}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell align="right">${parseFloat(item.UnitPrice).toFixed(2)}</TableCell>
                                        <TableCell align="center">
                                            <TextField
                                                type="number"
                                                value={item.Quantity}
                                                onChange={(e) => handleUpdateQuantity(item.CartItemID, parseInt(e.target.value))}
                                                inputProps={{ min: 1, style: { textAlign: 'center' } }}
                                                sx={{ width: '80px' }}
                                            />
                                        </TableCell>
                                        <TableCell align="right">${(item.Quantity * item.UnitPrice).toFixed(2)}</TableCell>
                                        <TableCell align="center">
                                            <IconButton onClick={() => handleDeleteItem(item.CartItemID)} color="error">
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>Tổng cộng</Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography>Tạm tính</Typography>
                            <Typography>${cartTotal.toFixed(2)}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                            <Typography>Phí vận chuyển</Typography>
                            <Typography>Free</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.2rem' }}>
                            <Typography variant="h6">Tổng tiền</Typography>
                            <Typography variant="h6">${cartTotal.toFixed(2)}</Typography>
                        </Box>
                        <Button
                            component={RouterLink}
                            to="/payment"
                            variant="contained"
                            fullWidth
                            sx={{ mt: 3 , backgroundColor: '#FF8D28'}}
                        >
                            Tiến hành thanh toán
                        </Button>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
}

export default CartPage;
