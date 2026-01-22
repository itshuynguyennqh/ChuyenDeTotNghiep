from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import *

def create_app() -> FastAPI:
    app = FastAPI(title="Bike Go")

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
