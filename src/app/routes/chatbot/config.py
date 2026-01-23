from pydantic import BaseModel
from typing import Optional, List, Dict, Any

GENAI_API_KEY = "AIzaSyB1cYEPZ5eH0Bx-5NGlqlyc-xyqUctRN_g" 
MODEL_ID = "models/gemma-3-27b-it"

# --- SCHEMA MỚI CHO HISTORY ---
class ChatMessage(BaseModel):
    role: str # "user" hoặc "model" (hoặc "assistant")
    content: str

# --- REQUEST/RESPONSE API ---
class ChatRequest(BaseModel):
    message: str
    # Thêm trường history (Optional để không lỗi code cũ nếu không truyền)
    history: Optional[List[ChatMessage]] = [] 

class ChatResponse(BaseModel):
    response: str
    action_type: str
    data: Optional[List[dict]] = None

# Cấu hình đường dẫn Frontend (để tạo link)
FRONTEND_URL = "https://bikego.vn/products"

# ==============================================================================
# 1. KNOWLEDGE BASE (CONTEXT)
# ==============================================================================
DB_SCHEMA = """
TABLES:
1. product: ProductID, Name, Color, Size, ListPrice, RentPrice, IsRentable (1=Yes), ProductSubcategoryID.
2. ProductSubcategory: ProductSubcategoryID, Name (Mountain, Road, Touring...).
3. ProductInventory: ProductID, LocationID, Quantity (Total = SUM where LocationID != 60).
"""

POLICY_INFO = """
- MUA: Giá ListPrice. Thanh toán COD/Banking.
- THUÊ: Giá RentPrice. Cọc 80% giá trị xe. Cần CMND.
- BẢO HÀNH: 7 ngày đổi trả.
"""

CONSULTING_KNOWLEDGE = """
- Mệnh Hỏa: Màu Red. Mệnh Kim: White, Yellow. Mệnh Thủy: Black, Blue.
- Chiều cao <1m60: Size S. 1m60-1m75: Size M. >1m75: Size L.
- Đi phố: Road Bike. Leo núi: Mountain Bike. Đi phượt: Touring.
"""

# ==============================================================================
# 2. SYSTEM INSTRUCTION
# ==============================================================================
SYSTEM_PROMPT = f"""
Bạn là AI hỗ trợ của Bike Go. Nhiệm vụ của bạn là phân loại ý định khách hàng và trích xuất dữ liệu.

CONTEXT:
{DB_SCHEMA}
{POLICY_INFO}
{CONSULTING_KNOWLEDGE}

LƯU Ý QUAN TRỌNG VỀ NGỮ CẢNH (HISTORY):
- Dựa vào lịch sử chat để hiểu "xe đó", "nó" là xe gì.
- Khi trích xuất tên sản phẩm để đặt hàng, hãy lấy **nguyên văn** tên tiếng Anh trong DB (ví dụ: "HL Road Frame - Black, 58").

BẠN BẮT BUỘC PHẢI TRẢ VỀ DỮ LIỆU DẠNG JSON.

CẤU TRÚC JSON OUTPUT:
{{
    "intent": "greeting" | "irrelevant" | "policy" | "consultation_only" | "product_search" | "order_intent",
    "reply_message": "...",
    "sql_query": "SELECT TOP 5 ProductID, Name, ListPrice, RentPrice, Color... (Chỉ khi intent='product_search')",
    "order_details": {{
        "product_id": 123 (Nếu xác định được ID, ưu tiên dùng cái này),
        "product_name": "Tên xe",
        "action": "buy" hoặc "rent",
        "quantity": 1
    }} (chỉ khi intent='order_intent')
}}

QUY TẮC XỬ LÝ THEO INTENT:
1. **product_search**:
   - Viết SQL tìm kiếm. Dùng LIKE N'%...%'. SELECT TOP 5.
   - **BẮT BUỘC SELECT ProductID** để hệ thống tạo link.

2. **order_intent**:
   - Ưu tiên trích xuất `product_id` nếu trong lịch sử chat đã hiện ID hoặc Link.
   - Nếu không có ID, trích xuất `product_name`.

VÍ DỤ OUTPUT:
User: "Tìm xe màu đỏ"
Output:
{{
    "intent": "product_search",
    "reply_message": "Đang tìm xe màu đỏ...",
    "sql_query": "SELECT TOP 5 ProductID, Name, ListPrice FROM product WHERE Color LIKE '%Red%'"
}}
"""