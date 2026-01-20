# database.py
from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import urllib.parse

# 1. Cấu hình thông tin kết nối
server = 'localhost\\SQLEXPRESS' 
database = 'final_project_getout'
username = 'sa1'
password = '2611' # Đã cập nhật password của bạn

# 2. Tạo Connection String
params = urllib.parse.quote_plus(
    f"DRIVER={{ODBC Driver 17 for SQL Server}};" # Kiểm tra xem máy bạn cài Driver 17 hay 18 nhé
    f"SERVER={server};"
    f"DATABASE={database};"
    f"UID={username};"
    f"PWD={password};"
    "Encrypt=yes;"
    "TrustServerCertificate=yes;"
)

SQLALCHEMY_DATABASE_URL = f"mssql+pyodbc:///?odbc_connect={params}"

# 3. Tạo Engine
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# 4. Tạo SessionLocal
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 5. Base class
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- PHẦN CODE MỚI THÊM ĐỂ TEST KẾT NỐI ---
if __name__ == "__main__":
    print("⏳ Đang thử kết nối đến SQL Server...")
    
    try:
        # Mở một kết nối trực tiếp từ engine
        with engine.connect() as connection:
            print(f"✅ Kết nối thành công đến database: {database}")
            
            # Lấy danh sách các bảng hiện có để kiểm tra
            print("🔎 Đang tìm kiếm bảng trong database...")
            # Query này lấy tên các bảng do người dùng tạo (không lấy bảng hệ thống)
            result_tables = connection.execute(text("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'"))
            tables = result_tables.fetchall()
            
            if tables:
                # Lấy bảng đầu tiên tìm thấy
                first_table_name = tables[0][0]
                print(f"👉 Tìm thấy bảng: '{first_table_name}'")
                
                # Query lấy 5 dòng dữ liệu từ bảng đó
                print(f"📄 Dữ liệu mẫu từ bảng '{first_table_name}':")
                result_rows = connection.execute(text(f"SELECT TOP 5 * FROM {first_table_name}"))
                
                rows = result_rows.fetchall()
                if rows:
                    for row in rows:
                        print(row)
                else:
                    print("⚠️ Bảng này chưa có dữ liệu.")
            else:
                print("⚠️ Kết nối được nhưng không tìm thấy bảng nào trong Database.")
                
    except Exception as e:
        print("\n❌ LỖI KẾT NỐI:")
        print(e)
        print("-" * 30)
        print("Gợi ý sửa lỗi:")
        print("1. Kiểm tra lại Driver (ODBC Driver 17 hay 18?).")
        print("2. Đảm bảo SQL Server Browser đang chạy.")
        print("3. Kiểm tra TCP/IP trong SQL Server Configuration Manager đã được Enable chưa.")