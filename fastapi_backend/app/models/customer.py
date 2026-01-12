from sqlalchemy import Column, Integer, String, DateTime, Numeric, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.models.base import Base


class Customer(Base):
    __tablename__ = "Customer"
    
    customerid = Column("CustomerID", Integer, primary_key=True, autoincrement=True)
    firstname = Column("FirstName", String(50), nullable=True)
    middlename = Column("MiddleName", String(50), nullable=True)
    lastname = Column("LastName", String(50), nullable=True)
    
    # Relationships
    emails = relationship("CustomerEmailAddress", back_populates="customer")
    phones = relationship("CustomerPhone", back_populates="customer")
    addresses = relationship("CustomerAdress", back_populates="customer")
    password = relationship("CustomerPassword", back_populates="customer", uselist=False)
    rank = relationship("RankCustomer", back_populates="customer", uselist=False)


class CustomerEmailAddress(Base):
    __tablename__ = "CustomerEmailAddress"
    
    emailaddressid = Column("EmailAddressID", Integer, primary_key=True, autoincrement=True)
    customerid = Column("CustomerID", Integer, ForeignKey("Customer.CustomerID"), nullable=False)
    emailaddress = Column("EmailAddress", String(50), nullable=True)
    modifieddate = Column("ModifiedDate", DateTime, nullable=False)
    
    # Relationships
    customer = relationship("Customer", back_populates="emails")


class CustomerPhone(Base):
    __tablename__ = "CustomerPhone"
    __table_args__ = (
        {"schema": None}
    )
    
    customerid = Column("CustomerID", Integer, ForeignKey("Customer.CustomerID"), primary_key=True)
    phonenumber = Column("PhoneNumber", String(25), primary_key=True)
    phonenumbertypeid = Column("PhoneNumberTypeID", Integer, primary_key=True)
    modifieddate = Column("ModifiedDate", DateTime, nullable=False)
    
    # Relationships
    customer = relationship("Customer", back_populates="phones")


class CustomerAdress(Base):
    __tablename__ = "CustomerAdress"
    
    addressid = Column("AddressID", Integer, primary_key=True, autoincrement=True)
    customerid = Column("CustomerID", Integer, ForeignKey("Customer.CustomerID"), nullable=False)
    addressline1 = Column("AddressLine1", String(60), nullable=False)
    city = Column("City", String(30), nullable=True)
    postalcode = Column("PostalCode", String(15), nullable=True)
    spatiallocation = Column("SpatialLocation", String, nullable=True)
    modifieddate = Column("ModifiedDate", DateTime, nullable=False)
    
    # Relationships
    customer = relationship("Customer", back_populates="addresses")


class CustomerPassword(Base):
    __tablename__ = "CustomerPassWord"
    
    passwordsalt = Column("PasswordSalt", String(10), primary_key=True)
    customerid = Column("CustomerID", Integer, ForeignKey("Customer.CustomerID"), nullable=False)
    modifieddate = Column("ModifiedDate", DateTime, nullable=False)
    
    # Relationships
    customer = relationship("Customer", back_populates="password")


class RankCustomer(Base):
    __tablename__ = "RankCustomer"
    
    customerid = Column("CustomerID", Integer, ForeignKey("Customer.CustomerID"), primary_key=True)
    r = Column("R", Integer, nullable=True)
    f = Column("F", Numeric(10, 3), nullable=True)
    m = Column("M", Numeric(19, 4), nullable=True)
    final_score = Column("Final_score", Numeric(18, 4), nullable=True)
    rank_cus = Column("rank_cus", String(20), nullable=True)
    discount = Column("discount", Numeric, nullable=True)
    
    # Relationships
    customer = relationship("Customer", back_populates="rank")
