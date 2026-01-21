# Hướng Dẫn Chạy Chương Trình Frontend và Backend

## 📋 Tổng Quan

Dự án này bao gồm:
- **Frontend**: React application (chạy trên port 3000)
- **Backend API**: FastAPI (Python) chạy trên port 8001
- **JSON Server**: Mock API server (chạy trên port 8000) - dùng để test frontend

---

## 🚀 Cách Chạy Chương Trình

### **Bước 1: Chạy Backend (FastAPI)**

1. **Mở Terminal/PowerShell và di chuyển vào thư mục backend:**
   ```powershell
   cd backend
   ```

2. **Cài đặt dependencies (nếu chưa cài):**
   ```powershell
   pip install -r requirements.txt
   ```
   
   Hoặc nếu dùng Python 3:
   ```powershell
   python -m pip install -r requirements.txt
   ```

3. **Cấu hình Database:**
   - Backend sử dụng SQL Server
   - Kiểm tra file `backend/src/app/database.py` để cấu hình:
     - Server: `localhost\SQLEXPRESS`
     - Database: `final_project_getout`
     - Username: `sa1`
     - Password: `2611`
   - **Lưu ý**: Bạn cần có SQL Server đã được cài đặt và chạy trước khi start backend

4. **Chạy Backend:**
   ```powershell
   cd src
   python main.py
   ```
   
   Hoặc:
   ```powershell
   python -m uvicorn main:app --reload --host 0.0.0.0 --port 8001
   ```

5. **Kiểm tra Backend đã chạy:**
   - Mở browser và truy cập: `http://localhost:8001/docs`
   - Bạn sẽ thấy FastAPI Swagger UI documentation
   - Backend sẽ tự động tạo Super Admin account:
     - Email: `admin`
     - Password: `admin123`

---

### **Bước 2: Chạy Frontend**

1. **Mở Terminal/PowerShell mới và di chuyển vào thư mục frontend:**
   ```powershell
   cd frontend
   ```

2. **Cài đặt dependencies (nếu chưa cài):**
   ```powershell
   npm install
   ```

3. **Chạy Frontend:**
   ```powershell
   npm start
   ```
   
   Lệnh này sẽ tự động:
   - Chạy React development server trên port **3000**
   - Chạy JSON Server (mock API) trên port **8000**

4. **Kiểm tra Frontend đã chạy:**
   - Browser sẽ tự động mở tại: `http://localhost:3000`
   - JSON Server API documentation: `http://localhost:8000/api/docs`

---

## 📝 Tóm Tắt Các Port

| Service | Port | URL |
|---------|------|-----|
| React App | 3000 | http://localhost:3000 |
| JSON Server (Mock API) | 8000 | http://localhost:8000/api |
| FastAPI Backend | 8001 | http://localhost:8001/docs |

---

## ⚙️ Cấu Hình Frontend để Kết Nối Backend

Hiện tại, frontend đang cấu hình để kết nối với JSON Server (port 8000) theo mặc định.

Để frontend kết nối với FastAPI Backend (port 8001), bạn có thể:

1. **Tạo file `.env` trong thư mục `frontend`:**
   ```
   REACT_APP_API_URL=http://localhost:8001
   ```

2. **Hoặc chỉnh sửa file `frontend/src/api/axiosClient.js`:**
   ```javascript
   const baseURL = process.env.REACT_APP_API_URL || `http://${window.location.hostname}:8001`;
   ```

---

## 🔧 Yêu Cầu Hệ Thống

### Backend:
- Python 3.7+
- SQL Server (với ODBC Driver 17 for SQL Server)
- Các package Python trong `requirements.txt`

### Frontend:
- Node.js 14+ và npm
- Các package Node.js trong `package.json`

---

## 🐛 Xử Lý Lỗi Thường Gặp

### Lỗi khi chạy Backend:
- **Lỗi kết nối database**: Kiểm tra SQL Server đã chạy chưa và thông tin kết nối trong `database.py`
- **Lỗi thiếu module** (ví dụ: `email-validator`, `ModuleNotFoundError`): Chạy lại `pip install -r requirements.txt`
- **Lỗi `email-validator is not installed`**: Đây là dependency cần thiết cho Pydantic khi dùng EmailStr. Đã được thêm vào `requirements.txt`, chạy lại `pip install -r requirements.txt`
- **Lỗi timeout khi cài `fastapi_mail` hoặc `cryptography`**: 
  - **Giải pháp 1**: Thử lại với timeout tăng: `pip install --default-timeout=300 fastapi_mail`
  - **Giải pháp 2**: Cài từng package nhỏ trước: `pip install jinja2 blinker aiosmtplib` rồi mới cài `fastapi_mail`
  - **Giải pháp 3**: Kiểm tra kết nối mạng và thử lại sau
  - **Giải pháp 4**: Sử dụng mirror khác (nếu ở Việt Nam): `pip install -i https://pypi.tuna.tsinghua.edu.cn/simple fastapi_mail`

### Lỗi khi chạy Frontend:
- **Lỗi port đã được sử dụng**: Đóng các ứng dụng đang dùng port 3000 hoặc 8000
- **Lỗi thiếu dependencies**: Chạy lại `npm install`

---

## 📌 Lưu Ý Quan Trọng

1. **Chạy Backend trước** để đảm bảo database đã sẵn sàng
2. Frontend có thể chạy độc lập với JSON Server để test UI
3. Để test đầy đủ với database thật, cần chạy cả Backend và cấu hình frontend kết nối đến port 8001

---

## ✅ Kiểm Tra Đã Chạy Thành Công

1. ✅ Backend: Truy cập `http://localhost:8001/docs` → Thấy Swagger UI
2. ✅ JSON Server: Truy cập `http://localhost:8000/api/docs` → Thấy API documentation
3. ✅ Frontend: Browser tự động mở `http://localhost:3000` → Thấy trang web

---

Chúc bạn code vui vẻ! 🚀
