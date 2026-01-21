import uvicorn
from app import create_app
from app.database import SessionLocal, engine
from app import models
from app.routes.auth.apis import auth_router, get_password_hash
from datetime import date

app = create_app()

def create_super_admin():
    """Hàm này sẽ chạy 1 lần khi server khởi động"""
    db = SessionLocal()
    try:
        admin_email = "admin"
        existing_admin = db.query(models.Employee).filter(
            models.Employee.EmailAddress == admin_email
        ).first()

        if not existing_admin:
            print(f"[*] Chưa có Super Admin. Đang khởi tạo tài khoản: {admin_email}...")
            
            super_admin = models.Employee(
                BusinessEntityID=1,
                FullName="System Super Admin",
                EmailAddress=admin_email,
                PhoneNumber="0900000000",
                PasswordSalt=get_password_hash("admin123"),
                DepartmentName="Admin",
                GroupName="Executive",
                BirthDate=date(1990, 1, 1),
                StartDate=date.today(),
            )
            
            db.add(super_admin)
            db.commit()
            print("[+] Đã tạo Super Admin thành công!")
        else:
            print("[*] Super Admin đã tồn tại. Bỏ qua.")
            
    except Exception as e:
        print(f"[!] Lỗi khi tạo Super Admin: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == '__main__':
    create_super_admin()
    uvicorn.run("main:app", host='0.0.0.0', port=8001, reload=True)