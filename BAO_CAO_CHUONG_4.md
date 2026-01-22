# CHƯƠNG 4: CÀI ĐẶT VÀ TRIỂN KHAI

## Mục Lục

1. [Yêu Cầu Hệ Thống](#41-yêu-cầu-hệ-thống)
2. [Cài Đặt Môi Trường Development](#42-cài-đặt-môi-trường-development)
3. [Cấu Hình Hệ Thống](#43-cấu-hình-hệ-thống)
4. [Hướng Dẫn Chạy Ứng Dụng](#44-hướng-dẫn-chạy-ứng-dụng)
5. [Triển Khai Production](#45-triển-khai-production)
6. [Xử Lý Lỗi Thường Gặp](#46-xử-lý-lỗi-thường-gặp)

---

## 4.1. Yêu Cầu Hệ Thống

### 4.1.1. Yêu Cầu Phần Cứng

**Tối thiểu:**
- CPU: Intel Core i3 hoặc tương đương
- RAM: 4GB
- Ổ cứng: 10GB dung lượng trống
- Kết nối mạng: Internet để tải dependencies

**Khuyến nghị:**
- CPU: Intel Core i5 trở lên
- RAM: 8GB trở lên
- Ổ cứng: SSD với 20GB dung lượng trống
- Kết nối mạng: Băng thông ổn định

### 4.1.2. Yêu Cầu Phần Mềm - Backend

**Hệ điều hành:**
- Windows 10/11, Linux (Ubuntu 18.04+), hoặc macOS 10.14+

**Python:**
- Phiên bản: Python 3.7 hoặc cao hơn
- Kiểm tra phiên bản:
  ```bash
  python --version
  # hoặc
  python3 --version
  ```

**SQL Server:**
- SQL Server 2016 hoặc cao hơn
- SQL Server Management Studio (SSMS) - khuyến nghị
- ODBC Driver 17 for SQL Server (hoặc cao hơn)

**Các công cụ hỗ trợ:**
- pip (Python package manager) - đi kèm với Python
- Git (để clone repository)

### 4.1.3. Yêu Cầu Phần Mềm - Frontend

**Node.js và npm:**
- Node.js: Phiên bản 14.x hoặc cao hơn (khuyến nghị: 16.x hoặc 18.x)
- npm: Phiên bản 6.x hoặc cao hơn (đi kèm với Node.js)
- Kiểm tra phiên bản:
  ```bash
  node --version
  npm --version
  ```

**Trình duyệt:**
- Chrome, Firefox, Edge, Safari (phiên bản mới nhất)
- Hỗ trợ ES6+ và modern JavaScript features

### 4.1.4. Yêu Cầu Phần Mềm - Database

**SQL Server:**
- SQL Server 2016 hoặc cao hơn
- SQL Server Express (đủ cho development)
- SQL Server Management Studio (SSMS) - để quản lý database

**ODBC Driver:**
- ODBC Driver 17 for SQL Server (bắt buộc)
- Tải về từ: https://docs.microsoft.com/sql/connect/odbc/download-odbc-driver-for-sql-server

### 4.1.5. Tóm Tắt Phiên Bản Công Nghệ

| Component | Phiên Bản | Ghi Chú |
|-----------|-----------|---------|
| Python | 3.7+ | Khuyến nghị 3.9+ |
| Node.js | 14.x+ | Khuyến nghị 16.x hoặc 18.x |
| SQL Server | 2016+ | Express đủ cho development |
| ODBC Driver | 17+ | Bắt buộc |
| React | 19.2.0 | Frontend framework |
| FastAPI | Latest | Backend framework |
| Material-UI | 7.3.5 | UI component library |

---

## 4.2. Cài Đặt Môi Trường Development

### 4.2.1. Cài Đặt Python và Dependencies

#### Bước 1: Kiểm tra Python đã cài đặt

```bash
python --version
```

Nếu chưa có Python, tải và cài đặt từ: https://www.python.org/downloads/

**Lưu ý:** Khi cài đặt Python trên Windows, nhớ tick vào "Add Python to PATH"

#### Bước 2: Tạo Virtual Environment (Khuyến nghị)

Virtual environment giúp cô lập dependencies của dự án:

**Windows:**
```powershell
cd backendfapi
python -m venv venv
venv\Scripts\activate
```

**Linux/macOS:**
```bash
cd backendfapi
python3 -m venv venv
source venv/bin/activate
```

Sau khi activate, prompt sẽ hiển thị `(venv)` ở đầu dòng.

#### Bước 3: Cài đặt Python Dependencies

```bash
cd backendfapi
pip install -r requirements.txt
```

**Dependencies chính:**
- `fastapi`: Web framework
- `uvicorn[standard]`: ASGI server
- `sqlalchemy`: ORM cho database
- `pyodbc`: SQL Server driver
- `passlib[argon2]`: Password hashing
- `python-jose`: JWT token handling
- `fastapi-mail`: Email service cho OTP
- `google-generativeai`: Chatbot AI integration

**Xử lý lỗi timeout khi cài đặt:**

Nếu gặp lỗi timeout khi cài `fastapi-mail` hoặc `cryptography`:

```bash
# Giải pháp 1: Tăng timeout
pip install --default-timeout=300 fastapi-mail

# Giải pháp 2: Cài từng package nhỏ trước
pip install jinja2 blinker aiosmtplib
pip install fastapi-mail

# Giải pháp 3: Sử dụng mirror (Việt Nam)
pip install -i https://pypi.tuna.tsinghua.edu.cn/simple fastapi-mail
```

### 4.2.2. Cài Đặt Node.js và npm

#### Bước 1: Tải và cài đặt Node.js

Tải Node.js từ: https://nodejs.org/
- Chọn phiên bản LTS (Long Term Support)
- Cài đặt với tùy chọn mặc định

#### Bước 2: Kiểm tra cài đặt

```bash
node --version
npm --version
```

#### Bước 3: Cài đặt Frontend Dependencies

```bash
cd frontend
npm install
```

**Lưu ý:** Nếu gặp lỗi với npm, thử:
```bash
npm install --legacy-peer-deps
```

**Dependencies chính:**
- `react`: 19.2.0
- `@mui/material`: 7.3.5
- `react-router-dom`: 7.9.6
- `axios`: 1.13.2
- `recharts`: 2.12.7

### 4.2.3. Cài Đặt SQL Server

#### Bước 1: Tải SQL Server

- **SQL Server Express** (miễn phí): https://www.microsoft.com/sql-server/sql-server-downloads
- **SQL Server Management Studio (SSMS)**: https://docs.microsoft.com/sql/ssms/download-sql-server-management-studio-ssms

#### Bước 2: Cài đặt SQL Server

1. Chạy installer SQL Server Express
2. Chọn "Basic" installation (đơn giản nhất)
3. Đợi quá trình cài đặt hoàn tất
4. Ghi nhớ instance name (thường là `SQLEXPRESS`)

#### Bước 3: Cài đặt ODBC Driver

1. Tải ODBC Driver 17 for SQL Server từ Microsoft
2. Cài đặt driver
3. Kiểm tra driver đã cài đặt:

**Windows:**
- Mở "ODBC Data Source Administrator" (odbcad32.exe)
- Tab "Drivers"
- Tìm "ODBC Driver 17 for SQL Server"

**Linux:**
```bash
odbcinst -q -d
```

### 4.2.4. Cấu Trúc Thư Mục Dự Án

Sau khi clone repository, cấu trúc thư mục như sau:

```
ChuyenDeTotNghiep/
├── backendfapi/              # Backend FastAPI
│   ├── src/
│   │   ├── main.py           # Entry point
│   │   └── app/
│   │       ├── database.py    # Database config
│   │       ├── models.py      # SQLAlchemy models
│   │       └── routes/        # API routes
│   └── requirements.txt      # Python dependencies
│
├── frontend/                  # Frontend React
│   ├── src/
│   │   ├── api/              # API client modules
│   │   ├── components/       # React components
│   │   ├── pages/            # Page components
│   │   └── App.js            # Main app
│   ├── package.json          # Node.js dependencies
│   └── server.js             # JSON Server (mock API)
│
└── ecommerce_backend_scrap/  # Django project (có thể không dùng)
```

---

## 4.3. Cấu Hình Hệ Thống

### 4.3.1. Cấu Hình Database

#### Bước 1: Tạo Database

1. Mở SQL Server Management Studio (SSMS)
2. Kết nối đến SQL Server instance (thường là `localhost\SQLEXPRESS`)
3. Tạo database mới:

```sql
CREATE DATABASE final_project_getout;
```

Hoặc restore từ backup file nếu có:
```sql
RESTORE DATABASE final_project_getout 
FROM DISK = 'C:\path\to\backup.bak'
WITH REPLACE;
```

#### Bước 2: Tạo User và Cấp Quyền

```sql
-- Tạo login
CREATE LOGIN sa1 WITH PASSWORD = '2611';

-- Tạo user cho database
USE final_project_getout;
CREATE USER sa1 FOR LOGIN sa1;

-- Cấp quyền
ALTER ROLE db_owner ADD MEMBER sa1;
```

**Lưu ý:** Trong production, nên sử dụng user với quyền hạn tối thiểu cần thiết.

#### Bước 3: Cấu Hình Connection String

Chỉnh sửa file `backendfapi/src/app/database.py`:

```python
server = 'localhost\\SQLEXPRESS'  # Hoặc tên server của bạn
database = 'final_project_getout'
username = 'sa1'  # Hoặc username của bạn
password = '2611'  # Hoặc password của bạn
```

**Lưu ý:**
- Nếu dùng Windows Authentication, có thể bỏ username/password và sử dụng `Trusted_Connection=yes`
- Nếu SQL Server chạy trên port khác mặc định (1433), thêm `PORT=port_number` vào connection string

#### Bước 4: Kiểm Tra Kết Nối Database

**Cách 1: Sử dụng Python script**

Tạo file `test_db.py`:

```python
from app.database import engine

try:
    with engine.connect() as conn:
        print("✓ Kết nối database thành công!")
except Exception as e:
    print(f"✗ Lỗi kết nối: {e}")
```

Chạy:
```bash
cd backendfapi/src
python test_db.py
```

**Cách 2: Sử dụng sqlcmd (Windows)**

```bash
sqlcmd -S localhost\SQLEXPRESS -U sa1 -P 2611 -Q "SELECT @@VERSION"
```

**Cách 3: Sử dụng SSMS**

1. Mở SSMS
2. Kết nối với thông tin đã cấu hình
3. Kiểm tra database `final_project_getout` đã tồn tại

### 4.3.2. Cấu Hình Backend

#### Environment Variables (Khuyến nghị)

Tạo file `.env` trong thư mục `backendfapi/`:

```env
# Database
DB_SERVER=localhost\SQLEXPRESS
DB_NAME=final_project_getout
DB_USER=sa1
DB_PASSWORD=2611

# JWT
SECRET_KEY=your-secret-key-here-change-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=43200  # 30 ngày

# Email (cho OTP)
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_FROM=your-email@gmail.com
MAIL_PORT=587
MAIL_SERVER=smtp.gmail.com

# Chatbot
GEMINI_API_KEY=your-gemini-api-key
```

**Lưu ý:** File `.env` nên được thêm vào `.gitignore` để không commit secrets lên Git.

#### Cấu Hình CORS

File `backendfapi/src/app/__init__.py` đã cấu hình CORS:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**Cho production:** Thay `allow_origins` bằng domain thực tế:
```python
allow_origins=["https://yourdomain.com"]
```

### 4.3.3. Cấu Hình Frontend

#### Cấu Hình API URL

**Cách 1: Sử dụng Environment Variable (Khuyến nghị)**

Tạo file `.env` trong thư mục `frontend/`:

```env
REACT_APP_API_URL=http://localhost:8001
```

**Cách 2: Chỉnh sửa trực tiếp**

File `frontend/src/api/axiosClient.js`:

```javascript
const baseURL = process.env.REACT_APP_API_URL || 
                `http://${window.location.hostname}:8001`;
```

#### Cấu Hình JSON Server (Mock API - Development)

File `frontend/server.js` cấu hình JSON Server để test frontend độc lập:

```javascript
const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use('/api', router);
server.listen(8000, () => {
  console.log('JSON Server is running on port 8000');
});
```

---

## 4.4. Hướng Dẫn Chạy Ứng Dụng

### 4.4.1. Chạy Backend

#### Bước 1: Kích hoạt Virtual Environment (nếu có)

**Windows:**
```powershell
cd backendfapi
venv\Scripts\activate
```

**Linux/macOS:**
```bash
cd backendfapi
source venv/bin/activate
```

#### Bước 2: Di chuyển vào thư mục src

```bash
cd src
```

#### Bước 3: Chạy Backend Server

**Cách 1: Sử dụng main.py**
```bash
python main.py
```

**Cách 2: Sử dụng uvicorn trực tiếp**
```bash
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8001
```

**Các tham số:**
- `--reload`: Tự động reload khi code thay đổi (development)
- `--host 0.0.0.0`: Cho phép truy cập từ mọi IP
- `--port 8001`: Port chạy server

#### Bước 4: Kiểm Tra Backend Đã Chạy

1. Mở browser và truy cập: `http://localhost:8001/docs`
2. Bạn sẽ thấy FastAPI Swagger UI documentation
3. Backend tự động tạo Super Admin account:
   - Email: `admin`
   - Password: `admin123`

**Lưu ý:** Super Admin chỉ được tạo khi chạy lần đầu. Nếu đã có, sẽ không tạo lại.

### 4.4.2. Chạy Frontend

#### Bước 1: Mở Terminal mới

Giữ backend đang chạy, mở terminal/PowerShell mới.

#### Bước 2: Di chuyển vào thư mục frontend

```bash
cd frontend
```

#### Bước 3: Chạy Frontend Development Server

```bash
npm start
```

Lệnh này sẽ:
- Chạy React app trên port **3000**
- Tự động mở browser tại `http://localhost:3000`
- Chạy JSON Server (mock API) trên port **8000** (nếu cấu hình)

#### Bước 4: Kiểm Tra Frontend Đã Chạy

- Browser tự động mở tại: `http://localhost:3000`
- JSON Server API (nếu có): `http://localhost:8000/api`

### 4.4.3. Tóm Tắt Các Port

| Service | Port | URL | Mô Tả |
|---------|------|-----|-------|
| React App | 3000 | http://localhost:3000 | Frontend application |
| JSON Server | 8000 | http://localhost:8000/api | Mock API (development) |
| FastAPI Backend | 8001 | http://localhost:8001/docs | Backend API |

### 4.4.4. Kiểm Tra Kết Nối Frontend-Backend

1. Mở browser tại `http://localhost:3000`
2. Mở Developer Tools (F12)
3. Tab Network
4. Thực hiện một action (ví dụ: đăng nhập)
5. Kiểm tra request có gửi đến `http://localhost:8001` không

**Nếu frontend không kết nối được backend:**
- Kiểm tra backend đang chạy trên port 8001
- Kiểm tra CORS configuration trong backend
- Kiểm tra `REACT_APP_API_URL` trong `.env` file

### 4.4.5. Test Các Chức Năng Cơ Bản

#### Test Authentication

1. Truy cập `http://localhost:3000/login`
2. Đăng nhập với Super Admin:
   - Email: `admin`
   - Password: `admin123`
3. Kiểm tra redirect đến admin dashboard

#### Test Product List

1. Truy cập `http://localhost:3000`
2. Kiểm tra danh sách sản phẩm hiển thị
3. Test tìm kiếm và filter

#### Test Admin Dashboard

1. Đăng nhập với admin account
2. Truy cập `http://localhost:3000/admin/dashboard`
3. Kiểm tra các metrics và charts hiển thị

---

## 4.5. Triển Khai Production

### 4.5.1. Build Frontend cho Production

#### Bước 1: Build React App

```bash
cd frontend
npm run build
```

Lệnh này sẽ:
- Tạo optimized production build trong thư mục `build/`
- Minify JavaScript và CSS
- Optimize images
- Generate source maps (có thể tắt)

#### Bước 2: Kiểm Tra Build

```bash
# Windows
cd build
dir

# Linux/macOS
cd build
ls -la
```

Thư mục `build/` chứa các file static sẵn sàng deploy.

### 4.5.2. Cấu Hình Backend cho Production

#### Bước 1: Tắt Debug Mode

Trong `main.py`, đảm bảo:
```python
# Không sử dụng --reload trong production
# uvicorn main:app --host 0.0.0.0 --port 8001
```

#### Bước 2: Sử dụng Production ASGI Server

**Option 1: Gunicorn với Uvicorn Workers (Linux/macOS)**

```bash
pip install gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8001
```

**Option 2: Uvicorn với Production Settings**

```bash
uvicorn main:app --host 0.0.0.0 --port 8001 --workers 4 --no-access-log
```

#### Bước 3: Cấu Hình Environment Variables

Tạo file `.env` production với các giá trị thực tế:
- `SECRET_KEY`: Key mạnh và bảo mật
- `DB_PASSWORD`: Password database production
- `MAIL_PASSWORD`: App password cho email service

### 4.5.3. Deploy lên Server

#### Option 1: Deploy trên Linux Server (VPS/Cloud)

**1. Cài đặt Dependencies trên Server:**

```bash
# Cập nhật hệ thống
sudo apt-get update
sudo apt-get upgrade -y

# Cài Python
sudo apt-get install python3 python3-pip python3-venv

# Cài Node.js (để build frontend)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Cài SQL Server (Linux)
# Tham khảo: https://docs.microsoft.com/sql/linux/sql-server-linux-setup
```

**2. Clone Repository:**

```bash
git clone <repository-url>
cd ChuyenDeTotNghiep
```

**3. Setup Backend:**

```bash
cd backendfapi
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

**4. Build Frontend:**

```bash
cd ../frontend
npm install
npm run build
```

**5. Cấu hình Nginx:**

Tạo file `/etc/nginx/sites-available/bikego`:

```nginx
# Backend API
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:8001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Frontend
server {
    listen 80;
    server_name yourdomain.com;

    root /path/to/frontend/build;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /static/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/bikego /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

**6. Setup Systemd Service cho Backend:**

Tạo file `/etc/systemd/system/bikego-api.service`:

```ini
[Unit]
Description=BikeGo API Service
After=network.target

[Service]
User=www-data
WorkingDirectory=/path/to/backendfapi/src
Environment="PATH=/path/to/backendfapi/venv/bin"
ExecStart=/path/to/backendfapi/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8001 --workers 4
Restart=always

[Install]
WantedBy=multi-user.target
```

Start service:
```bash
sudo systemctl start bikego-api
sudo systemctl enable bikego-api
sudo systemctl status bikego-api
```

#### Option 2: Deploy với Docker

**1. Tạo Dockerfile cho Backend:**

File `backendfapi/Dockerfile`:

```dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY src/ .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001"]
```

**2. Tạo Dockerfile cho Frontend:**

File `frontend/Dockerfile`:

```dockerfile
# Build stage
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**3. Tạo docker-compose.yml:**

```yaml
version: '3.8'

services:
  backend:
    build: ./backendfapi
    ports:
      - "8001:8001"
    environment:
      - DB_SERVER=sqlserver
      - DB_NAME=final_project_getout
      - DB_USER=sa1
      - DB_PASSWORD=yourpassword
    depends_on:
      - sqlserver

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend

  sqlserver:
    image: mcr.microsoft.com/mssql/server:2019-latest
    environment:
      - ACCEPT_EULA=Y
      - SA_PASSWORD=YourStrong@Passw0rd
    ports:
      - "1433:1433"
    volumes:
      - sqlserver_data:/var/opt/mssql

volumes:
  sqlserver_data:
```

**4. Build và Run:**

```bash
docker-compose up -d
```

#### Option 3: Deploy lên Cloud Platforms

**Heroku:**

1. Tạo `Procfile` trong `backendfapi/`:
```
web: uvicorn src.main:app --host 0.0.0.0 --port $PORT
```

2. Deploy:
```bash
heroku create bikego-api
git push heroku main
```

**Railway/Render:**

1. Connect repository
2. Set environment variables
3. Deploy tự động

**Frontend - Netlify/Vercel:**

1. Connect repository
2. Build command: `npm run build`
3. Publish directory: `build`
4. Set environment variable: `REACT_APP_API_URL`

### 4.5.4. Cấu Hình SSL/HTTPS

#### Sử dụng Let's Encrypt (Miễn phí)

**1. Cài đặt Certbot:**

```bash
sudo apt-get install certbot python3-certbot-nginx
```

**2. Lấy SSL Certificate:**

```bash
sudo certbot --nginx -d yourdomain.com -d api.yourdomain.com
```

**3. Auto-renewal:**

```bash
sudo certbot renew --dry-run
```

Certbot tự động cấu hình Nginx với SSL.

### 4.5.5. Cấu Hình Domain và DNS

**1. Trỏ DNS Records:**

- A Record: `yourdomain.com` → Server IP
- A Record: `api.yourdomain.com` → Server IP

**2. Kiểm tra DNS:**

```bash
nslookup yourdomain.com
nslookup api.yourdomain.com
```

### 4.5.6. Database Migration cho Production

**1. Backup Database Development:**

```bash
sqlcmd -S localhost -U sa1 -P 2611 -Q "BACKUP DATABASE final_project_getout TO DISK='backup.bak'"
```

**2. Restore trên Production Server:**

```bash
sqlcmd -S production-server -U username -P password -Q "RESTORE DATABASE final_project_getout FROM DISK='backup.bak'"
```

**3. Cập nhật Connection String:**

Cập nhật `database.py` với thông tin production server.

---

## 4.6. Xử Lý Lỗi Thường Gặp

### 4.6.1. Lỗi Kết Nối Database

**Triệu chứng:**
```
OperationalError: (pyodbc.OperationalError) ...
[Microsoft][ODBC Driver 17 for SQL Server][SQL Server]Login failed
```

**Nguyên nhân:**
- SQL Server chưa chạy
- Thông tin đăng nhập sai
- Firewall chặn port 1433
- ODBC Driver chưa cài đặt

**Giải pháp:**

1. **Kiểm tra SQL Server đang chạy:**

**Windows:**
- Mở Services (`services.msc`)
- Tìm "SQL Server (MSSQLSERVER)" hoặc "SQL Server (SQLEXPRESS)"
- Đảm bảo Status là "Running"

**Linux:**
```bash
sudo systemctl status mssql-server
```

2. **Kiểm tra Connection String:**

Kiểm tra file `database.py`:
- Server name đúng chưa?
- Username và password đúng chưa?
- Database name đúng chưa?

3. **Test Connection bằng sqlcmd:**

```bash
sqlcmd -S localhost\SQLEXPRESS -U sa1 -P 2611
```

Nếu kết nối thành công, sẽ thấy prompt `1>`.

4. **Kiểm tra Firewall:**

**Windows:**
- Mở Windows Firewall
- Cho phép port 1433 (SQL Server)

**Linux:**
```bash
sudo ufw allow 1433/tcp
```

5. **Kiểm tra ODBC Driver:**

**Windows:**
- Mở "ODBC Data Source Administrator"
- Tab "Drivers"
- Tìm "ODBC Driver 17 for SQL Server"

Nếu không có, tải và cài đặt từ Microsoft.

### 4.6.2. Lỗi Module Not Found

**Triệu chứng:**
```
ModuleNotFoundError: No module named 'fastapi'
```

**Nguyên nhân:**
- Virtual environment chưa được kích hoạt
- Dependencies chưa được cài đặt
- Đang dùng Python version sai

**Giải pháp:**

1. **Kích hoạt Virtual Environment:**

```bash
# Windows
venv\Scripts\activate

# Linux/macOS
source venv/bin/activate
```

2. **Cài lại Dependencies:**

```bash
pip install -r requirements.txt
```

3. **Kiểm tra Python Version:**

```bash
python --version  # Phải >= 3.7
```

4. **Kiểm tra pip:**

```bash
pip --version
pip install --upgrade pip
```

### 4.6.3. Lỗi Port Đã Được Sử Dụng

**Triệu chứng:**
```
Error: listen EADDRINUSE: address already in use :::8001
```

**Nguyên nhân:**
- Port đang được sử dụng bởi process khác
- Backend đã chạy ở terminal khác

**Giải pháp:**

1. **Tìm Process đang dùng Port:**

**Windows:**
```powershell
netstat -ano | findstr :8001
taskkill /PID <PID> /F
```

**Linux/macOS:**
```bash
lsof -i :8001
kill -9 <PID>
```

2. **Đổi Port:**

Trong `main.py` hoặc khi chạy uvicorn:
```bash
uvicorn main:app --port 8002
```

Và cập nhật frontend `.env`:
```
REACT_APP_API_URL=http://localhost:8002
```

### 4.6.4. Lỗi CORS

**Triệu chứng:**
```
Access to fetch at 'http://localhost:8001/auth/login' from origin 'http://localhost:3000' 
has been blocked by CORS policy
```

**Nguyên nhân:**
- Backend chưa cấu hình CORS
- `allow_origins` không bao gồm frontend URL

**Giải pháp:**

1. **Kiểm tra CORS Middleware:**

File `backendfapi/src/app/__init__.py`:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

2. **Thêm Frontend URL vào allow_origins:**

Nếu frontend chạy trên port khác:
```python
allow_origins=["http://localhost:3000", "http://localhost:3001"]
```

3. **Cho Production:**

```python
allow_origins=["https://yourdomain.com"]
```

### 4.6.5. Lỗi JWT Token Invalid

**Triệu chứng:**
```
Could not validate credentials
```

**Nguyên nhân:**
- Token hết hạn
- Token không hợp lệ
- Token không được gửi trong request

**Giải pháp:**

1. **Kiểm tra Token trong localStorage:**

Mở browser DevTools → Application → Local Storage:
- Key: `token`
- Value: JWT token string

2. **Kiểm tra Token Expiry:**

Token có thời hạn 30 ngày. Nếu hết hạn, đăng nhập lại.

3. **Kiểm tra Request Headers:**

Trong Network tab, kiểm tra request có header:
```
Authorization: Bearer <token>
```

4. **Đăng nhập lại:**

Xóa token cũ và đăng nhập lại:
```javascript
localStorage.removeItem('token');
// Redirect to login
```

### 4.6.6. Lỗi Email OTP Không Gửi Được

**Triệu chứng:**
- OTP không đến email
- Lỗi SMTP connection

**Nguyên nhân:**
- Cấu hình email sai
- App Password chưa được tạo (Gmail)
- Firewall chặn port 587

**Giải pháp:**

1. **Kiểm tra Cấu hình Email:**

File `backendfapi/src/app/routes/auth/config.py`:

```python
mail_config = {
    "MAIL_USERNAME": "your-email@gmail.com",
    "MAIL_PASSWORD": "your-app-password",  # Không phải password đăng nhập
    "MAIL_FROM": "your-email@gmail.com",
    "MAIL_PORT": 587,
    "MAIL_SERVER": "smtp.gmail.com",
}
```

2. **Tạo App Password cho Gmail:**

- Vào Google Account → Security
- Bật 2-Step Verification
- Tạo App Password
- Sử dụng App Password (16 ký tự) thay vì password đăng nhập

3. **Kiểm tra Firewall:**

Cho phép port 587 (SMTP):
```bash
sudo ufw allow 587/tcp
```

4. **Test với Email Khác:**

Thử với email provider khác (Outlook, Yahoo) để xác định vấn đề.

### 4.6.7. Lỗi Frontend Build

**Triệu chứng:**
```
npm run build fails
```

**Nguyên nhân:**
- Lỗi syntax trong code
- Dependencies conflict
- Node.js version không tương thích

**Giải pháp:**

1. **Xóa node_modules và cài lại:**

```bash
rm -rf node_modules package-lock.json
npm install
```

2. **Kiểm tra Node.js Version:**

```bash
node --version  # Phải >= 14
```

3. **Clear npm Cache:**

```bash
npm cache clean --force
```

4. **Kiểm tra Lỗi Syntax:**

```bash
npm run build 2>&1 | grep -i error
```

5. **Build với Verbose:**

```bash
npm run build -- --verbose
```

### 4.6.8. Lỗi Dependencies Conflict

**Triệu chứng:**
```
npm ERR! peer dep missing
```

**Giải pháp:**

1. **Sử dụng --legacy-peer-deps:**

```bash
npm install --legacy-peer-deps
```

2. **Cập nhật package.json:**

Xóa `package-lock.json` và cài lại:
```bash
rm package-lock.json
npm install
```

### 4.6.9. Lỗi Database Connection Timeout

**Triệu chứng:**
```
Timeout expired. The timeout period elapsed
```

**Giải pháp:**

1. **Tăng Connection Timeout:**

Trong `database.py`:
```python
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    pool_pre_ping=True,
    connect_args={"timeout": 30}  # Tăng timeout
)
```

2. **Kiểm tra Network:**

```bash
ping <database-server>
```

3. **Kiểm tra SQL Server đang chạy:**

```bash
# Windows
sc query MSSQLSERVER

# Linux
sudo systemctl status mssql-server
```

### 4.6.10. Lỗi Static Files Không Load (Production)

**Triệu chứng:**
- CSS/JS không load
- 404 errors cho static files

**Giải pháp:**

1. **Kiểm tra Nginx Config:**

```nginx
location /static/ {
    alias /path/to/frontend/build/static/;
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

2. **Kiểm tra File Permissions:**

```bash
sudo chown -R www-data:www-data /path/to/frontend/build
sudo chmod -R 755 /path/to/frontend/build
```

3. **Kiểm tra Build Output:**

Đảm bảo thư mục `build/static/` có các file CSS và JS.

---

## Kết Luận

Chương 4 đã trình bày đầy đủ quy trình cài đặt và triển khai hệ thống BikeGo E-commerce, bao gồm:

1. **Yêu cầu hệ thống:** Đã liệt kê đầy đủ các yêu cầu phần cứng và phần mềm cần thiết.

2. **Cài đặt môi trường development:** Hướng dẫn chi tiết cài đặt Python, Node.js, SQL Server và các dependencies.

3. **Cấu hình hệ thống:** Hướng dẫn cấu hình database, backend và frontend.

4. **Chạy ứng dụng:** Hướng dẫn chạy backend và frontend trong môi trường development.

5. **Triển khai production:** Các phương án deploy lên server, Docker, và cloud platforms.

6. **Xử lý lỗi:** Tổng hợp các lỗi thường gặp và cách khắc phục.

Với hướng dẫn này, người dùng có thể tự cài đặt và triển khai hệ thống một cách độc lập, từ môi trường development đến production.

---

**Tài liệu tham khảo:**
- FastAPI Documentation: https://fastapi.tiangolo.com/
- React Documentation: https://react.dev/
- SQL Server Documentation: https://docs.microsoft.com/sql/
- Material-UI Documentation: https://mui.com/
