"""
Script để xóa TẤT CẢ FAQ (kể cả dữ liệu cũ bị lỗi encoding)
Sau khi chạy script này, hãy uncomment encoding trong database.py
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

# Fix encoding cho Windows console
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

from app.database import SessionLocal
from app.models import FAQ

def delete_all_faqs():
    """Xóa tất cả FAQ"""
    
    db = SessionLocal()
    try:
        # Đếm số FAQ
        count = db.query(FAQ).count()
        print("=" * 60)
        print("XÓA TẤT CẢ FAQ")
        print("=" * 60)
        print(f"\nTổng số FAQ: {count}")
        
        if count == 0:
            print("\n✅ Không có FAQ nào để xóa")
            return
        
        # Xóa tất cả
        db.query(FAQ).delete()
        db.commit()
        
        print(f"\n✅ Đã xóa {count} FAQ")
        print("\n⚠️  LƯU Ý:")
        print("   1. Bây giờ hãy uncomment encoding trong database.py")
        print("   2. Restart backend server")
        print("   3. Tạo lại các FAQ với text tiếng Việt mới")
        print("   4. Dữ liệu mới sẽ được lưu đúng UTF-8")
        
    except Exception as e:
        print(f"\n❌ Lỗi: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()
    
    print("\n" + "=" * 60)

if __name__ == "__main__":
    delete_all_faqs()
