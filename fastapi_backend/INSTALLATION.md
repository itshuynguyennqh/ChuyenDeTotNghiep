# FastAPI Backend Installation and Setup Guide

Complete guide for installing, configuring, and running the BikeGo E-Commerce FastAPI backend.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation Steps](#installation-steps)
3. [Configuration](#configuration)
4. [Running the Application](#running-the-application)
5. [Verification](#verification)
6. [Troubleshooting](#troubleshooting)

## Prerequisites

Before installing the FastAPI backend, ensure you have the following:

### Required Software

1. **Python 3.8 or higher**
   - Check version: `python --version` or `python3 --version`
   - Download: https://www.python.org/downloads/

2. **SQL Server Database**
   - SQL Server 2016 or higher
   - SQL Server Express is sufficient for development
   - Database: `final_project_getout` (or your existing database)

3. **ODBC Driver for SQL Server**
   - **Windows**: Usually pre-installed. Check: Control Panel → Administrative Tools → ODBC Data Sources
   - **Linux**: Install `unixodbc` and `freetds` or Microsoft ODBC Driver
   - **macOS**: Install via Homebrew: `brew install unixodbc freetds`

4. **Git** (optional, for cloning repositories)

### Database Access

You need the following database credentials:
- Server name/instance (e.g., `localhost\SQLEXPRESS`)
- Database name (e.g., `final_project_getout`)
- Username (e.g., `sa1`)
- Password

## Installation Steps

### Step 1: Navigate to Backend Directory

```bash
cd fastapi_backend
```

### Step 2: Create Virtual Environment (Recommended)

**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**Linux/macOS:**
```bash
python3 -m venv venv
source venv/bin/activate
```

After activation, your terminal prompt should show `(venv)`.

### Step 3: Install Dependencies

```bash
pip install -r requirements.txt
```

This will install:
- FastAPI
- Uvicorn (ASGI server)
- SQLAlchemy (ORM)
- pyodbc (SQL Server driver)
- python-jose (JWT tokens)
- passlib (password hashing)
- pydantic (data validation)
- And other dependencies

**Note**: If you encounter errors installing `pyodbc`:
- **Windows**: Usually works without issues
- **Linux**: You may need to install `unixodbc-dev`: `sudo apt-get install unixodbc-dev`
- **macOS**: You may need: `brew install unixodbc`

### Step 4: Configure Environment Variables

1. Copy the example environment file:
   ```bash
   # Windows
   copy .env.example .env
   
   # Linux/macOS
   cp .env.example .env
   ```

2. Open `.env` file in a text editor and update the values:

```env
# Database Configuration
DATABASE_SERVER=localhost\SQLEXPRESS
DATABASE_NAME=final_project_getout
DATABASE_USER=sa1
DATABASE_PASSWORD=your_actual_password_here
DATABASE_PORT=1433
DATABASE_DRIVER=ODBC Driver 17 for SQL Server

# JWT Configuration
SECRET_KEY=change-this-to-a-random-secret-key-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

# SMTP Configuration (for OTP emails)
# Leave empty if you don't want to configure email (OTPs will be logged to console)
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

**Important Configuration Notes:**

- **DATABASE_SERVER**: Use backslash for Windows instances: `localhost\SQLEXPRESS`
- **DATABASE_PASSWORD**: Replace with your actual database password
- **SECRET_KEY**: Generate a strong random string for production (e.g., use `python -c "import secrets; print(secrets.token_urlsafe(32))"`)
- **SMTP**: Optional for development. If not configured, OTP codes will be printed to console
- **CORS_ORIGINS**: Add your frontend URLs (comma-separated, no spaces)

### Step 5: Test Database Connection (Optional)

You can test the database connection by running a Python script:

```python
# test_db.py
from app.database import engine
from sqlalchemy import text

try:
    with engine.connect() as conn:
        result = conn.execute(text("SELECT 1"))
        print("Database connection successful!")
except Exception as e:
    print(f"Database connection failed: {e}")
```

Run: `python test_db.py`

## Running the Application

### Development Mode

Run with auto-reload (recommended for development):

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The `--reload` flag enables automatic restart on code changes.

### Production Mode

For production, use multiple workers:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Using a Process Manager (Production)

For production deployments, consider using:
- **systemd** (Linux)
- **Supervisor**
- **PM2** (with `pm2 start "uvicorn app.main:app --host 0.0.0.0 --port 8000"`)

## Verification

### 1. Check Server Status

Once the server starts, you should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

### 2. Access API Documentation

Open your browser and visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### 3. Test Health Endpoint

```bash
curl http://localhost:8000/health
```

Expected response:
```json
{"status": "healthy"}
```

### 4. Test Login Endpoint

```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier": "test@example.com", "password": "test123"}'
```

## Troubleshooting

### Database Connection Issues

**Error**: `[Microsoft][ODBC Driver Manager] Data source name not found`

**Solution**:
1. Verify ODBC Driver is installed
2. Check `DATABASE_DRIVER` in `.env` matches installed driver name
3. Windows: Check ODBC Data Source Administrator (64-bit vs 32-bit)

**Error**: `Login failed for user`

**Solution**:
1. Verify database credentials in `.env`
2. Check SQL Server authentication mode (SQL Server and Windows Authentication)
3. Ensure user has access to the database

**Error**: `Cannot open database`

**Solution**:
1. Verify database name is correct
2. Ensure database exists
3. Check user permissions

### Port Already in Use

**Error**: `Address already in use`

**Solution**:
1. Change port in command: `--port 8001`
2. Or kill the process using port 8000:
   ```bash
   # Windows
   netstat -ano | findstr :8000
   taskkill /PID <PID> /F
   
   # Linux/macOS
   lsof -ti:8000 | xargs kill -9
   ```

### Module Not Found Errors

**Error**: `ModuleNotFoundError: No module named 'app'`

**Solution**:
1. Ensure you're in the `fastapi_backend` directory
2. Verify virtual environment is activated
3. Reinstall dependencies: `pip install -r requirements.txt`

### CORS Issues

**Error**: CORS errors in browser console

**Solution**:
1. Add your frontend URL to `CORS_ORIGINS` in `.env`
2. Restart the server after changing `.env`
3. Check frontend is using correct API URL

### OTP Email Not Sending

**Symptoms**: OTP codes not received

**Solution**:
1. Check SMTP configuration in `.env`
2. For Gmail, use App Password (not regular password)
3. Check console logs - OTP codes are logged if SMTP fails
4. Verify firewall/network allows SMTP connections

### JWT Token Issues

**Error**: `Could not validate credentials`

**Solution**:
1. Check `SECRET_KEY` in `.env` matches the one used to create tokens
2. Verify token is being sent in `Authorization: Bearer <token>` header
3. Check token hasn't expired (default: 60 minutes)

## Next Steps

After successful installation:

1. **Test Authentication**: Try logging in via the frontend or API
2. **Configure Email**: Set up SMTP for production OTP emails
3. **Review Security**: Change default `SECRET_KEY` for production
4. **Database**: Ensure database schema matches expected structure
5. **Frontend Integration**: Update frontend API URLs if needed

## Additional Resources

- FastAPI Documentation: https://fastapi.tiangolo.com/
- SQLAlchemy Documentation: https://docs.sqlalchemy.org/
- Uvicorn Documentation: https://www.uvicorn.org/

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review server logs for detailed error messages
3. Verify all prerequisites are installed correctly
4. Check database connectivity separately
