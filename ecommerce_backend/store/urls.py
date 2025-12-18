from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    ProductList, ProductDetail, CategoryList, CartDetailView, CurrentUserView,
    # Import các View TODO mới (sẽ được tạo trong views.py)
    ProductSearchView, CartItemUpdateDeleteView, CategoryManageView,
    AdminUserListView, VoucherManageView, RevenueReportView
)
from . import procedure_views as proc_views

urlpatterns = [
    # --- 1. AUTHENTICATION & ACCOUNT ---
    # UC-01: Đăng ký / Đăng nhập
    path('auth/register/', proc_views.DangKyTaiKhoanView.as_view(), name='auth-register'),
    path('auth/login/', TokenObtainPairView.as_view(), name='auth-login'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='auth-refresh'),
    # UC-06: Quản lý tài khoản
    path('account/me/', CurrentUserView.as_view(), name='account-me'),
    path('account/profile/', proc_views.QuanLyTaiKhoanView.as_view(), name='account-update'),

    # --- 2. PRODUCTS & CATEGORIES ---
    # UC-02: Tìm kiếm và xem thông tin sản phẩm
    path('products/', ProductList.as_view(), name='product-list'),
    path('products/<int:pk>/', ProductDetail.as_view(), name='product-detail'),
    path('categories/', CategoryList.as_view(), name='category-list'),
    
    # UC-02: Tìm kiếm & Lọc nâng cao
    path('products/search/', ProductSearchView.as_view(), name='product-search'),

    # UC-07: Quản lý sản phẩm (Admin/Staff)
    path('products/create/', proc_views.ThemSanPhamView.as_view(), name='product-create'), 
    path('products/edit/', proc_views.SuaSanPhamView.as_view(), name='product-edit'),
    path('products/delete/', proc_views.XoaSanPhamView.as_view(), name='product-delete'),

    # UC-08: Quản lý danh mục (Admin/Staff)
    path('categories/manage/', CategoryManageView.as_view(), name='category-manage'),
    path('categories/manage/<int:pk>/', CategoryManageView.as_view(), name='category-manage-detail'),

    # --- 3. CART ---
    # UC-03: Quản lý giỏ hàng
    path('cart/', CartDetailView.as_view(), name='cart-detail'),
    path('cart/items/', proc_views.TaoGioVaThemSanPhamView.as_view(), name='cart-add-item'),
    path('cart/items/<int:pk>/', CartItemUpdateDeleteView.as_view(), name='cart-item-update-delete'),

    # --- 4. ORDERS ---
    # UC-04: Đặt hàng và thanh toán
    path('orders/place/', proc_views.DatHangView.as_view(), name='order-place'),
    # UC-05: Theo dõi và quản lý đơn hàng
    path('orders/', proc_views.XemDanhSachDonView.as_view(), name='order-list'),
    path('orders/cancel/', proc_views.HuyDonView.as_view(), name='order-cancel'),
    # UC-09: Quản lý đơn hàng (Admin/Staff)
    path('orders/confirm/', proc_views.ConfirmDonHangView.as_view(), name='order-confirm'),
    path('orders/complete/', proc_views.HoanThanhDonHangView.as_view(), name='order-complete'),
    path('orders/status/', proc_views.CapNhatTrangThaiDonView.as_view(), name='order-update-status'),

    # --- 5. REVIEWS ---
    # UC-06: Đánh giá sản phẩm đã mua
    path('reviews/', proc_views.KhachHangDanhGiaView.as_view(), name='review-submit'),
    path('reviews/delete/', proc_views.XoaBinhLuanView.as_view(), name='review-delete'),

    # --- 6. ADMIN MANAGEMENT (TODO LIST) ---
    # UC-10 & UC-11: Quản lý nhân viên & khách hàng
    path('admin/users/', AdminUserListView.as_view(), name='admin-user-list'),
    
    # UC-12: Quản lý mã giảm giá
    path('admin/vouchers/', VoucherManageView.as_view(), name='admin-voucher-list'),
    path('admin/vouchers/<int:pk>/', VoucherManageView.as_view(), name='admin-voucher-detail'),

    # UC-13: Xem và xuất báo cáo
    path('admin/reports/revenue/', RevenueReportView.as_view(), name='admin-report-revenue'),
]
