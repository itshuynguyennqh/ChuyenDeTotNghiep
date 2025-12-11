import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import Layout from './components/layout/Layout';

import ProductList from './pages/ProductList';
import ProductDetail from './pages/ProductDetail';
import CartPage from './pages/CartPage';
import LoginPage from './pages/LoginPage'; // Import LoginPage
import theme from './theme';
import './App.css';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<ProductList />} />
            <Route path="products/:id" element={<ProductDetail />} />
            <Route path="cart" element={<CartPage />} />
          </Route>
          {/* Thêm route cho trang đăng nhập */}
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
