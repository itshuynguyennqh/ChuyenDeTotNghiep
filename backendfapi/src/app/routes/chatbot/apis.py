from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from sqlalchemy import text
import google.generativeai as genai
import json
import re
from datetime import datetime
from typing import List, Optional
from jose import JWTError, jwt

from app.database import get_db
from app.models import Product, Cart, CartItem, FAQ, ProductCategory
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

# Configure the Generative AI client
genai.configure(api_key=GENAI_API_KEY)
chatbot_router = APIRouter(prefix="/chatbot", tags=["Chatbot"])

# ==============================================================================
# 3. HELPER FUNCTIONS
# ==============================================================================

def get_category_names(db: Session) -> str:
    """Lấy danh sách tên danh mục đưa vào AI (fix categories search)"""
    try:
        categories = db.query(ProductCategory).all()
        return ", ".join([f"'{c.Name}'" for c in categories])
    except Exception:
        return "'Bikes', 'Accessories'"

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
    
    # [MỚI] Lấy số ngày thuê (fix categories search)
    rental_days = order_data.get("rental_days", 1)
    if action == "rent" and rental_days < 1: 
        rental_days = 1

    product = None
    # 1. Tìm sản phẩm (Logic cũ)
    if p_id:
        product = db.query(Product).filter(Product.ProductID == p_id).first()
    if not product and p_name:
        clean = p_name.strip().replace("–", "-").replace("—", "-")
        product = db.query(Product).filter(Product.Name.ilike(f"%{clean}%")).first()

    if not product:
        return "Xin lỗi, không tìm thấy sản phẩm nào."

    # 2. Kiểm tra Thuê (fix categories search)
    if action == "rent":
        if not product.IsRentable:
            return f"Sản phẩm **{product.Name}** chỉ bán, không cho thuê."
        if not product.RentPrice:
            return "Sản phẩm chưa có giá thuê."

    # 3. Xử lý Cart
    cart = db.query(Cart).filter(Cart.CustomerID == user_id, Cart.Status == "Active").first()
    if not cart:
        cart = Cart(CustomerID=user_id, CreatedDate=datetime.utcnow(), ModifiedDate=datetime.utcnow(), Status="Active", IsCheckedOut=False)
        db.add(cart)
        db.flush()

    unit_price = product.RentPrice if action == "rent" else product.ListPrice

    existing_item = db.query(CartItem).filter(
        CartItem.CartID == cart.CartID,
        CartItem.ProductID == product.ProductID,
        CartItem.TransactionType == action
    ).first()

    if existing_item:
        existing_item.Quantity += quantity
        if action == "rent":
            existing_item.RentalDays = rental_days  # Update số ngày mới nhất khách nói
        # Subtotal is computed by DB, no need to set manually
        msg = f"Đã cập nhật số lượng **{product.Name}**."
    else:
        new_item = CartItem(
            CartID=cart.CartID,
            ProductID=product.ProductID,
            Quantity=quantity,
            UnitPrice=unit_price,
            # Subtotal is computed by DB, no need to set manually
            DateAdded=datetime.utcnow(),
            TransactionType=action,
            RentalDays=rental_days if action == "rent" else None
        )
        db.add(new_item)
        
        days_info = f" ({rental_days} ngày)" if action == "rent" else ""
        msg = f"Đã thêm **{product.Name}**{days_info} vào giỏ hàng."

    db.commit()
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

# Get active FAQs for suggested questions (public endpoint)
@chatbot_router.get("/faqs")
async def get_active_faqs(
    limit: Optional[int] = 10,
    db: Session = Depends(get_db)
):
    """
    Get active FAQs to display as suggested questions in chatbot
    Public endpoint - no authentication required
    """
    try:
        faqs = db.query(FAQ).filter(FAQ.IsActive == True)\
            .order_by(FAQ.FAQID.desc())\
            .limit(limit)\
            .all()
        
        result = []
        for faq in faqs:
            result.append({
                "id": faq.FAQID,
                "question": faq.Question,
            })
        
        return {"success": True, "data": result}
    except Exception as e:
        print(f"Error fetching FAQs: {e}")
        return {"success": False, "data": []}

@chatbot_router.post("/message", response_model=ChatResponse)
async def chat_with_bot(
    payload: ChatRequest, 
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id) 
):
    user_msg = payload.message.strip()
    
    # Bây giờ biến user_id đã là ID thật của người đang chat
    print(f"DEBUG: Chatting with User ID: {user_id}")

    # BƯỚC A: Lấy danh mục động từ DB (fix categories search)
    category_list_str = get_category_names(db)

    # BƯỚC B: Format System Prompt với category list
    final_system_prompt = build_system_prompt(category_list_str)

    # BƯỚC C: Tạo Prompt gửi AI
    full_prompt = f"""
{final_system_prompt}

LỊCH SỬ CHAT:
{format_chat_history(payload.history)}

USER: {user_msg}
"""

    try:
        model = genai.GenerativeModel(MODEL_ID)
        response = model.generate_content(full_prompt)
        
        ai_data = extract_json_from_text(response.text)
        
        intent = ai_data.get("intent", "chat")

        # XỬ LÝ KẾT QUẢ
        if intent == "product_search":
            sql = ai_data.get("sql_query", "")
            data = execute_sql(db, sql) 
            if not data:
                return ChatResponse(response="Không tìm thấy sản phẩm nào phù hợp.", action_type="search_empty")
            return ChatResponse(response="Kết quả tìm kiếm:", action_type="product_list", data=data)

        if intent == "order_intent":
            details = ai_data.get("order_details", {})
            msg = handle_auto_order(db, user_id, details)
            return ChatResponse(response=msg, action_type="order_result")

        # Các trường hợp khác (policy, consulting, greeting...)
        return ChatResponse(response=ai_data.get("reply_message", "Xin lỗi, tôi chưa hiểu."), action_type="chat")

    except Exception as e:
        print(f"Chatbot Error: {e}")
        return ChatResponse(response="Hệ thống đang bận, vui lòng thử lại.", action_type="error")