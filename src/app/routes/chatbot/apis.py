from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List
import json
import re
from google import genai

from .config import *
# Giả sử bạn có các schema request/response như ChatRequest, ChatResponse trong config
# from .schemas import ChatRequest, ChatResponse 
from app.database import get_db

client = genai.Client(api_key=GENAI_API_KEY)

chatbot_router = APIRouter(prefix="/chatbot", tags=["Chatbot"])

# --- 1. CHÍNH SÁCH CỬA HÀNG (CONTEXT) ---
STORE_POLICY_CONTEXT = """
CHÍNH SÁCH VÀ QUY TRÌNH CỦA CỬA HÀNG BIKE GO:

1. QUY TRÌNH MUA HÀNG (BUY):
   - Bước 1: Khách hàng tìm kiếm sản phẩm, xem chi tiết và thêm vào giỏ hàng.
   - Bước 2: Tại giỏ hàng, kiểm tra lại số lượng và đơn giá.
   - Bước 3: Tiến hành đặt hàng (Checkout). Khách hàng cần cung cấp địa chỉ giao hàng và chọn phương thức thanh toán (COD, Chuyển khoản ngân hàng, hoặc Ví điện tử).
   - Bước 4: Hệ thống xác nhận đơn hàng. Hàng sẽ được giao trong vòng 3-5 ngày làm việc tùy khu vực.
   - Chính sách đổi trả: Hỗ trợ đổi trả trong vòng 7 ngày nếu có lỗi từ nhà sản xuất.

2. QUY TRÌNH THUÊ XE (RENTAL):
   - Điều kiện: Khách hàng cần có tài khoản và xác thực số điện thoại.
   - Bước 1: Chọn sản phẩm có hỗ trợ thuê (được đánh dấu là "Cho thuê" / IsRentable).
   - Bước 2: Chọn khoảng thời gian thuê (Ngày bắt đầu - Ngày kết thúc).
   - Bước 3: Thanh toán đơn thuê.
     + Tổng tiền = (Giá thuê/ngày * Số ngày) + Tiền cọc (Security Deposit).
     + Tiền cọc: Thường từ 80% - 100% giá trị thực của xe để đảm bảo tài sản.
   - Bước 4: Nhận xe. Khách hàng kiểm tra tình trạng xe cùng nhân viên (hoặc quay video nếu giao tận nơi).
   - Bước 5: Trả xe (Return).
     + Trả đúng hạn: Nhân viên kiểm tra xe. Nếu xe nguyên vẹn, tiền cọc sẽ được hoàn lại 100% vào tài khoản sau 24h.
     + Trả muộn: Phụ thu phí quá hạn (150% giá thuê ngày thường).
     + Hư hỏng: Phí sửa chữa sẽ được trừ trực tiếp vào tiền cọc.
"""

# --- 2. DATABASE CONTEXT ---
DB_SCHEMA_PROMPT = """
Bạn là một chuyên gia SQL Server (T-SQL) kiêm nhân viên hỗ trợ khách hàng cho Cửa Hàng Xe Đạp "Bike Go".

CẤU TRÚC CƠ SỞ DỮ LIỆU:
1. Bảng 'product': ProductID, Name, ProductNumber, Color, Size, ListPrice, RentPrice, IsRentable, ProductSubcategoryID.
2. Bảng 'ProductCategory': ProductCategoryID, Name.
3. Bảng 'ProductSubcategory': ProductSubcategoryID, ProductCategoryID, Name.
4. Bảng 'ProductInventory': ProductID, LocationID, Quantity (LocationID=1 là kho bán, LocationID=60 là kho sửa chữa).

QUY TẮC SQL:
- Chỉ dùng SELECT.
- Tìm tên dùng LIKE N'%từ_khóa%'.
- Kiểm tra tồn kho: SUM(Quantity) WHERE LocationID != 60.
- Nếu hỏi về thuê, check điều kiện IsRentable = 1.
"""

# --- 3. SYSTEM PROMPT (CẬP NHẬT) ---
SYSTEM_INSTRUCTION = f"""
{DB_SCHEMA_PROMPT}

{STORE_POLICY_CONTEXT}

NHIỆM VỤ CỦA BẠN:
Phân tích câu hỏi người dùng và trả về JSON chuẩn. KHÔNG dùng markdown.

ĐỊNH DẠNG JSON OUTPUT:
{{
    "type": "greeting" | "irrelevant" | "policy" | "sql",
    "content": "string"
}}

LOGIC XỬ LÝ:
1. "greeting": Nếu người dùng chào hỏi. "content" là câu chào lại thân thiện.
2. "irrelevant": Nếu hỏi chuyện không liên quan (thời tiết, bóng đá...). "content" là câu từ chối lịch sự.
3. "policy": Nếu người dùng hỏi về:
   - Cách mua hàng, thanh toán, giao hàng.
   - Cách thuê xe, tiền cọc, quy trình trả xe, thủ tục thuê.
   - Đổi trả, bảo hành.
   -> "content": Hãy tự soạn câu trả lời chi tiết dựa trên thông tin trong phần "CHÍNH SÁCH VÀ QUY TRÌNH" ở trên. Trả lời đúng trọng tâm câu hỏi.

4. "sql": Nếu người dùng hỏi dữ liệu cụ thể trong DB (giá bao nhiêu, còn hàng không, danh sách xe màu đỏ...).
   -> "content": Câu lệnh T-SQL.

VÍ DỤ:
- "Làm sao để thuê xe?": type="policy", content="Để thuê xe, bạn cần chọn xe có mục Cho thuê..."
- "Xe Road-150 giá bao nhiêu?": type="sql", content="SELECT..."
"""

# --- HELPER FUNCTIONS ---

def clean_json_response(text_response: str) -> dict:
    try:
        # Xóa markdown json code block nếu có
        cleaned = re.sub(r"```json\s*", "", text_response, flags=re.IGNORECASE)
        cleaned = re.sub(r"```", "", cleaned)
        return json.loads(cleaned.strip())
    except json.JSONDecodeError:
        return {"type": "error", "content": "Lỗi xử lý phản hồi từ AI."}

def execute_sql_safely(db: Session, query: str) -> List[dict]:
    query_upper = query.strip().upper()
    if not query_upper.startswith("SELECT"):
        raise ValueError("Chỉ hỗ trợ câu lệnh SELECT.")
    if any(k in query_upper for k in ["DELETE", "UPDATE", "DROP", "INSERT", "ALTER", "TRUNCATE"]):
        raise ValueError("Phát hiện từ khóa không an toàn.")
    
    try:
        result = db.execute(text(query))
        columns = result.keys()
        return [dict(zip(columns, row)) for row in result.fetchall()]
    except Exception as e:
        print(f"SQL Error: {e}")
        return []

def summarize_sql_results(query_data: List[dict], user_question: str) -> str:
    if not query_data:
        return "Rất tiếc, tôi không tìm thấy sản phẩm hoặc dữ liệu nào phù hợp với yêu cầu của bạn."

    prompt = f"""
    Câu hỏi: "{user_question}"
    Dữ liệu tìm được: {json.dumps(query_data, default=str)}
    
    Hãy trả lời khách hàng dựa trên dữ liệu trên. Ngắn gọn, nêu rõ tên và giá (nếu có).
    """
    try:
        # Dùng model nhẹ hoặc chính model đó để tóm tắt
        resp = client.models.generate_content(model=MODEL_ID, contents=prompt)
        return resp.text.strip()
    except:
        return "Đã tìm thấy dữ liệu nhưng không thể tóm tắt."

# --- ENDPOINT ---

@chatbot_router.post("/message", response_model=ChatResponse)
async def chat_with_bot(payload: ChatRequest, db: Session = Depends(get_db)):
    user_msg = payload.message.strip()
    
    # 1. Gửi Prompt phân tích cho AI
    try:
        analysis_resp = client.models.generate_content(
            model=MODEL_ID,
            contents=f"{SYSTEM_INSTRUCTION}\n\nUSER QUESTION: {user_msg}"
        )
        ai_decision = clean_json_response(analysis_resp.text)
        
        action_type = ai_decision.get("type", "error")
        content = ai_decision.get("content", "")
    except Exception as e:
        return ChatResponse(response=f"Lỗi kết nối AI: {str(e)}", action_type="error")

    # 2. Xử lý theo từng loại Intent
    
    # CASE A: Các câu trả lời văn bản trực tiếp (Chào, Từ chối, Chính sách)
    if action_type in ["greeting", "irrelevant", "policy", "error"]:
        # Với 'policy', AI đã tự generate câu trả lời dựa trên context trong 'content'
        return ChatResponse(
            response=content,
            action_type=action_type
        )

    # CASE B: Xử lý truy vấn SQL
    if action_type == "sql":
        try:
            # Thực thi SQL
            data_rows = execute_sql_safely(db, content)
            
            # Tóm tắt kết quả
            final_answer = summarize_sql_results(data_rows, user_msg)
            
            return ChatResponse(
                response=final_answer,
                action_type="sql_query",
                sql_executed=content # Trả về để debug nếu cần
            )
        except ValueError as ve:
            return ChatResponse(response=str(ve), action_type="error")
        except Exception:
            return ChatResponse(response="Có lỗi khi truy xuất cơ sở dữ liệu.", action_type="error")

    # CASE C: Không hiểu
    return ChatResponse(response="Tôi chưa hiểu rõ yêu cầu. Bạn có thể hỏi lại cụ thể hơn không?", action_type="unknown")