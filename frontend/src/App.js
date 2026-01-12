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
import AdminProductAdd from './pages/admin/AdminProductAdd';
import AdminProductEdit from './pages/admin/AdminProductEdit';
import AdminOrderList from './pages/admin/AdminOrderList';
import AdminOrderDetail from './pages/admin/AdminOrderDetail';
import AdminCustomerList from './pages/admin/AdminCustomerList';
import AdminCategoryList from './pages/admin/AdminCategoryList';
import AdminStaffList from './pages/admin/AdminStaffList';
import AdminPromotionList from './pages/admin/AdminPromotionList';
import AdminPromotionAdd from './pages/admin/AdminPromotionAdd';
import AdminPromotionEdit from './pages/admin/AdminPromotionEdit';
import AdminRentalConfig from './pages/admin/AdminRentalConfig';
import AdminChatbotFAQ from './pages/admin/AdminChatbotFAQ';

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
            <Route path="account" element={<AccountPage />} />
            <Route path="payment" element={<PaymentPage />} />
          </Route>
          {/* Thêm route cho trang đăng nhập */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/order-success" element={<OrderSuccessPage />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="products" element={<AdminProductList />} />
            <Route path="products/add" element={<AdminProductAdd />} />
            <Route path="products/edit/:id" element={<AdminProductEdit />} />
            <Route path="orders" element={<AdminOrderList />} />
            <Route path="orders/:id" element={<AdminOrderDetail />} />
            <Route path="customers" element={<AdminCustomerList />} />
            <Route path="categories" element={<AdminCategoryList />} />
            <Route path="staff" element={<AdminStaffList />} />
            <Route path="promotions" element={<AdminPromotionList />} />
            <Route path="promotions/add" element={<AdminPromotionAdd />} />
            <Route path="promotions/edit/:id" element={<AdminPromotionEdit />} />
            <Route path="rental-config" element={<AdminRentalConfig />} />
            <Route path="chatbot-faq" element={<AdminChatbotFAQ />} />
          </Route>

        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
