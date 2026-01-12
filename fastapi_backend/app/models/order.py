from sqlalchemy import Column, Integer, String, DateTime, Numeric, SmallInteger, ForeignKey
from sqlalchemy.orm import relationship
from app.models.base import Base


class SalesOrderHeader(Base):
    __tablename__ = "SalesOrderHeader"
    
    salesorderid = Column("SalesOrderID", Integer, primary_key=True, autoincrement=True)
    customerid = Column("CustomerID", Integer, ForeignKey("Customer.CustomerID"), nullable=False)
    orderdate = Column("OrderDate", DateTime, nullable=False)
    duedate = Column("DueDate", DateTime, nullable=False)
    shipdate = Column("ShipDate", DateTime, nullable=True)
    freight = Column("Freight", Numeric(19, 4), nullable=False)
    salesordernumber = Column("SalesOrderNumber", String(25), nullable=False)
    totaldue = Column("TotalDue", Numeric(19, 4), nullable=False)
    modifieddate = Column("ModifiedDate", DateTime, nullable=False)
    orderstatus = Column("OrderStatus", String(25), nullable=False)
    
    # Relationships
    customer = relationship("Customer")
    details = relationship("SalesOrderDetail", back_populates="order")


class SalesOrderDetail(Base):
    __tablename__ = "SalesOrderDetail"
    
    salesorderdetailid = Column("SalesOrderDetailID", Integer, primary_key=True, autoincrement=True)
    salesorderid = Column("SalesOrderID", Integer, ForeignKey("SalesOrderHeader.SalesOrderID"), nullable=False)
    orderqty = Column("OrderQty", SmallInteger, nullable=True)
    productid = Column("ProductID", Integer, nullable=False)
    unitprice = Column("UnitPrice", Numeric(19, 4), nullable=True)
    modifieddate = Column("ModifiedDate", DateTime, nullable=False)
    
    # Relationships
    order = relationship("SalesOrderHeader", back_populates="details")
