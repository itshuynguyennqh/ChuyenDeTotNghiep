from sqlalchemy import Column, Integer, String, Date
from app.models.base import Base


class Employees(Base):
    __tablename__ = "employees"
    
    businessentityid = Column("BusinessEntityID", Integer, primary_key=True)
    fullname = Column("FullName", String(101), nullable=False)
    birthdate = Column("BirthDate", Date, nullable=False)
    groupname = Column("GroupName", String(50), nullable=False)
    departmentname = Column("DepartmentName", String(50), nullable=False)
    startdate = Column("StartDate", Date, nullable=False)
    enddate = Column("EndDate", Date, nullable=True)
    passwordsalt = Column("PasswordSalt", String(10), nullable=False)
    phonenumber = Column("PhoneNumber", String(25), nullable=False)
    emailaddress = Column("EmailAddress", String(50), nullable=True)
