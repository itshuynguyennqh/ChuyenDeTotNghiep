from sqlalchemy import Column, Integer, String, Boolean, DateTime, Numeric, ForeignKey
from sqlalchemy.orm import relationship
from app.models.base import Base


class Voucher(Base):
    __tablename__ = "Voucher"
    
    voucherid = Column("VoucherID", Integer, primary_key=True, autoincrement=True)
    code = Column("Code", String(50), unique=True, nullable=False)
    discountpercent = Column("DiscountPercent", Integer, nullable=True)
    discountamount = Column("DiscountAmount", Numeric(10, 2), nullable=True)
    startdate = Column("StartDate", DateTime, nullable=False)
    enddate = Column("EndDate", DateTime, nullable=False)
    minorderamount = Column("MinOrderAmount", Numeric(10, 2), nullable=True)
    quantity = Column("Quantity", Integer, nullable=True)
    status = Column("Status", Boolean, nullable=True)
    
    # Relationships
    usages = relationship("VoucherUsage", back_populates="voucher")


class VoucherUsage(Base):
    __tablename__ = "VoucherUsage"
    __table_args__ = (
        {"schema": None}
    )
    
    voucherid = Column("VoucherID", Integer, ForeignKey("Voucher.VoucherID"), primary_key=True)
    customerid = Column("CustomerID", Integer, ForeignKey("Customer.CustomerID"), primary_key=True)
    orderid = Column("OrderID", Integer, nullable=True)
    useddate = Column("UsedDate", DateTime, nullable=True)
    
    # Relationships
    voucher = relationship("Voucher", back_populates="usages")
