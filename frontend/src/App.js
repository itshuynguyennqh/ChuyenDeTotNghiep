import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
// Container sẽ được quản lý bởi từng trang con thay vì ở đây
// import { Container } from '@mui/material'; 

import Layout from './components/layout/Layout';
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
          <Route path="/" element={<Layout />}>
            {/* 
              Xóa Container ở đây. 
              ProductList và ProductDetail sẽ tự quản lý container của chúng.
            */}
            <Route index element={<ProductList />} />
            <Route path="products/:id" element={<ProductDetail />} />

            {/* Bạn có thể thêm các trang khác ở đây */}
            {/* <Route path="cart" element={<CartPage />} /> */}
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
