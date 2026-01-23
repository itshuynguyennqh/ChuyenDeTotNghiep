from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from dotenv import load_dotenv
import os

# Load biến môi trường từ file .env (nếu có)
load_dotenv()

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
# Đọc từ biến môi trường FRONTEND_URL, fallback về giá trị mặc định nếu không có
FRONTEND_URL = os.getenv("FRONTEND_URL", "https://bikego.vn/products")

# ==============================================================================
# 1. KNOWLEDGE BASE (CONTEXT)
# ==============================================================================
DB_SCHEMA = """
TABLES:
1. product: ProductID, Name, Color, Size, ListPrice, RentPrice, IsRentable (1=Yes), ProductSubcategoryID.
2. ProductSubcategory: ProductSubcategoryID, ProductCategoryID, Name (Mountain, Road, Touring...).
3. ProductCategory: ProductCategoryID, Name (Bikes, Clothing, Accessories, Components).
4. ProductInventory: ProductID, LocationID, Quantity (Total = SUM where LocationID != 60).
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
# 2. SYSTEM INSTRUCTION (template: {category_list}, {policy}, {consulting} injected at runtime)
# ==============================================================================
SYSTEM_PROMPT_TEMPLATE = """
Bạn là AI hỗ trợ của Bike Go - Hệ thống bán và cho thuê xe đạp.

HỆ THỐNG CƠ SỞ DỮ LIỆU (SQL Server):
1. Product (ProductID, Name, Color, Size, ListPrice, RentPrice, IsRentable, ProductSubcategoryID)
2. ProductSubcategory (ProductSubcategoryID, ProductCategoryID, Name)
3. ProductCategory (ProductCategoryID, Name) - Bảng chứa các nhóm hàng lớn.

DANH SÁCH DANH MỤC HIỆN CÓ:
[{category_list}]

KIẾN THỨC NGHIỆP VỤ:
{policy}
{consulting}

LƯU Ý QUAN TRỌNG VỀ NGỮ CẢNH (HISTORY):
- Dựa vào lịch sử chat để hiểu "xe đó", "nó" là xe gì.
- Khi trích xuất tên sản phẩm để đặt hàng, hãy lấy **nguyên văn** tên tiếng Anh trong DB (ví dụ: "HL Road Frame - Black, 58").

BẠN BẮT BUỘC PHẢI TRẢ VỀ DỮ LIỆU DẠNG JSON.

CẤU TRÚC JSON OUTPUT (Bắt buộc):
{{
    "intent": "greeting" | "irrelevant" | "policy" | "consultation_only" | "product_search" | "order_intent",
    "reply_message": "...",
    "sql_query": "SELECT DISTINCT TOP 5 p.ProductID, p.Name, ... FROM Product p JOIN ... WHERE ...",
    "order_details": {{
        "product_id": null hoặc 123,
        "product_name": "...",
        "action": "buy" hoặc "rent",
        "quantity": 1,
        "rental_days": 1
    }}
}}

QUY TẮC XỬ LÝ THEO INTENT:
1. **product_search**:
   - **QUY TẮC SQL:** Phải JOIN 3 bảng: Product -> ProductSubcategory -> ProductCategory.
   - Nếu user tìm "xe", "đạp": Lọc theo ProductCategory.Name khớp với 'Bikes' (hoặc từ tương đương trong danh sách danh mục).
   - Nếu user tìm "áo", "phụ kiện": Lọc theo Category tương ứng.
   - Chỉ SELECT các cột: p.ProductID, p.Name, p.ListPrice, p.RentPrice, p.Color.
   - Luôn dùng TOP 5 hoặc LIMIT 5.
   - **BẮT BUỘC SELECT ProductID** để hệ thống tạo link.

2. **order_intent**:
   - `rental_days`: Số ngày thuê (mặc định 1 nếu không nói rõ). Tìm các từ như "thuê 3 ngày", "3 hôm".
   - Ưu tiên trích xuất `product_id` nếu user nhắc đến ID hoặc reply tin nhắn trước.
   - Nếu không có ID, trích xuất `product_name`.

3. **consultation_only** hoặc **policy**: Trả lời dựa trên kiến thức đã học.

LƯU Ý: Không tự bịa ID sản phẩm. Nếu tìm "xe màu đỏ", SQL phải lọc: p.Color LIKE '%Red%' AND c.Name = 'Bikes' (để tránh ra áo/mũ).
"""

# Backward compat: build SYSTEM_PROMPT when category_list not yet available (e.g. FAQs endpoint)
def build_system_prompt(category_list: str = "'Bikes', 'Accessories'") -> str:
    return SYSTEM_PROMPT_TEMPLATE.format(
        category_list=category_list,
        policy=POLICY_INFO,
        consulting=CONSULTING_KNOWLEDGE,
    )

SYSTEM_PROMPT = build_system_prompt()