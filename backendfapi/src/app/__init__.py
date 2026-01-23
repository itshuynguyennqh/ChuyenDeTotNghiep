from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
import json

from app.routes import *

class UTF8Middleware(BaseHTTPMiddleware):
    """Middleware to ensure UTF-8 encoding in requests and responses"""
    async def dispatch(self, request: Request, call_next):
        # Đảm bảo request body được decode đúng UTF-8
        if request.method in ["POST", "PUT", "PATCH"]:
            # FastAPI tự động decode JSON, nhưng đảm bảo charset header đúng
            content_type = request.headers.get("content-type", "")
            if "application/json" in content_type and "charset" not in content_type:
                # Không cần làm gì, FastAPI đã xử lý đúng
                pass
        
        response = await call_next(request)
        
        # Đảm bảo response headers có charset UTF-8
        if isinstance(response, JSONResponse):
            response.headers["Content-Type"] = "application/json; charset=utf-8"
        
        return response

def create_app() -> FastAPI:
    app = FastAPI(title="Bike Go")

    # Add UTF-8 encoding middleware
    app.add_middleware(UTF8Middleware)

    # CORS: cần để browser preflight (OPTIONS) không bị 405
    # Nếu bạn deploy production, nên đổi "*" thành danh sách domain frontend cụ thể.
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(auth_router)
    app.include_router(admin_router)
    app.include_router(store_router)
    app.include_router(users_router)
    app.include_router(chatbot_router)
    
    return app
