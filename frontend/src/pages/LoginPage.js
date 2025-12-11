import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginAPI } from '../api/productApi';
import {
    Container,
    Box,
    TextField,
    Button,
    Typography,
    Alert
} from '@mui/material';

function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await loginAPI({ username, password });
            // Lưu token vào localStorage
            localStorage.setItem('access_token', response.data.access);
            localStorage.setItem('refresh_token', response.data.refresh);
            
            // Chuyển hướng về trang chủ hoặc trang cá nhân
            navigate('/');
            window.location.reload(); // Tải lại trang để cập nhật trạng thái đăng nhập
        } catch (err) {
            setError('Tên đăng nhập hoặc mật khẩu không đúng.');
            console.error('Login failed:', err);
        }
    };

    return (
        <Container maxWidth="xs">
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Typography component="h1" variant="h5">
                    Đăng nhập
                </Typography>
                <Box component="form" onSubmit={handleLogin} noValidate sx={{ mt: 1 }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="username"
                        label="Tên đăng nhập"
                        name="username"
                        autoComplete="username"
                        autoFocus
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Mật khẩu"
                        type="password"
                        id="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                    >
                        Đăng nhập
                    </Button>
                </Box>
            </Box>
        </Container>
    );
}

export default LoginPage;
