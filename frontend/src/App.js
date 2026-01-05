import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import Layout from './components/layout/Layout';

import ProductList from './pages/ProductList';
import ProductDetail from './pages/ProductDetail';
import CartPage from './pages/CartPage';
import LoginPage from './pages/LoginPage';
import SignUp from "./pages/SignUp";
import theme from './theme';
import './App.css';
import AccountPage from "./pages/AccountPage";
import PaymentPage from "./pages/PaymentPage";
import OrderSuccessPage from "./pages/OrderSuccessPage";

// Admin Imports
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProductList from './pages/admin/AdminProductList';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<ProductList />}/>
            <Route path="products/:id" element={<ProductDetail />} />
            <Route path="cart" element={<CartPage />} />
            <Route path="/account" element={<AccountPage />} />
          </Route>
          {/* Thêm route cho trang đăng nhập */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/payment" element={<PaymentPage />} />
            <Route path="/order-success" element={<OrderSuccessPage />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="products" element={<AdminProductList />} />
            {/* Thêm các route admin khác tại đây */}
          </Route>

        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
