from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    ProductList, ProductDetail, CategoryList, CartDetailView, CurrentUserView,
    ProductSearchView, CartItemUpdateDeleteView, CategoryManageView,
    AdminUserListView, VoucherManageView, RevenueReportView, AddressViewSet
)
from . import procedure_views as proc_views

# Create a router and register our viewsets with it.
router = DefaultRouter()
router.register(r'addresses', AddressViewSet, basename='address')

urlpatterns = [
    # Router URLs
    path('', include(router.urls)),

    # --- 1. AUTHENTICATION & ACCOUNT ---
    path('auth/register/', proc_views.DangKyTaiKhoanView.as_view(), name='auth-register'),
    path('auth/login/', TokenObtainPairView.as_view(), name='auth-login'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='auth-refresh'),
    path('account/me/', CurrentUserView.as_view(), name='account-me'),
    path('account/profile/', proc_views.QuanLyTaiKhoanView.as_view(), name='account-update'),

    # --- 2. PRODUCTS & CATEGORIES ---
    path('products/', ProductList.as_view(), name='product-list'),
    path('products/<int:pk>/', ProductDetail.as_view(), name='product-detail'),
    path('categories/', CategoryList.as_view(), name='category-list'),
    path('products/search/', ProductSearchView.as_view(), name='product-search'),
    path('categories/manage/', CategoryManageView.as_view(), name='category-manage'),
    path('categories/manage/<int:pk>/', CategoryManageView.as_view(), name='category-manage-detail'),
    path('products/create/', proc_views.ThemSanPhamView.as_view(), name='product-create'), 
    path('products/edit/', proc_views.SuaSanPhamView.as_view(), name='product-edit'),
    path('products/delete/', proc_views.XoaSanPhamView.as_view(), name='product-delete'),

    # --- 3. CART ---
    path('cart/', CartDetailView.as_view(), name='cart-detail'),
    path('cart/items/', proc_views.TaoGioVaThemSanPhamView.as_view(), name='cart-add-item'),
    path('cart/items/<int:pk>/', CartItemUpdateDeleteView.as_view(), name='cart-item-update-delete'),

    # --- 4. ORDERS ---
    path('orders/', proc_views.XemDanhSachDonView.as_view(), name='order-list'),
    path('orders/place/', proc_views.DatHangView.as_view(), name='order-place'),
    path('orders/cancel/', proc_views.HuyDonView.as_view(), name='order-cancel'),
    path('orders/confirm/', proc_views.ConfirmDonHangView.as_view(), name='order-confirm'),
    path('orders/complete/', proc_views.HoanThanhDonHangView.as_view(), name='order-complete'),
    path('orders/status/', proc_views.CapNhatTrangThaiDonView.as_view(), name='order-update-status'),

    # --- 5. REVIEWS ---
    path('reviews/', proc_views.KhachHangDanhGiaView.as_view(), name='review-submit'),
    path('reviews/delete/', proc_views.XoaBinhLuanView.as_view(), name='review-delete'),

    # --- 6. ADMIN MANAGEMENT (TODO LIST) ---
    path('admin/users/', AdminUserListView.as_view(), name='admin-user-list'),
    path('admin/vouchers/', VoucherManageView.as_view(), name='admin-voucher-list'),
    path('admin/vouchers/<int:pk>/', VoucherManageView.as_view(), name='admin-voucher-detail'),
    path('admin/reports/revenue/', RevenueReportView.as_view(), name='admin-report-revenue'),
]
