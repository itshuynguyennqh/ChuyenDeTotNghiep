# FastAPI Backend - BikeGo E-Commerce

FastAPI backend implementation for BikeGo E-Commerce system, implementing authentication and admin API modules.

## Project Structure

```
fastapi_backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI application entry point
│   ├── config.py               # Configuration and settings
│   ├── database.py             # Database connection and session management
│   ├── dependencies.py         # Dependency injection (authentication, database)
│   │
│   ├── models/                 # SQLAlchemy models
│   │   ├── __init__.py
│   │   ├── base.py
│   │   ├── customer.py
│   │   ├── employee.py
│   │   ├── product.py
│   │   ├── order.py
│   │   ├── voucher.py
│   │   └── auth.py
│   │
│   ├── schemas/                # Pydantic schemas for request/response validation
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── admin.py
│   │   └── common.py
│   │
│   ├── routers/                # API route handlers
│   │   ├── __init__.py
│   │   ├── auth.py             # /auth endpoints
│   │   └── admin.py            # /admin endpoints
│   │
│   ├── services/               # Business logic layer
│   │   ├── __init__.py
│   │   ├── auth_service.py     # Authentication logic
│   │   ├── otp_service.py      # OTP generation and validation
│   │   ├── email_service.py    # Email sending (SMTP)
│   │   └── admin_service.py    # Admin operations
│   │
│   ├── utils/                  # Utility functions
│   │   ├── __init__.py
│   │   └── security.py         # Password hashing, JWT tokens
│   │
│   └── middleware/             # Custom middleware
│       ├── __init__.py
│
├── requirements.txt            # Python dependencies
├── .env.example                # Environment variables template
└── README.md                   # This file
```

## Quick Start

For detailed installation instructions, see [INSTALLATION.md](INSTALLATION.md).

### Quick Setup

1. **Create virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env  # Windows: copy .env.example .env
   # Edit .env with your database credentials
   ```

4. **Run the server:**
   ```bash
   uvicorn app.main:app --reload
   ```

## Setup Instructions

### Prerequisites

- Python 3.8 or higher
- SQL Server database (existing database will be used)
- ODBC Driver 17 for SQL Server (or compatible)

See [INSTALLATION.md](INSTALLATION.md) for detailed prerequisites and troubleshooting.

### Installation

See [INSTALLATION.md](INSTALLATION.md) for complete installation guide.

**Quick version:**

1. **Create virtual environment (recommended):**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure environment variables:**
   - Copy `.env.example` to `.env`
   - Update the values in `.env` with your configuration:
     ```env
     # Database Configuration
     DATABASE_SERVER=localhost\SQLEXPRESS
     DATABASE_NAME=final_project_getout
     DATABASE_USER=sa1
     DATABASE_PASSWORD=your_password
     DATABASE_PORT=1433
     DATABASE_DRIVER=ODBC Driver 17 for SQL Server
     
     # JWT Configuration
     SECRET_KEY=your-secret-key-here-change-in-production
     ALGORITHM=HS256
     ACCESS_TOKEN_EXPIRE_MINUTES=60
     
     # SMTP Configuration (for OTP emails)
     SMTP_HOST=smtp.gmail.com
     SMTP_PORT=587
     SMTP_USER=your-email@gmail.com
     SMTP_PASSWORD=your-app-password
     SMTP_FROM_EMAIL=your-email@gmail.com
     SMTP_USE_TLS=true
     
     # Application Configuration
     BASE_URL=http://localhost:8000
     CORS_ORIGINS=http://localhost:3000,http://localhost:5173
     
     # OTP Configuration
     OTP_EXPIRY_MINUTES=10
     ```

### Running the Application

**Development mode:**
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Production mode:**
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

The API will be available at:
- API: http://localhost:8000
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## API Endpoints

### Authentication (`/auth`)

- `POST /auth/login` - Login (customer/employee)
- `POST /auth/register` - Register new customer
- `POST /auth/verify-registration` - Verify registration OTP
- `POST /auth/forgot-password` - Request password reset OTP
- `POST /auth/reset-password` - Reset password with OTP

### Admin (`/admin`)

All admin endpoints require authentication with `admin` or `staff` role.

**Dashboard & Reports:**
- `GET /admin/dashboard` - Get dashboard statistics
- `GET /admin/reports` - Get revenue and product reports

**Products:**
- `GET /admin/products` - List products
- `POST /admin/products` - Create product
- `GET /admin/products/{product_id}` - Get product details
- `PATCH /admin/products/{product_id}` - Update product
- `DELETE /admin/products/{product_id}` - Delete product
- `GET /admin/reviews/{product_id}` - Get product reviews

**Promotions:**
- `GET /admin/promotions` - List promotions
- `POST /admin/promotions` - Create promotion
- `GET /admin/promotions/{promotion_id}` - Get promotion details
- `PATCH /admin/promotions/{promotion_id}` - Update promotion
- `DELETE /admin/promotions/{promotion_id}` - Delete promotion

**Categories:**
- `GET /admin/categories` - List categories
- `POST /admin/categories` - Create category
- `GET /admin/categories/{category_id}` - Get category details
- `PATCH /admin/categories/{category_id}` - Update category
- `DELETE /admin/categories/{category_id}` - Delete category

**Customers:**
- `GET /admin/customers` - List customers
- `GET /admin/customers/{customer_id}` - Get customer details
- `PATCH /admin/customers/{customer_id}` - Update customer status

**Orders:**
- `GET /admin/orders` - List orders
- `GET /admin/orders/{order_id}` - Get order details
- `PATCH /admin/orders/{order_id}/status` - Update order status

**Staff:**
- `GET /admin/staffs` - List staff (admin only)
- `POST /admin/staffs` - Create staff (admin only)
- `GET /admin/staffs/{staff_id}` - Get staff details (admin only)
- `PATCH /admin/staffs/{staff_id}` - Update staff (admin only)
- `DELETE /admin/staffs/{staff_id}` - Delete staff (admin only)

**Settings:**
- `GET /admin/settings/rental` - Get rental settings (admin only)
- `PATCH /admin/settings/rental` - Update rental settings (admin only)

**FAQs:**
- `GET /admin/faqs` - List FAQs
- `POST /admin/faqs` - Create FAQ
- `GET /admin/faqs/{faq_id}` - Get FAQ details
- `PATCH /admin/faqs/{faq_id}` - Update FAQ
- `DELETE /admin/faqs/{faq_id}` - Delete FAQ

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. After logging in, include the token in the Authorization header:

```
Authorization: Bearer <access_token>
```

## Environment Variables

### Required Variables

- `DATABASE_SERVER` - SQL Server instance (e.g., `localhost\SQLEXPRESS`)
- `DATABASE_NAME` - Database name
- `DATABASE_USER` - Database username
- `DATABASE_PASSWORD` - Database password
- `SECRET_KEY` - Secret key for JWT token signing (use a strong random string in production)

### Optional Variables

- `DATABASE_PORT` - Database port (default: 1433)
- `DATABASE_DRIVER` - ODBC driver name (default: "ODBC Driver 17 for SQL Server")
- `ALGORITHM` - JWT algorithm (default: HS256)
- `ACCESS_TOKEN_EXPIRE_MINUTES` - Token expiration time (default: 60)
- `SMTP_*` - SMTP settings for email (OTP functionality)
- `CORS_ORIGINS` - Allowed CORS origins (comma-separated)
- `OTP_EXPIRY_MINUTES` - OTP expiration time (default: 10)

## Notes

- The backend uses the existing SQL Server database schema. No migrations are needed.
- Many admin endpoints are stubbed and return 501 (Not Implemented). These need to be implemented based on specific business requirements.
- OTP functionality requires SMTP configuration. If not configured, OTPs will be logged to console (for development).
- Password hashing uses bcrypt via passlib.
- The database connection uses SQLAlchemy with pyodbc for SQL Server.

## Development

To extend the API:

1. Add new models in `app/models/`
2. Add schemas in `app/schemas/`
3. Implement business logic in `app/services/`
4. Create routes in `app/routers/`
5. Update `app/main.py` to include new routers

## License

[Your License Here]
