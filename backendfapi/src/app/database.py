from sqlalchemy import create_engine, event
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import urllib.parse
import pyodbc

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

SQLALCHEMY_DATABASE_URL = f"mssql+pyodbc:///?odbc_connect={params}"

# Configure engine with Unicode support for SQL Server
# SQLAlchemy's String type maps to NVARCHAR for SQL Server, which supports Unicode
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    pool_pre_ping=True,
    echo=False
)

# Event listener để set encoding UTF-8 cho mỗi connection
@event.listens_for(engine, "connect")
def set_utf8_encoding(dbapi_conn, connection_record):
    """
    Set UTF-8 encoding cho pyodbc connection.
    PyODBC mặc định dùng UTF-16LE, nhưng SQL Server NVARCHAR hoạt động tốt với UTF-8.
    Đã xóa hết dữ liệu cũ bị lỗi, bây giờ bật lại để dữ liệu mới được lưu đúng UTF-8.
    """
    try:
        # PyODBC: setencoding('utf-8') để dùng UTF-8 thay vì UTF-16LE mặc định
        # Điều này đảm bảo string được encode/decode đúng với SQL Server NVARCHAR
        dbapi_conn.setencoding('utf-8')
        dbapi_conn.setdecoding(pyodbc.SQL_CHAR, encoding='utf-8')
        dbapi_conn.setdecoding(pyodbc.SQL_WCHAR, encoding='utf-8')
    except Exception as e:
        import logging
        logging.warning(f"Could not set UTF-8 encoding for database connection: {e}")

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()