from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from app.models.base import Base


class AuthUser(Base):
    __tablename__ = "auth_user"
    
    id = Column("id", Integer, primary_key=True, autoincrement=True)
    password = Column("password", String(128), nullable=False)
    last_login = Column("last_login", DateTime, nullable=True)
    is_superuser = Column("is_superuser", Boolean, nullable=False)
    username = Column("username", String(150), unique=True, nullable=False)
    first_name = Column("first_name", String(150), nullable=False)
    last_name = Column("last_name", String(150), nullable=False)
    email = Column("email", String(254), nullable=False)
    is_staff = Column("is_staff", Boolean, nullable=False)
    is_active = Column("is_active", Boolean, nullable=False)
    date_joined = Column("date_joined", DateTime, nullable=False)


class AuthGroup(Base):
    __tablename__ = "auth_group"
    
    id = Column("id", Integer, primary_key=True, autoincrement=True)
    name = Column("name", String(150), unique=True, nullable=False)


class AuthPermission(Base):
    __tablename__ = "auth_permission"
    
    id = Column("id", Integer, primary_key=True, autoincrement=True)
    name = Column("name", String(255), nullable=False)
    content_type_id = Column("content_type_id", Integer, ForeignKey("django_content_type.id"), nullable=False)
    codename = Column("codename", String(100), nullable=False)
