from .models import Cart, Customer

def get_cart(request):
    """
    Lấy giỏ hàng cho user hiện tại, dù đã đăng nhập hay chưa.
    Tạo mới nếu chưa có.
    """
    if request.user.is_authenticated:
        try:
            customer = Customer.objects.get(customeremailaddress__emailaddress=request.user.username)
            cart, created = Cart.objects.get_or_create(customerid=customer, ischeckedout=False)
            return cart
        except Customer.DoesNotExist:
            return None
    else:
        session_key = request.session.session_key
        if not session_key:
            request.session.create()
            session_key = request.session.session_key
        
        cart, created = Cart.objects.get_or_create(session_key=session_key, ischeckedout=False)
        return cart
