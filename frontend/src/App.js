import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Container } from '@mui/material';

import Layout from './components/layout/Layout'; // Import Layout mới
import ProductList from './ProductList';
import ProductDetail from './ProductDetail';
import theme from './theme';
import './App.css';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* 
            Bây giờ Layout là route cha. 
            Tất cả các route con sẽ được render bên trong <Outlet /> của Layout.
          */}
          <Route path="/" element={<Layout />}>
            {/* Trang chủ (danh sách sản phẩm) */}
            <Route index element={
              <Container maxWidth="lg">
                <ProductList />
              </Container>
            } />
            
            {/* Trang chi tiết sản phẩm */}
            <Route path="products/:id" element={
              <Container maxWidth="lg">
                <ProductDetail />
              </Container>
            } />

            {/* Bạn có thể thêm các trang khác ở đây, ví dụ: */}
            {/* <Route path="cart" element={<CartPage />} /> */}
            {/* <Route path="login" element={<LoginPage />} /> */}
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
