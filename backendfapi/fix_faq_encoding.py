"""
Script để kiểm tra và sửa lỗi encoding cho bảng FAQ
Chạy script này để đảm bảo các cột Question, Answer, Keywords là NVARCHAR
"""

import sys
import os
# Thêm đường dẫn src vào PYTHONPATH
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

# Fix encoding cho Windows console
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

from sqlalchemy import create_engine, text, inspect
import urllib.parse

def check_and_fix_faq_encoding():
    """Kiểm tra và sửa encoding cho bảng FAQ"""
    
    server = 'localhost\\SQLEXPRESS'
    database = 'final_project_getout'
    username = 'sa1'
    password = '2611'
    
    params = urllib.parse.quote_plus(
        f"DRIVER={{ODBC Driver 17 for SQL Server}};"
        f"SERVER={server};"
        f"DATABASE={database};"
        f"UID={username};"
        f"PWD={password};"
        "Encrypt=yes;"
        "TrustServerCertificate=yes;"
    )
    
    # Tạo connection riêng để chạy ALTER TABLE
    db_url = f"mssql+pyodbc:///?odbc_connect={params}"
    check_engine = create_engine(db_url)
    
    print("=" * 60)
    print("KIỂM TRA VÀ SỬA LỖI ENCODING CHO BẢNG FAQ")
    print("=" * 60)
    
    with check_engine.connect() as conn:
        # 1. Kiểm tra xem bảng FAQ có tồn tại không
        inspector = inspect(check_engine)
        if 'FAQ' not in inspector.get_table_names():
            print("❌ Bảng FAQ không tồn tại trong database!")
            return
        
        print("✓ Bảng FAQ đã tồn tại")
        
        # 2. Kiểm tra kiểu dữ liệu hiện tại
        print("\n📋 Kiểm tra kiểu dữ liệu hiện tại:")
        result = conn.execute(text("""
            SELECT 
                COLUMN_NAME,
                DATA_TYPE,
                CHARACTER_MAXIMUM_LENGTH,
                IS_NULLABLE
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_NAME = 'FAQ'
            AND COLUMN_NAME IN ('Question', 'Answer', 'Keywords')
            ORDER BY COLUMN_NAME
        """))
        
        columns_to_fix = []
        for row in result:
            col_name = row[0]
            data_type = row[1]
            max_length = row[2]
            nullable = row[3]
            
            print(f"  - {col_name}: {data_type}({max_length if max_length else 'MAX'}) - Nullable: {nullable}")
            
            # Nếu là VARCHAR, cần chuyển sang NVARCHAR
            if data_type.upper() == 'VARCHAR':
                columns_to_fix.append((col_name, nullable))
                print(f"    ⚠️  Cần chuyển sang NVARCHAR")
            elif data_type.upper() == 'NVARCHAR':
                print(f"    ✓ Đã là NVARCHAR (hỗ trợ Unicode)")
            else:
                print(f"    ⚠️  Kiểu dữ liệu không phải string: {data_type}")
        
        # 3. Sửa các cột cần thiết
        if columns_to_fix:
            print(f"\n🔧 Đang sửa {len(columns_to_fix)} cột...")
            
            for col_name, nullable in columns_to_fix:
                null_constraint = "NULL" if nullable else "NOT NULL"
                
                try:
                    # Chuyển sang NVARCHAR(MAX)
                    alter_sql = f"""
                        ALTER TABLE [dbo].[FAQ] 
                        ALTER COLUMN [{col_name}] NVARCHAR(MAX) {null_constraint}
                    """
                    
                    conn.execute(text(alter_sql))
                    conn.commit()
                    print(f"  ✓ Đã chuyển cột '{col_name}' sang NVARCHAR(MAX)")
                    
                except Exception as e:
                    print(f"  ❌ Lỗi khi sửa cột '{col_name}': {e}")
                    conn.rollback()
        else:
            print("\n✓ Tất cả các cột đã đúng kiểu dữ liệu (NVARCHAR)")
        
        # 4. Kiểm tra lại sau khi sửa
        print("\n📋 Kiểm tra lại sau khi sửa:")
        result = conn.execute(text("""
            SELECT 
                COLUMN_NAME,
                DATA_TYPE,
                CHARACTER_MAXIMUM_LENGTH
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_NAME = 'FAQ'
            AND COLUMN_NAME IN ('Question', 'Answer', 'Keywords')
            ORDER BY COLUMN_NAME
        """))
        
        all_nvarchar = True
        for row in result:
            col_name = row[0]
            data_type = row[1]
            max_length = row[2]
            
            if data_type.upper() == 'NVARCHAR':
                print(f"  ✓ {col_name}: {data_type}({max_length if max_length else 'MAX'})")
            else:
                print(f"  ❌ {col_name}: {data_type} - Vẫn chưa phải NVARCHAR!")
                all_nvarchar = False
        
        print("\n" + "=" * 60)
        if all_nvarchar:
            print("✅ HOÀN TẤT! Tất cả các cột đã là NVARCHAR")
            print("\n⚠️  LƯU Ý:")
            print("   - Dữ liệu cũ có thể đã bị lỗi encoding")
            print("   - Bạn có thể cần xóa và nhập lại các FAQ có tiếng Việt")
            print("   - Các FAQ mới sẽ được lưu đúng encoding")
        else:
            print("⚠️  Vẫn còn một số cột chưa được sửa")
            print("   Vui lòng chạy script SQL thủ công: fix_faq_encoding.sql")
        print("=" * 60)

if __name__ == "__main__":
    try:
        check_and_fix_faq_encoding()
    except Exception as e:
        print(f"\n❌ Lỗi: {e}")
        print("\nNếu gặp lỗi, vui lòng chạy script SQL thủ công:")
        print("  1. Mở SQL Server Management Studio")
        print("  2. Mở file: fix_faq_encoding.sql")
        print("  3. Chạy script")
