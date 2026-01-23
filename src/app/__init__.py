from fastapi import FastAPI
from app.routes import * 

def create_app() -> FastAPI:
    app = FastAPI(title="Bike Go")
    app.include_router(auth_router)
    app.include_router(admin_router)
    app.include_router(store_router)
    app.include_router(users_router)
    app.include_router(chatbot_router)
    
    return app