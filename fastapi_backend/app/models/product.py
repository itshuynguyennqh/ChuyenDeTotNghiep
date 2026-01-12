from sqlalchemy import Column, Integer, String, Boolean, DateTime, Numeric, SmallInteger, ForeignKey
from sqlalchemy.orm import relationship
from app.models.base import Base


class ProductCategory(Base):
    __tablename__ = "ProductCategory"
    
    productcategoryid = Column("ProductCategoryID", Integer, primary_key=True, autoincrement=True)
    name = Column("Name", String(50), nullable=False)
    modifieddate = Column("ModifiedDate", DateTime, nullable=False)
    
    # Relationships
    subcategories = relationship("ProductSubcategory", back_populates="category")


class ProductSubcategory(Base):
    __tablename__ = "ProductSubcategory"
    
    productsubcategoryid = Column("ProductSubcategoryID", Integer, primary_key=True, autoincrement=True)
    productcategoryid = Column("ProductCategoryID", Integer, ForeignKey("ProductCategory.ProductCategoryID"), nullable=False)
    name = Column("Name", String(50), nullable=False)
    modifieddate = Column("ModifiedDate", DateTime, nullable=False)
    
    # Relationships
    category = relationship("ProductCategory", back_populates="subcategories")
    products = relationship("Product", back_populates="subcategory")


class Product(Base):
    __tablename__ = "product"
    
    productid = Column("ProductID", Integer, primary_key=True, autoincrement=True)
    name = Column("Name", String(50), nullable=False)
    productnumber = Column("ProductNumber", String(25), nullable=True)
    finishedgoodsflag = Column("FinishedGoodsFlag", Boolean, nullable=False)
    color = Column("Color", String(15), nullable=True)
    reorderpoint = Column("ReorderPoint", SmallInteger, nullable=False)
    safetystocklevel = Column("SafetyStockLevel", SmallInteger, nullable=False)
    standardcost = Column("StandardCost", Numeric(19, 4), nullable=False)
    listprice = Column("ListPrice", Numeric(19, 4), nullable=False)
    size = Column("Size", String(5), nullable=True)
    daystomanufacture = Column("DaysToManufacture", Integer, nullable=False)
    productline = Column("ProductLine", String(2), nullable=True)
    class_field = Column("Class", String(2), nullable=True)
    style = Column("Style", String(2), nullable=True)
    productsubcategoryid = Column("ProductSubcategoryID", Integer, ForeignKey("ProductSubcategory.ProductSubcategoryID"), nullable=True)
    sellstartdate = Column("SellStartDate", DateTime, nullable=False)
    sellenddate = Column("SellEndDate", DateTime, nullable=True)
    modifieddate = Column("ModifiedDate", DateTime, nullable=False)
    
    # Relationships
    subcategory = relationship("ProductSubcategory", back_populates="products")
    reviews = relationship("ProductReview", back_populates="product")


class ProductDescription(Base):
    __tablename__ = "ProductDescription"
    
    productdescriptionid = Column("ProductDescriptionID", Integer, primary_key=True, autoincrement=True)
    description = Column("Description", String(400), nullable=True)
    modifieddate = Column("ModifiedDate", DateTime, nullable=False)


class ProductInventory(Base):
    __tablename__ = "ProductInventory"
    __table_args__ = (
        {"schema": None}
    )
    
    productid = Column("ProductID", Integer, ForeignKey("product.ProductID"), primary_key=True)
    locationid = Column("LocationID", SmallInteger, primary_key=True)
    shelf = Column("Shelf", String(10), nullable=True)
    bin = Column("Bin", String(10), nullable=True)
    quantity = Column("Quantity", Integer, nullable=False)
    modifieddate = Column("ModifiedDate", DateTime, nullable=False)


class ProductReview(Base):
    __tablename__ = "ProductReview"
    
    productreviewid = Column("ProductReviewID", Integer, primary_key=True, autoincrement=True)
    productid = Column("ProductID", Integer, ForeignKey("product.ProductID"), nullable=False)
    reviewername = Column("ReviewerName", String(50), nullable=True)
    reviewdate = Column("ReviewDate", DateTime, nullable=True)
    emailaddress = Column("EmailAddress", String(50), nullable=True)
    rating = Column("Rating", Integer, nullable=True)
    comments = Column("Comments", String(3850), nullable=True)
    modifieddate = Column("ModifiedDate", DateTime, nullable=False)
    
    # Relationships
    product = relationship("Product", back_populates="reviews")
