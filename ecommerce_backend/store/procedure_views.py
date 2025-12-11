from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .utils import execute_procedure

class BaseProcedureView(APIView):
    """
    View cơ sở để gọi procedure. Các view khác sẽ kế thừa từ đây.
    """
    proc_name = "" # Tên procedure sẽ được định nghĩa ở lớp con
    param_keys = [] # Danh sách các key tham số mong đợi từ request

    def post(self, request, *args, **kwargs):
        # Lấy tham số từ request body theo đúng thứ tự
        params = [request.data.get(key) for key in self.param_keys]

        # Kiểm tra nếu thiếu tham số
        if any(p is None for p in params):
            return Response(
                {"error": f"Missing one of required parameters: {self.param_keys}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            result = execute_procedure(self.proc_name, params)
            return Response(result, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# --- Định nghĩa các API View cho từng Procedure ---

class DangKyTaiKhoanView(BaseProcedureView):
    proc_name = "dbo.Dang_Ky_Tai_Khoan"
    # **QUAN TRỌNG**: Điền đúng tên các key bạn muốn gửi từ Frontend
    param_keys = ['username', 'password', 'email', 'firstname', 'lastname'] 

class DatHangView(BaseProcedureView):
    proc_name = "dbo.Dat_Hang"
    param_keys = ['customerid', 'cartid', 'address', 'payment_method']

class CapNhatTrangThaiDonView(BaseProcedureView):
    proc_name = "dbo.Cap_Nhat_Trang_Thai_Don"
    param_keys = ['orderid', 'new_status']

class ConfirmDonHangView(BaseProcedureView):
    proc_name = "dbo.ConfirmDonHang"
    param_keys = ['orderid']

class HoanThanhDonHangView(BaseProcedureView):
    proc_name = "dbo.HoanThanhDonHang_UpdateRank"
    param_keys = ['orderid']

class HuyDonView(BaseProcedureView):
    proc_name = "dbo.Huy_Don"
    param_keys = ['orderid']

class KhachHangDanhGiaView(BaseProcedureView):
    proc_name = "dbo.Khach_Hang_Danh_Gia"
    param_keys = ['customerid', 'productid', 'rating', 'comment']

class QuanLyTaiKhoanView(BaseProcedureView):
    proc_name = "dbo.Quan_Ly_Tai_Khoan"
    param_keys = ['customerid', 'new_email', 'new_phone']

class SuaSanPhamView(BaseProcedureView):
    proc_name = "dbo.Sua_San_Pham"
    param_keys = ['productid', 'name', 'price', 'description']

class TaoGioVaThemSanPhamView(BaseProcedureView):
    proc_name = "dbo.Tao_Gio_Va_Them_San_Pham"
    param_keys = ['customerid', 'productid', 'quantity']

class ThemSanPhamView(BaseProcedureView):
    proc_name = "dbo.Them_San_Pham"
    param_keys = ['name', 'price', 'description', 'categoryid']

class XemDanhSachDonView(APIView): # Dùng GET cho việc xem
    def get(self, request, *args, **kwargs):
        # Giả sử xem tất cả đơn hoặc theo customerid
        customer_id = request.query_params.get('customerid')
        params = [customer_id] if customer_id else []
        try:
            result = execute_procedure("dbo.Xem_Danh_Sach_Don", params)
            return Response(result, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class XoaBinhLuanView(BaseProcedureView):
    proc_name = "dbo.Xoa_Binh_Luan"
    param_keys = ['commentid']

class XoaSanPhamView(BaseProcedureView):
    proc_name = "dbo.Xoa_San_Pham"
    param_keys = ['productid']
