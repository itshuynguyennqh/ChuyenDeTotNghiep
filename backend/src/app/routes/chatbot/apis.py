from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import json
import re
from google import genai
from google.genai import types

from .config import *
from app.database import get_db

client = genai.Client(api_key=GENAI_API_KEY)

chatbot_router = APIRouter(prefix="/chatbot", tags=["Chatbot"])

# --- DATABASE CONTEXT ---
# Mô tả tóm tắt DB cho AI hiểu để viết SQL
DB_SCHEMA_PROMPT = """
You are a SQL Server (T-SQL) expert assisting a Bicycle Shop. 
Here is the database schema:

1. Table 'product' (Products):
   - ProductID (int), Name (varchar), ProductNumber (varchar)
   - Color, Size, ListPrice (price), StandardCost
   - ProductSubcategoryID (FK), Class, Style
   - SellStartDate, SellEndDate (if not NULL, product is mostly discontinued)

2. Table 'ProductCategory':
   - ProductCategoryID, Name (e.g., Bikes, Components, Clothing)

3. Table 'ProductSubcategory':
   - ProductSubcategoryID, ProductCategoryID, Name (e.g., Mountain Bikes, Road Bikes)

4. Table 'ProductInventory' (Stock):
   - ProductID, LocationID, Quantity
   - Note: LocationID = 1 is 'General Warehouse', LocationID = 60 is 'Maintenance'. 
   - Available stock = Sum(Quantity) where LocationID != 60.

5. Table 'SalesOrderHeader' (Orders):
   - SalesOrderID, OrderDate, Status, TotalDue, CustomerID

6. Table 'Customer':
   - CustomerID, FirstName, LastName

RELATIONSHIPS:
- product.ProductSubcategoryID -> ProductSubcategory.ProductSubcategoryID
- ProductSubcategory.ProductCategoryID -> ProductCategory.ProductCategoryID
- ProductInventory.ProductID -> product.ProductID

RULES:
- Only answer questions related to the bicycle shop, products, stock, prices, or basic greetings.
- If the user greets (hello, hi), reply politely as a shop assistant.
- If the question is irrelevant (weather, politics, coding help not related to this db), politely refuse.
- If data is needed, generate a T-SQL query.
- IMPORTANT: When checking stock/quantity, always SUM(Quantity) from ProductInventory.
- IMPORTANT: When searching for names, use LIKE '%keyword%'.
"""

# --- SYSTEM PROMPT ---
SYSTEM_INSTRUCTION = f"""
{DB_SCHEMA_PROMPT}

YOUR TASK:
Analyze the user's input and determine the next step. 
You must return your response in a STRICT JSON format. Do not output markdown code blocks.

JSON FORMAT:
{{
    "type": "greeting" | "irrelevant" | "sql",
    "content": "string" 
}}

LOGIC:
1. If "greeting": "content" is a friendly greeting message.
2. If "irrelevant": "content" is a polite refusal message.
3. If "sql": "content" is the T-SQL query to answer the user's question. 
   - The SQL must be a SELECT statement. 
   - Do NOT use INSERT, UPDATE, DELETE, DROP.
   - Limit results to 5 rows if querying lists of products (`TOP 5`).
"""

# --- HELPER FUNCTIONS ---

def clean_json_response(text_response: str) -> dict:
    """Làm sạch response từ LLM để parse JSON (xóa markdown ```json ... ```)"""
    try:
        # Xóa markdown code block nếu có
        cleaned = re.sub(r"```json\s*", "", text_response, flags=re.IGNORECASE)
        cleaned = re.sub(r"```", "", cleaned)
        return json.loads(cleaned.strip())
    except json.JSONDecodeError:
        # Fallback nếu LLM không trả về JSON chuẩn
        return {"type": "error", "content": "I encountered an error processing your request."}

def execute_sql_safely(db: Session, query: str) -> List[dict]:
    """Chạy SQL an toàn (Chỉ Read-Only)"""
    query_upper = query.strip().upper()
    if not query_upper.startswith("SELECT"):
        raise ValueError("Only SELECT queries are allowed for security reasons.")
    
    if any(keyword in query_upper for keyword in ["DELETE ", "UPDATE ", "DROP ", "INSERT ", "TRUNCATE ", "ALTER "]):
        raise ValueError("Unsafe SQL detected.")

    try:
        result = db.execute(text(query))
        # Convert row objects to dict
        columns = result.keys()
        return [dict(zip(columns, row)) for row in result.fetchall()]
    except Exception as e:
        print(f"SQL Error: {e}")
        return []

def summarize_results(query_data: List[dict], user_question: str) -> str:
    """Gọi LLM lần 2 để tóm tắt dữ liệu từ DB thành câu trả lời"""
    if not query_data:
        return "I checked the database but found no matching records."

    prompt = f"""
    User Question: "{user_question}"
    
    Data retrieved from Database:
    {json.dumps(query_data, default=str)}
    
    Task: Act as a helpful shop assistant. Summarize this data to answer the user's question naturally. 
    Mention names and prices specifically if listed. Keep it concise.
    """
    
    try:
        response = client.models.generate_content(
            model=MODEL_ID,
            contents=prompt
        )
        return response.text.strip()
    except Exception as e:
        return "I found the data but couldn't summarize it right now."


# --- ENDPOINT ---

@chatbot_router.post("/message", response_model=ChatResponse)
async def chat_with_bot(payload: ChatRequest, db: Session = Depends(get_db)):
    user_msg = payload.message.strip()
    
    # 1. Gọi LLM để phân loại và sinh SQL (nếu cần)
    try:
        analysis_response = client.models.generate_content(
            model=MODEL_ID,
            contents=f"{SYSTEM_INSTRUCTION}\n\nUSER INPUT: {user_msg}"
        )
        
        ai_decision = clean_json_response(analysis_response.text)
        action_type = ai_decision.get("type", "error")
        content = ai_decision.get("content", "")

    except Exception as e:
        return ChatResponse(response="AI Service is currently unavailable.", action_type="error")

    # 2. Xử lý theo Action Type
    
    # CASE A: Greeting hoặc Irrelevant -> Trả lời luôn
    if action_type in ["greeting", "irrelevant", "error"]:
        return ChatResponse(
            response=content, 
            action_type=action_type
        )

    # CASE B: SQL Query -> Thực thi và Tóm tắt
    if action_type == "sql":
        sql_query = content
        
        try:
            # Chạy SQL
            data_rows = execute_sql_safely(db, sql_query)
            
            # Gửi dữ liệu cho LLM tóm tắt
            final_answer = summarize_results(data_rows, user_msg)
            
            return ChatResponse(
                response=final_answer,
                action_type="sql_query",
                sql_executed=sql_query
            )
            
        except ValueError as ve:
            return ChatResponse(response=str(ve), action_type="error")
        except Exception as e:
            return ChatResponse(
                response="I tried to look that up but encountered a database error.", 
                action_type="error",
                sql_executed=sql_query
            )

    return ChatResponse(response="I didn't understand that.", action_type="unknown")