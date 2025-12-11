from django.urls import path
from . import procedure_views as views

# Các URL này sẽ có tiền tố là /api/proc/
urlpatterns = [
    path('register/', views.DangKyTaiKhoanView.as_view(), name='proc_register'),
    path('place-order/', views.DatHangView.as_view(), name='proc_place_order'),
    path('update-order-status/', views.CapNhatTrangThaiDonView.as_view(), name='proc_update_order_status'),
    path('confirm-order/', views.ConfirmDonHangView.as_view(), name='proc_confirm_order'),
    path('complete-order/', views.HoanThanhDonHangView.as_view(), name='proc_complete_order'),
    path('cancel-order/', views.HuyDonView.as_view(), name='proc_cancel_order'),
    path('submit-review/', views.KhachHangDanhGiaView.as_view(), name='proc_submit_review'),
    path('manage-account/', views.QuanLyTaiKhoanView.as_view(), name='proc_manage_account'),
    path('edit-product/', views.SuaSanPhamView.as_view(), name='proc_edit_product'),
    path('add-to-cart/', views.TaoGioVaThemSanPhamView.as_view(), name='proc_add_to_cart'),
    path('add-product/', views.ThemSanPhamView.as_view(), name='proc_add_product'),
    path('view-orders/', views.XemDanhSachDonView.as_view(), name='proc_view_orders'),
    path('delete-comment/', views.XoaBinhLuanView.as_view(), name='proc_delete_comment'),
    path('delete-product/', views.XoaSanPhamView.as_view(), name='proc_delete_product'),
]
