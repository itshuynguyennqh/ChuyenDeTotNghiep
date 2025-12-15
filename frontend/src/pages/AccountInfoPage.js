import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Grid, Paper, Typography, TextField, Button, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { fetchOrderHistoryAPI, updateAccountAPI } from '../api/productApi';

function AccountPage() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [userInfo, setUserInfo] = useState({
        customerid: '', // Bạn cần lấy ID này từ lúc login hoặc decode token
        email: '',
        phone: ''
    });

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            navigate('/login');
            return;
        }

        // TODO: Lấy CustomerID thực tế. Tạm thời hardcode hoặc lấy từ localStorage nếu bạn đã lưu
        const currentCustomerId = 1;

        // Gọi API lấy đơn hàng
        fetchOrderHistoryAPI(currentCustomerId)
            .then(res => setOrders(res.data))
            .catch(err => console.error(err));

    }, [navigate]);

    const handleUpdate = async () => {
        try {
            await updateAccountAPI({
                customerid: 1, // Thay bằng ID thật
                new_email: userInfo.email,
                new_phone: userInfo.phone
            });
            alert("Cập nhật thành công!");
        } catch (error) {
            alert("Lỗi cập nhật");
        }
    };

    return (
        <Container sx={{ py: 4 }}>
            <Grid container spacing={3}>
                {/* Cột 1: Thông tin cá nhân */}
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>Thông tin tài khoản</Typography>
                        <TextField
                            fullWidth label="Email" margin="normal"
                            value={userInfo.email}
                            onChange={(e) => setUserInfo({...userInfo, email: e.target.value})}
                        />
                        <TextField
                            fullWidth label="Số điện thoại" margin="normal"
                            value={userInfo.phone}
                            onChange={(e) => setUserInfo({...userInfo, phone: e.target.value})}
                        />
                        <Button variant="contained" fullWidth sx={{ mt: 2 }} onClick={handleUpdate}>
                            Cập nhật
                        </Button>
                        <Button color="error" fullWidth sx={{ mt: 1 }} onClick={() => {
                            localStorage.clear();
                            navigate('/login');
                        }}>
                            Đăng xuất
                        </Button>
                    </Paper>
                </Grid>

                {/* Cột 2: Lịch sử đơn hàng */}
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>Lịch sử đơn hàng</Typography>
                        {orders.length === 0 ? (
                            <Typography>Chưa có đơn hàng nào.</Typography>
                        ) : (
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Mã đơn</TableCell>
                                        <TableCell>Ngày đặt</TableCell>
                                        <TableCell>Tổng tiền</TableCell>
                                        <TableCell>Trạng thái</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {orders.map((order) => (
                                        <TableRow key={order.SalesOrderID}>
                                            <TableCell>{order.SalesOrderNumber}</TableCell>
                                            <TableCell>{new Date(order.OrderDate).toLocaleDateString()}</TableCell>
                                            <TableCell>${order.TotalDue}</TableCell>
                                            <TableCell>{order.Status || 'Đang xử lý'}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
}

export default AccountPage;