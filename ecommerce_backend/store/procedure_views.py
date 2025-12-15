from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, serializers
from .utils import execute_procedure
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

def create_proc_serializer(name, params):
    """Dynamically create a serializer for a procedure."""
    return type(name, (serializers.Serializer,), {
        key: serializers.CharField() for key in params
    })

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
    param_keys = ['username', 'password', 'email', 'firstname', 'lastname'] 
    serializer_class = create_proc_serializer('DangKyTaiKhoanSerializer', param_keys)

    @swagger_auto_schema(request_body=serializer_class)
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)

class DatHangView(BaseProcedureView):
    proc_name = "dbo.Dat_Hang"
    param_keys = ['customerid', 'cartid', 'address', 'payment_method']
    serializer_class = create_proc_serializer('DatHangSerializer', param_keys)

    @swagger_auto_schema(request_body=serializer_class)
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)

class CapNhatTrangThaiDonView(BaseProcedureView):
    proc_name = "dbo.Cap_Nhat_Trang_Thai_Don"
    param_keys = ['orderid', 'new_status']
    serializer_class = create_proc_serializer('CapNhatTrangThaiDonSerializer', param_keys)

    @swagger_auto_schema(request_body=serializer_class)
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)

class ConfirmDonHangView(BaseProcedureView):
    proc_name = "dbo.ConfirmDonHang"
    param_keys = ['orderid']
    serializer_class = create_proc_serializer('ConfirmDonHangSerializer', param_keys)

    @swagger_auto_schema(request_body=serializer_class)
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)

class HoanThanhDonHangView(BaseProcedureView):
    proc_name = "dbo.HoanThanhDonHang_UpdateRank"
    param_keys = ['orderid']
    serializer_class = create_proc_serializer('HoanThanhDonHangSerializer', param_keys)

    @swagger_auto_schema(request_body=serializer_class)
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)

class HuyDonView(BaseProcedureView):
    proc_name = "dbo.Huy_Don"
    param_keys = ['orderid']
    serializer_class = create_proc_serializer('HuyDonSerializer', param_keys)

    @swagger_auto_schema(request_body=serializer_class)
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)

class KhachHangDanhGiaView(BaseProcedureView):
    proc_name = "dbo.Khach_Hang_Danh_Gia"
    param_keys = ['customerid', 'productid', 'rating', 'comment']
    serializer_class = create_proc_serializer('KhachHangDanhGiaSerializer', param_keys)

    @swagger_auto_schema(request_body=serializer_class)
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)

class QuanLyTaiKhoanView(BaseProcedureView):
    proc_name = "dbo.Quan_Ly_Tai_Khoan"
    param_keys = ['customerid', 'new_email', 'new_phone']
    serializer_class = create_proc_serializer('QuanLyTaiKhoanSerializer', param_keys)

    @swagger_auto_schema(request_body=serializer_class)
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)

class SuaSanPhamView(BaseProcedureView):
    proc_name = "dbo.Sua_San_Pham"
    param_keys = ['productid', 'name', 'price', 'description']
    serializer_class = create_proc_serializer('SuaSanPhamSerializer', param_keys)

    @swagger_auto_schema(request_body=serializer_class)
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)

class TaoGioVaThemSanPhamView(BaseProcedureView):
    proc_name = "dbo.Tao_Gio_Va_Them_San_Pham"
    param_keys = ['customerid', 'productid', 'quantity']
    serializer_class = create_proc_serializer('TaoGioVaThemSanPhamSerializer', param_keys)

    @swagger_auto_schema(request_body=serializer_class)
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)

class ThemSanPhamView(BaseProcedureView):
    proc_name = "dbo.Them_San_Pham"
    param_keys = ['name', 'price', 'description', 'categoryid']
    serializer_class = create_proc_serializer('ThemSanPhamSerializer', param_keys)

    @swagger_auto_schema(request_body=serializer_class)
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)

class XemDanhSachDonView(APIView): # Dùng GET cho việc xem
    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter('customerid', openapi.IN_QUERY, description="Customer ID", type=openapi.TYPE_INTEGER)
        ]
    )
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
    serializer_class = create_proc_serializer('XoaBinhLuanSerializer', param_keys)

    @swagger_auto_schema(request_body=serializer_class)
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)

class XoaSanPhamView(BaseProcedureView):
    proc_name = "dbo.Xoa_San_Pham"
    param_keys = ['productid']
    serializer_class = create_proc_serializer('XoaSanPhamSerializer', param_keys)

    @swagger_auto_schema(request_body=serializer_class)
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)
