"""
Script test để kiểm tra encoding khi lưu FAQ
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
from datetime import datetime

def test_faq_encoding():
    """Test lưu FAQ với tiếng Việt"""
    
    db = SessionLocal()
    try:
        # Test data với tiếng Việt
        test_question = "Chính sách thuê xe của Bike Go như thế nào?"
        test_answer = "Chính sách thuê xe của Bike Go như sau: Giá thuê bằng giá RentPrice. Cọc 80% giá trị xe. Cần CMND để xác minh thông tin."
        test_keywords = "tiền cọc,thuê xe,deposit,chính sách"
        
        print("=" * 60)
        print("TEST LƯU FAQ VỚI TIẾNG VIỆT")
        print("=" * 60)
        
        print(f"\n📝 Dữ liệu test:")
        print(f"  Question: {test_question}")
        print(f"  Answer: {test_answer[:50]}...")
        print(f"  Keywords: {test_keywords}")
        
        # Kiểm tra encoding của string
        print(f"\n🔍 Kiểm tra encoding:")
        print(f"  Question type: {type(test_question)}")
        print(f"  Question repr: {repr(test_question)}")
        try:
            question_bytes = test_question.encode('utf-8')
            print(f"  Question UTF-8 bytes: {question_bytes[:30]}...")
            decoded = question_bytes.decode('utf-8')
            print(f"  Decoded back: {decoded}")
            print(f"  ✓ Encoding OK")
        except Exception as e:
            print(f"  ❌ Encoding error: {e}")
        
        # Tạo FAQ test
        print(f"\n💾 Đang lưu vào database...")
        test_faq = FAQ(
            Question=test_question,
            Answer=test_answer,
            Keywords=test_keywords,
            IsActive=True,
            ModifiedDate=datetime.now()
        )
        
        db.add(test_faq)
        db.commit()
        db.refresh(test_faq)
        
        print(f"  ✓ Đã lưu với FAQID: {test_faq.FAQID}")
        
        # Đọc lại từ database
        print(f"\n📖 Đọc lại từ database...")
        saved_faq = db.query(FAQ).filter(FAQ.FAQID == test_faq.FAQID).first()
        
        if saved_faq:
            print(f"  Question từ DB: {saved_faq.Question}")
            print(f"  Answer từ DB: {saved_faq.Answer[:50]}...")
            print(f"  Keywords từ DB: {saved_faq.Keywords}")
            
            # So sánh
            if saved_faq.Question == test_question:
                print(f"\n  ✅ Question khớp!")
            else:
                print(f"\n  ❌ Question KHÔNG khớp!")
                print(f"     Original: {repr(test_question)}")
                print(f"     From DB:  {repr(saved_faq.Question)}")
            
            if saved_faq.Answer == test_answer:
                print(f"  ✅ Answer khớp!")
            else:
                print(f"  ❌ Answer KHÔNG khớp!")
                print(f"     Original: {repr(test_answer[:50])}")
                print(f"     From DB:  {repr(saved_faq.Answer[:50])}")
            
            # Kiểm tra có ký tự "?" không
            if '?' in saved_faq.Question or '?' in saved_faq.Answer:
                print(f"\n  ⚠️  PHÁT HIỆN KÝ TỰ '?' - CÓ THỂ BỊ LỖI ENCODING!")
            else:
                print(f"\n  ✅ Không có ký tự '?' - Encoding có vẻ OK")
            
            # Xóa FAQ test
            print(f"\n🗑️  Xóa FAQ test...")
            db.delete(saved_faq)
            db.commit()
            print(f"  ✓ Đã xóa")
        else:
            print(f"  ❌ Không tìm thấy FAQ đã lưu!")
            
    except Exception as e:
        print(f"\n❌ Lỗi: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()
    
    print("\n" + "=" * 60)

if __name__ == "__main__":
    test_faq_encoding()
