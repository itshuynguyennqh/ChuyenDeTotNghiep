from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from sqlalchemy import text
from google import genai
import json
import re
from datetime import datetime
from typing import List, Optional
from jose import JWTError, jwt

from app.database import get_db
from app.models import Product, Cart, CartItem
from .config import *
from app.routes.auth.config import SECRET_KEY, ALGORITHM 

# Khai báo Scheme (đường dẫn này chỉ để Swagger UI biết nơi lấy token)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

# --- HÀM LẤY USER ID TỪ TOKEN ---
def get_current_user_id(token: str = Depends(oauth2_scheme)) -> int:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # Giải mã Token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("id") # Lấy field 'id' trong payload
        
        if user_id is None:
            raise credentials_exception
        
        return user_id
    except JWTError:
        raise credentials_exception

client = genai.Client(api_key=GENAI_API_KEY)
chatbot_router = APIRouter(prefix="/chatbot", tags=["Chatbot"])

# ==============================================================================
# 3. HELPER FUNCTIONS
# ==============================================================================
def extract_json_from_text(text_response: str) -> dict:
    try:
        codeblock_pattern = r"```(?:json)?\s*([\s\S]*?)\s*```"
        match = re.search(codeblock_pattern, text_response, re.IGNORECASE)
        if match:
            json_str = match.group(1).strip()
        else:
            json_str = text_response.strip()
        return json.loads(json_str)
    except Exception as e:
        print(f"JSON Parse Error: {e}")
        return {
            "intent": "irrelevant",
            "reply_message": "Xin lỗi, hệ thống đang gặp sự cố xử lý dữ liệu."
        }

def execute_sql(db: Session, query: str) -> list[dict]:
    """
    Chạy SQL và tự động chèn Link sản phẩm vào kết quả
    """
    if not query or not query.strip().upper().startswith("SELECT"):
        return []
    try:
        result = db.execute(text(query))
        rows = [dict(zip(result.keys(), row)) for row in result.fetchall()]
        
        # [MỚI] Inject Link sản phẩm
        for row in rows:
            # Kiểm tra xem cột ProductID có tồn tại không (không phân biệt hoa thường)
            p_id = row.get("ProductID") or row.get("productid")
            if p_id:
                row["product_url"] = f"{FRONTEND_URL}/{p_id}"
                # Gợi ý action cho Frontend hiển thị
                row["action_guide"] = f"Nhắn 'Mua mã {p_id}' để đặt nhanh."
                
        return rows
    except Exception as e:
        print(f"SQL Error: {e}")
        return []

def handle_auto_order(db: Session, user_id: int, order_data: dict) -> str:
    """
    Xử lý đặt hàng: Hỗ trợ cả ID (chính xác) và Tên (tìm kiếm mờ)
    """
    p_id = order_data.get("product_id")
    p_name = order_data.get("product_name", "")
    action = order_data.get("action", "buy")
    quantity = order_data.get("quantity", 1)

    product = None

    # CHIẾN THUẬT 1: Tìm theo ID (Nếu AI trích xuất được)
    if p_id:
        product = db.query(Product).filter(Product.ProductID == p_id).first()

    # CHIẾN THUẬT 2: Tìm theo Tên (Nếu không có ID hoặc ID sai)
    if not product and p_name:
        # 1. Xử lý lỗi dấu gạch ngang (Quan trọng)
        clean_name = p_name.strip().replace("–", "-").replace("—", "-")
        
        # 2. Tìm chính xác tương đối
        product = db.query(Product).filter(Product.Name.ilike(f"%{clean_name}%")).first()
        
        # 3. Nếu chưa thấy, thử tìm lỏng hơn (Split theo dấu phẩy, vd: "Name, 58" -> tìm "Name")
        if not product and "," in clean_name:
            short_name = clean_name.split(",")[0].strip()
            product = db.query(Product).filter(Product.Name.ilike(f"%{short_name}%")).first()

    if not product:
        return f"Xin lỗi, không tìm thấy sản phẩm nào khớp với thông tin (ID: {p_id}, Tên: {p_name})."

    # --- Logic thêm vào Cart (Giữ nguyên logic cũ đã chạy ổn) ---
    if action == "rent" and not product.IsRentable:
        return f"Sản phẩm **{product.Name}** chỉ bán, không hỗ trợ thuê."

    cart = db.query(Cart).filter(Cart.CustomerID == user_id, Cart.Status == "Active").first()
    if not cart:
        cart = Cart(CustomerID=user_id, CreatedDate=datetime.utcnow(), ModifiedDate=datetime.utcnow(), Status="Active", IsCheckedOut=False)
        db.add(cart)
        db.flush()

    price = product.RentPrice if action == "rent" else product.ListPrice

    # Upsert Logic
    existing_item = db.query(CartItem).filter(
        CartItem.CartID == cart.CartID, 
        CartItem.ProductID == product.ProductID,
        CartItem.TransactionType == action
    ).first()

    if existing_item:
        existing_item.Quantity += quantity
        # KHÔNG cần tính Subtotal thủ công nữa, DB tự nhảy
        # existing_item.Subtotal = ... (XÓA DÒNG NÀY) 
        msg = f"Đã cập nhật số lượng **{product.Name}** lên {existing_item.Quantity}."
    else:
        new_item = CartItem(
            CartID=cart.CartID, 
            ProductID=product.ProductID, 
            Quantity=quantity,
            UnitPrice=price, 
            # Subtotal=price * quantity,  <--- XÓA DÒNG NÀY (Để DB tự tính)
            DateAdded=datetime.utcnow(),
            TransactionType=action, 
            RentalDays=1 if action == 'rent' else None
        )
        db.add(new_item)
        msg = f"Đã thêm **{product.Name}** vào giỏ hàng."

    db.commit()
    # Sau khi commit, nếu bạn muốn lấy Subtotal mới nhất để hiển thị (tùy chọn)
    # db.refresh(new_item) 
    
    return f"✅ {msg} (Link: {FRONTEND_URL}/{product.ProductID})"

def format_chat_history(history: List[ChatMessage]) -> str:
    if not history: return ""
    formatted_text = ""
    for msg in history:
        role_label = "User" if msg.role == "user" else "AI"
        formatted_text += f"{role_label}: {msg.content}\n"
    return formatted_text

# ==============================================================================
# 4. API ENDPOINT
# ==============================================================================
@chatbot_router.post("/message", response_model=ChatResponse)
async def chat_with_bot(
    payload: ChatRequest, 
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id) 
):
    user_msg = payload.message.strip()
    
    # Bây giờ biến user_id đã là ID thật của người đang chat
    print(f"DEBUG: Chatting with User ID: {user_id}")

    
    # 1. Format History
    history_text = format_chat_history(payload.history)

    # 2. Tạo Prompt
    final_prompt = f"""
{SYSTEM_PROMPT}

LỊCH SỬ CHÁT (CONTEXT):
{history_text}

CÂU HỎI HIỆN TẠI CỦA USER: {user_msg}
"""

    try:
        response = client.models.generate_content(
            model=MODEL_ID,
            contents=final_prompt
        )
        
        # print(f"DEBUG AI: {response.text}")
        ai_data = extract_json_from_text(response.text)
        
        intent = ai_data.get("intent", "irrelevant")
        reply = ai_data.get("reply_message", "")

        # --- CASE 1: SEARCH ---
        if intent == "product_search":
            sql = ai_data.get("sql_query", "")
            data_rows = execute_sql(db, sql)
            
            if not data_rows:
                return ChatResponse(response="Không tìm thấy sản phẩm nào.", action_type="search_empty")
            
            return ChatResponse(
                response=f"Tìm thấy {len(data_rows)} sản phẩm. Bấm vào link để xem chi tiết:",
                action_type="product_list",
                data=data_rows # Data này đã có field 'product_url'
            )

        # --- CASE 2: ORDER ---
        if intent == "order_intent":
            order_details = ai_data.get("order_details", {})
            result_msg = handle_auto_order(db, user_id, order_details)
            return ChatResponse(
                response=result_msg,
                action_type="order_result"
            )
            
        # --- DEFAULT ---
        return ChatResponse(response=reply, action_type=intent)

    except Exception as e:
        print(f"Error: {str(e)}")
        return ChatResponse(
            response="Hệ thống đang bảo trì, vui lòng thử lại sau.",
            action_type="error"
        )