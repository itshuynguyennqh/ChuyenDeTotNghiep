# Hướng Dẫn Triển Khai - BikeGo E-commerce System

## Mục Lục

1. [Yêu Cầu Hệ Thống](#yêu-cầu-hệ-thống)
2. [Cài Đặt Development](#cài-đặt-development)
3. [Cấu Hình Database](#cấu-hình-database)
4. [Chạy Ứng Dụng](#chạy-ứng-dụng)
5. [Testing](#testing)
6. [Triển Khai Production](#triển-khai-production)
7. [Troubleshooting](#troubleshooting)

---

## Yêu Cầu Hệ Thống

### Backend Requirements

- **Python**: 3.7 hoặc cao hơn
- **SQL Server**: 2016 hoặc cao hơn
- **ODBC Driver**: ODBC Driver 17 for SQL Server (hoặc cao hơn)
- **Operating System**: Windows, Linux, hoặc macOS

### Frontend Requirements

- **Node.js**: 14.x hoặc cao hơn
- **npm**: 6.x hoặc cao hơn (hoặc yarn)
- **Operating System**: Windows, Linux, hoặc macOS

### Database Requirements

- **SQL Server**: Đã cài đặt và đang chạy
- **Database**: `final_project_getout` đã được tạo
- **Permissions**: User có quyền read/write trên database

---

## Cài Đặt Development

### Bước 1: Clone Repository

```bash
git clone <repository-url>
cd iqw
```

### Bước 2: Cài Đặt Backend Dependencies

1. **Tạo virtual environment (khuyến nghị)**:
```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/macOS
source venv/bin/activate
```

2. **Cài đặt dependencies**:
```bash
pip install -r requirements.txt
```

**Lưu ý**: Nếu gặp lỗi timeout khi cài `fastapi_mail` hoặc `cryptography`:
```bash
# Giải pháp 1: Tăng timeout
pip install --default-timeout=300 fastapi_mail

# Giải pháp 2: Cài từng package nhỏ trước
pip install jinja2 blinker aiosmtplib
pip install fastapi_mail

# Giải pháp 3: Sử dụng mirror (Việt Nam)
pip install -i https://pypi.tuna.tsinghua.edu.cn/simple fastapi_mail
```

### Bước 3: Cài Đặt Frontend Dependencies

```bash
cd frontend
npm install
```

**Lưu ý**: Nếu gặp lỗi với npm, thử:
```bash
npm install --legacy-peer-deps
```

---

## Cấu Hình Database

### Bước 1: Cài Đặt SQL Server

1. Tải và cài đặt SQL Server từ Microsoft
2. Cài đặt SQL Server Management Studio (SSMS) để quản lý database
3. Đảm bảo SQL Server đang chạy

### Bước 2: Tạo Database

1. Mở SSMS và kết nối đến SQL Server instance
2. Tạo database mới:
```sql
CREATE DATABASE final_project_getout;
```

3. Hoặc restore từ backup file nếu có

### Bước 3: Cấu Hình Connection String

Chỉnh sửa file `backend/src/app/database.py`:

```python
server = 'localhost\\SQLEXPRESS'  # Hoặc tên server của bạn
database = 'final_project_getout'
username = 'sa1'  # Hoặc username của bạn
password = '2611'  # Hoặc password của bạn
```

**Lưu ý**: 
- Nếu dùng SQL Server Authentication, sử dụng username/password
- Nếu dùng Windows Authentication, có thể bỏ username/password và sử dụng `Trusted_Connection=yes`

### Bước 4: Kiểm Tra ODBC Driver

Kiểm tra ODBC Driver đã được cài đặt:

**Windows**:
1. Mở "ODBC Data Source Administrator" (odbcad32.exe)
2. Tab "Drivers"
3. Tìm "ODBC Driver 17 for SQL Server"

Nếu chưa có, tải và cài đặt từ Microsoft.

---

## Chạy Ứng Dụng

### Chạy Backend

1. **Kích hoạt virtual environment** (nếu có):
```bash
cd backend
venv\Scripts\activate  # Windows
# hoặc
source venv/bin/activate  # Linux/macOS
```

2. **Di chuyển vào thư mục src**:
```bash
cd src
```

3. **Chạy server**:
```bash
python main.py
```

Hoặc:
```bash
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8001
```

4. **Kiểm tra Backend đã chạy**:
- Mở browser: `http://localhost:8001/docs`
- Bạn sẽ thấy Swagger UI documentation
- Backend tự động tạo Super Admin:
  - Email: `admin`
  - Password: `admin123`

### Chạy Frontend

1. **Mở terminal mới** và di chuyển vào thư mục frontend:
```bash
cd frontend
```

2. **Chạy development server**:
```bash
npm start
```

Lệnh này sẽ:
- Chạy React app trên port **3000**
- Tự động mở browser tại `http://localhost:3000`
- Chạy JSON Server (mock API) trên port **8000** (nếu cấu hình)

3. **Cấu hình kết nối Backend** (nếu cần):

Tạo file `.env` trong thư mục `frontend`:
```
REACT_APP_API_URL=http://localhost:8001
```

Hoặc chỉnh sửa `frontend/src/api/axiosClient.js`:
```javascript
const baseURL = process.env.REACT_APP_API_URL || `http://${window.location.hostname}:8001`;
```

### Tóm Tắt Các Port

| Service | Port | URL |
|---------|------|-----|
| React App | 3000 | http://localhost:3000 |
| JSON Server (Mock API) | 8000 | http://localhost:8000/api |
| FastAPI Backend | 8001 | http://localhost:8001/docs |

---

## Testing

### Test Backend API

1. **Sử dụng Swagger UI**:
   - Truy cập: `http://localhost:8001/docs`
   - Click vào endpoint muốn test
   - Click "Try it out"
   - Nhập request body
   - Click "Execute"
   - Xem response

2. **Sử dụng cURL**:
```bash
# Test login
curl -X POST "http://localhost:8001/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"identifier": "admin", "password": "admin123"}'
```

3. **Sử dụng Postman**:
   - Import OpenAPI spec từ Swagger UI
   - Test các endpoints

### Test Frontend

1. **Manual Testing**:
   - Mở `http://localhost:3000`
   - Test các chức năng:
     - Đăng ký/Đăng nhập
     - Xem danh sách sản phẩm
     - Thêm vào giỏ hàng
     - Checkout
     - Admin dashboard

2. **Unit Tests** (nếu có):
```bash
cd frontend
npm test
```

### Test Cases Quan Trọng

1. **Authentication**:
   - Đăng ký tài khoản mới
   - Xác thực OTP
   - Đăng nhập với email/phone
   - Đăng nhập với admin account
   - Quên mật khẩu và reset

2. **Product Management**:
   - Xem danh sách sản phẩm
   - Tìm kiếm sản phẩm
   - Xem chi tiết sản phẩm
   - Filter sản phẩm (category, price, rating)

3. **Cart & Checkout**:
   - Thêm sản phẩm vào giỏ hàng
   - Update quantity
   - Xóa item khỏi giỏ hàng
   - Checkout với voucher
   - Checkout không có voucher

4. **Admin Functions**:
   - Đăng nhập admin
   - Xem dashboard
   - Quản lý sản phẩm (CRUD)
   - Quản lý đơn hàng
   - Quản lý khách hàng
   - Xem báo cáo

---

## Triển Khai Production

### Backend Deployment

#### Option 1: Deploy trên Server (Linux)

1. **Cài đặt dependencies**:
```bash
sudo apt-get update
sudo apt-get install python3 python3-pip
pip3 install -r requirements.txt
```

2. **Cài đặt và cấu hình Nginx**:
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:8001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

3. **Sử dụng systemd để chạy service**:
Tạo file `/etc/systemd/system/bikego-api.service`:
```ini
[Unit]
Description=BikeGo API Service
After=network.target

[Service]
User=www-data
WorkingDirectory=/path/to/backend/src
Environment="PATH=/path/to/venv/bin"
ExecStart=/path/to/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8001
Restart=always

[Install]
WantedBy=multi-user.target
```

4. **Start service**:
```bash
sudo systemctl start bikego-api
sudo systemctl enable bikego-api
```

#### Option 2: Deploy trên Cloud (Heroku, Railway, etc.)

1. **Tạo `Procfile`** trong thư mục backend:
```
web: uvicorn src.main:app --host 0.0.0.0 --port $PORT
```

2. **Tạo `runtime.txt`**:
```
python-3.9.0
```

3. **Cấu hình environment variables**:
- `DATABASE_URL`: Connection string
- `SECRET_KEY`: JWT secret key
- `MAIL_USERNAME`: Email username
- `MAIL_PASSWORD`: Email password

4. **Deploy**:
```bash
git push heroku main
```

### Frontend Deployment

#### Option 1: Build và Deploy Static Files

1. **Build production**:
```bash
cd frontend
npm run build
```

2. **Deploy `build/` folder** lên:
   - **Netlify**: Kéo thả folder `build/` vào Netlify
   - **Vercel**: `vercel --prod`
   - **Nginx**: Copy `build/` vào `/var/www/html`

3. **Cấu hình environment variables**:
   - `REACT_APP_API_URL`: Backend API URL

#### Option 2: Deploy với Docker

1. **Tạo `Dockerfile`** trong thư mục frontend:
```dockerfile
FROM node:14-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

2. **Build và run**:
```bash
docker build -t bikego-frontend .
docker run -p 80:80 bikego-frontend
```

### Database Migration

1. **Backup database**:
```bash
sqlcmd -S localhost -U sa1 -P 2611 -Q "BACKUP DATABASE final_project_getout TO DISK='backup.bak'"
```

2. **Restore trên production server**:
```bash
sqlcmd -S production-server -U username -P password -Q "RESTORE DATABASE final_project_getout FROM DISK='backup.bak'"
```

### SSL/HTTPS Setup

1. **Sử dụng Let's Encrypt** (miễn phí):
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

2. **Cấu hình Nginx với SSL**:
```nginx
server {
    listen 443 ssl;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:8001;
    }
}
```

---

## Troubleshooting

### Lỗi Kết Nối Database

**Triệu chứng**: `OperationalError: (pyodbc.OperationalError) ...`

**Giải pháp**:
1. Kiểm tra SQL Server đang chạy:
```bash
# Windows
services.msc → SQL Server (MSSQLSERVER)

# Linux
sudo systemctl status mssql-server
```

2. Kiểm tra connection string trong `database.py`
3. Test connection bằng `sqlcmd`:
```bash
sqlcmd -S localhost\SQLEXPRESS -U sa1 -P 2611
```

4. Kiểm tra firewall cho phép port 1433

### Lỗi Module Not Found

**Triệu chứng**: `ModuleNotFoundError: No module named 'xxx'`

**Giải pháp**:
1. Đảm bảo virtual environment đã được kích hoạt
2. Cài lại dependencies:
```bash
pip install -r requirements.txt
```

3. Kiểm tra Python version:
```bash
python --version  # Phải >= 3.7
```

### Lỗi Port Đã Được Sử Dụng

**Triệu chứng**: `Address already in use`

**Giải pháp**:
1. Tìm process đang dùng port:
```bash
# Windows
netstat -ano | findstr :8001
taskkill /PID <PID> /F

# Linux/macOS
lsof -i :8001
kill -9 <PID>
```

2. Hoặc đổi port trong code

### Lỗi CORS

**Triệu chứng**: `Access to fetch at '...' from origin '...' has been blocked by CORS policy`

**Giải pháp**:
1. Thêm CORS middleware trong FastAPI:
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Lỗi JWT Token Invalid

**Triệu chứng**: `Could not validate credentials`

**Giải pháp**:
1. Kiểm tra token có trong localStorage
2. Kiểm tra token chưa hết hạn
3. Đăng nhập lại để lấy token mới

### Lỗi Email OTP Không Gửi Được

**Triệu chứng**: OTP không đến email

**Giải pháp**:
1. Kiểm tra cấu hình email trong `auth/config.py`
2. Kiểm tra App Password (không phải password đăng nhập Gmail)
3. Kiểm tra firewall không chặn port 587
4. Test với email khác

### Lỗi Frontend Build

**Triệu chứng**: `npm run build` fails

**Giải pháp**:
1. Xóa `node_modules` và `package-lock.json`:
```bash
rm -rf node_modules package-lock.json
npm install
```

2. Kiểm tra Node.js version:
```bash
node --version  # Phải >= 14
```

3. Clear npm cache:
```bash
npm cache clean --force
```

---

## Best Practices

### Security

1. **Không commit secrets**: Sử dụng environment variables
2. **HTTPS trong production**: Luôn sử dụng HTTPS
3. **Rate limiting**: Implement rate limiting cho API
4. **Input validation**: Validate tất cả inputs
5. **SQL Injection prevention**: Sử dụng ORM (SQLAlchemy) thay vì raw SQL

### Performance

1. **Database indexing**: Thêm indexes cho các columns thường query
2. **Caching**: Implement caching cho các queries thường dùng
3. **Image optimization**: Optimize images trước khi upload
4. **Code splitting**: Split code trong frontend để giảm bundle size

### Monitoring

1. **Logging**: Implement logging cho errors và important events
2. **Error tracking**: Sử dụng Sentry hoặc tương tự
3. **Performance monitoring**: Monitor API response times
4. **Database monitoring**: Monitor database performance

---

## Kết Luận

Hệ thống BikeGo E-commerce có thể được triển khai trên nhiều môi trường khác nhau. Đảm bảo:

- **Database đã được cấu hình đúng**
- **Dependencies đã được cài đặt đầy đủ**
- **Environment variables đã được set**
- **Firewall và security đã được cấu hình**
- **Backup strategy đã được thiết lập**

Chúc bạn triển khai thành công! 🚀
