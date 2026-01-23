"""
Script để xóa các FAQ bị lỗi encoding và kiểm tra encoding
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

from sqlalchemy import create_engine, text
from app.database import SessionLocal
from app.models import FAQ
import urllib.parse

def check_and_clean_corrupted_faqs():
    """Kiểm tra và xóa các FAQ bị lỗi encoding"""
    
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
    
    db_url = f"mssql+pyodbc:///?odbc_connect={params}"
    engine = create_engine(db_url)
    
    print("=" * 60)
    print("KIỂM TRA VÀ XÓA CÁC FAQ BỊ LỖI ENCODING")
    print("=" * 60)
    
    db = SessionLocal()
    try:
        # Lấy tất cả FAQ
        all_faqs = db.query(FAQ).all()
        
        print(f"\nTổng số FAQ: {len(all_faqs)}")
        
        corrupted_faqs = []
        good_faqs = []
        
        # Kiểm tra từng FAQ
        for faq in all_faqs:
            question = faq.Question or ""
            answer = faq.Answer or ""
            
            # Kiểm tra xem có ký tự "?" kèm theo ký tự tiếng Việt (dấu hiệu lỗi encoding)
            # Ví dụ: "Ti?n" thay vì "Tiền" - đây là lỗi encoding
            has_corruption = False
            
            # Kiểm tra pattern: có "?" và có ký tự tiếng Việt khác -> có thể bị lỗi
            vietnamese_chars = ['ă', 'â', 'ê', 'ô', 'ơ', 'ư', 'đ', 'Ă', 'Â', 'Ê', 'Ô', 'Ơ', 'Ư', 'Đ', 
                              'á', 'à', 'ả', 'ã', 'ạ', 'ắ', 'ằ', 'ẳ', 'ẵ', 'ặ', 'ấ', 'ầ', 'ẩ', 'ẫ', 'ậ',
                              'é', 'è', 'ẻ', 'ẽ', 'ẹ', 'ế', 'ề', 'ể', 'ễ', 'ệ', 'í', 'ì', 'ỉ', 'ĩ', 'ị',
                              'ó', 'ò', 'ỏ', 'õ', 'ọ', 'ố', 'ồ', 'ổ', 'ỗ', 'ộ', 'ớ', 'ờ', 'ở', 'ỡ', 'ợ',
                              'ú', 'ù', 'ủ', 'ũ', 'ụ', 'ứ', 'ừ', 'ử', 'ữ', 'ự', 'ý', 'ỳ', 'ỷ', 'ỹ', 'ỵ']
            
            has_vietnamese = any(char in question or char in answer for char in vietnamese_chars)
            has_question_mark = '?' in question or '?' in answer
            
            # Nếu có cả "?" và ký tự tiếng Việt -> có thể bị lỗi encoding
            # Hoặc nếu có pattern "?" trong từ tiếng Việt (ví dụ: "Ti?n" thay vì "Tiền")
            if has_question_mark and has_vietnamese:
                # Kiểm tra pattern cụ thể: "?" trong từ (không phải ở cuối câu)
                import re
                # Tìm pattern: chữ cái + "?" + chữ cái (ví dụ: "Ti?n")
                pattern = r'[a-zA-ZàáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵđĐ][?][a-zA-ZàáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵđĐ]'
                if re.search(pattern, question) or re.search(pattern, answer):
                    has_corruption = True
            
            if has_corruption:
                corrupted_faqs.append(faq)
                print(f"\n⚠️  FAQ ID {faq.FAQID} có thể bị lỗi encoding:")
                print(f"   Question: {question[:50]}...")
                print(f"   Answer: {answer[:50]}...")
            else:
                good_faqs.append(faq)
        
        print(f"\n{'='*60}")
        print(f"Kết quả kiểm tra:")
        print(f"  - FAQ hợp lệ: {len(good_faqs)}")
        print(f"  - FAQ có thể bị lỗi: {len(corrupted_faqs)}")
        print(f"{'='*60}")
        
        if corrupted_faqs:
            print(f"\n⚠️  Các FAQ sau có thể bị lỗi encoding:")
            for faq in corrupted_faqs:
                print(f"  - FAQ-{faq.FAQID:03d}: {faq.Question[:50]}...")
            
            # Tự động xóa các FAQ bị lỗi
            print(f"\n🔧 Đang xóa {len(corrupted_faqs)} FAQ bị lỗi encoding...")
            for faq in corrupted_faqs:
                db.delete(faq)
            db.commit()
            print(f"\n✅ Đã xóa {len(corrupted_faqs)} FAQ bị lỗi encoding")
            print(f"⚠️  Vui lòng nhập lại các FAQ này với text tiếng Việt mới")
        else:
            print("\n✅ Không tìm thấy FAQ nào bị lỗi encoding!")
            
    except Exception as e:
        print(f"\n❌ Lỗi: {e}")
        db.rollback()
    finally:
        db.close()
    
    print("\n" + "=" * 60)

if __name__ == "__main__":
    try:
        check_and_clean_corrupted_faqs()
    except Exception as e:
        print(f"\n❌ Lỗi: {e}")
        import traceback
        traceback.print_exc()
