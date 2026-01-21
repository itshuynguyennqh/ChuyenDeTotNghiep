from pydantic import BaseModel
from typing import Optional, List, Dict, Any

GENAI_API_KEY = "AIzaSyCTOlBu-JhaBbFfXuIuy7gW5JAfOF_RYas" 
MODEL_ID = "models/gemma-3-27b-it"

# --- SCHEMAS ---
class ChatRequest(BaseModel):
    message: str
    history: Optional[List[Dict[str, str]]] = [] # List các message trước đó (nếu muốn giữ context)

class ChatResponse(BaseModel):
    response: str
    action_type: str # 'greeting', 'sql_query', 'irrelevant', 'error'
    sql_executed: Optional[str] = None # Để debug xem nó chạy lệnh gì