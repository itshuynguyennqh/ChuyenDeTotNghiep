GO
/****** Object:  Database [final_project_getout]    Script Date: 12/25/2025 1:31:59 AM ******/
CREATE DATABASE [final_project_getout]
 CONTAINMENT = NONE
 ON  PRIMARY
( NAME = N'Final_Project_Getout1', FILENAME = N'C:\Program Files\Microsoft SQL Server\MSSQL17.MSSQLSERVER\MSSQL\DATA\Final_Project_Getout1.mdf' , SIZE = 73728KB , MAXSIZE = UNLIMITED, FILEGROWTH = 65536KB )
 LOG ON
( NAME = N'Final_Project_Getout1_log', FILENAME = N'C:\Program Files\Microsoft SQL Server\MSSQL17.MSSQLSERVER\MSSQL\DATA\Final_Project_Getout1_log.ldf' , SIZE = 73728KB , MAXSIZE = 2048GB , FILEGROWTH = 65536KB )
 WITH CATALOG_COLLATION = DATABASE_DEFAULT, LEDGER = OFF
GO
ALTER DATABASE [final_project_getout] SET COMPATIBILITY_LEVEL = 160
GO
IF (1 = FULLTEXTSERVICEPROPERTY('IsFullTextInstalled'))
begin
EXEC [final_project_getout].[dbo].[sp_fulltext_database] @action = 'enable'
end
GO
ALTER DATABASE [final_project_getout] SET ANSI_NULL_DEFAULT OFF
GO
ALTER DATABASE [final_project_getout] SET ANSI_NULLS OFF
GO
ALTER DATABASE [final_project_getout] SET ANSI_PADDING OFF
GO
ALTER DATABASE [final_project_getout] SET ANSI_WARNINGS OFF
GO
ALTER DATABASE [final_project_getout] SET ARITHABORT OFF
GO
ALTER DATABASE [final_project_getout] SET AUTO_CLOSE OFF
GO
ALTER DATABASE [final_project_getout] SET AUTO_SHRINK OFF
GO
ALTER DATABASE [final_project_getout] SET AUTO_UPDATE_STATISTICS ON
GO
ALTER DATABASE [final_project_getout] SET CURSOR_CLOSE_ON_COMMIT OFF
GO
ALTER DATABASE [final_project_getout] SET CURSOR_DEFAULT  GLOBAL
GO
ALTER DATABASE [final_project_getout] SET CONCAT_NULL_YIELDS_NULL OFF
GO
ALTER DATABASE [final_project_getout] SET NUMERIC_ROUNDABORT OFF
GO
ALTER DATABASE [final_project_getout] SET QUOTED_IDENTIFIER OFF
GO
ALTER DATABASE [final_project_getout] SET RECURSIVE_TRIGGERS OFF
GO
ALTER DATABASE [final_project_getout] SET  DISABLE_BROKER
GO
ALTER DATABASE [final_project_getout] SET AUTO_UPDATE_STATISTICS_ASYNC OFF
GO
ALTER DATABASE [final_project_getout] SET DATE_CORRELATION_OPTIMIZATION OFF
GO
ALTER DATABASE [final_project_getout] SET TRUSTWORTHY OFF
GO
ALTER DATABASE [final_project_getout] SET ALLOW_SNAPSHOT_ISOLATION OFF
GO
ALTER DATABASE [final_project_getout] SET PARAMETERIZATION SIMPLE
GO
ALTER DATABASE [final_project_getout] SET READ_COMMITTED_SNAPSHOT OFF
GO
ALTER DATABASE [final_project_getout] SET HONOR_BROKER_PRIORITY OFF
GO
ALTER DATABASE [final_project_getout] SET RECOVERY FULL
GO
ALTER DATABASE [final_project_getout] SET  MULTI_USER
GO
ALTER DATABASE [final_project_getout] SET PAGE_VERIFY CHECKSUM
GO
ALTER DATABASE [final_project_getout] SET DB_CHAINING OFF
GO
ALTER DATABASE [final_project_getout] SET FILESTREAM( NON_TRANSACTED_ACCESS = OFF )
GO
ALTER DATABASE [final_project_getout] SET TARGET_RECOVERY_TIME = 60 SECONDS
GO
ALTER DATABASE [final_project_getout] SET DELAYED_DURABILITY = DISABLED
GO
ALTER DATABASE [final_project_getout] SET ACCELERATED_DATABASE_RECOVERY = OFF
GO
ALTER DATABASE [final_project_getout] SET OPTIMIZED_LOCKING = OFF
GO
ALTER DATABASE [final_project_getout] SET QUERY_STORE = ON
GO
ALTER DATABASE [final_project_getout] SET QUERY_STORE (OPERATION_MODE = READ_WRITE, CLEANUP_POLICY = (STALE_QUERY_THRESHOLD_DAYS = 30), DATA_FLUSH_INTERVAL_SECONDS = 900, INTERVAL_LENGTH_MINUTES = 60, MAX_STORAGE_SIZE_MB = 1000, QUERY_CAPTURE_MODE = AUTO, SIZE_BASED_CLEANUP_MODE = AUTO, MAX_PLANS_PER_QUERY = 200, WAIT_STATS_CAPTURE_MODE = ON)
GO
USE [final_project_getout]
GO
/****** Object:  User [sa1]    Script Date: 12/25/2025 1:31:59 AM ******/
CREATE USER [sa1] FOR LOGIN [sa1] WITH DEFAULT_SCHEMA=[dbo]
GO
/****** Object:  User [onlyunion]    Script Date: 12/25/2025 1:31:59 AM ******/
CREATE USER [onlyunion] WITHOUT LOGIN WITH DEFAULT_SCHEMA=[dbo]
GO
ALTER ROLE [db_owner] ADD MEMBER [sa1]
GO
/****** Object:  Table [dbo].[Cart]    Script Date: 12/25/2025 1:31:59 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Cart](
	[CartID] [int] IDENTITY(1,1) NOT NULL,
	[CustomerID] [int] NOT NULL,
	[CreatedDate] [datetime] NULL,
	[ModifiedDate] [datetime] NULL,
	[Status] [nvarchar](20) NULL,
	[IsCheckedOut] [bit] NOT NULL,
PRIMARY KEY CLUSTERED
(
	[CartID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[CartItem]    Script Date: 12/25/2025 1:31:59 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[CartItem](
	[CartItemID] [int] IDENTITY(1,1) NOT NULL,
	[CartID] [int] NOT NULL,
	[ProductID] [int] NOT NULL,
	[Quantity] [int] NOT NULL,
	[UnitPrice] [decimal](10, 2) NOT NULL,
	[Subtotal]  AS ([Quantity]*[UnitPrice]) PERSISTED,
	[DateAdded] [datetime] NULL,
	[DateUpdated] [datetime] NULL,
PRIMARY KEY CLUSTERED
(
	[CartItemID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Customer]    Script Date: 12/25/2025 1:31:59 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Customer](
	[CustomerID] [int] IDENTITY(1,1) NOT FOR REPLICATION NOT NULL,
	[FirstName] [nvarchar](50) NULL,
	[MiddleName] [nvarchar](50) NULL,
	[LastName] [nvarchar](50) NULL,
 CONSTRAINT [PK_Customer] PRIMARY KEY CLUSTERED
(
	[CustomerID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[CustomerAdress]    Script Date: 12/25/2025 1:31:59 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[CustomerAdress](
	[CustomerID] [int] NOT NULL,
	[AddressID] [int] IDENTITY(1,1) NOT FOR REPLICATION NOT NULL,
	[AddressLine1] [nvarchar](60) NOT NULL,
	[City] [nvarchar](30) NULL,
	[ModifiedDate] [datetime] NOT NULL,
	[PostalCode] [nvarchar](15) NULL,
	[SpatialLocation] [geography] NULL,
 CONSTRAINT [PK_CustomerAdress] PRIMARY KEY CLUSTERED
(
	[AddressID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[CustomerEmailAddress]    Script Date: 12/25/2025 1:31:59 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[CustomerEmailAddress](
	[CustomerID] [int] NOT NULL,
	[EmailAddress] [nvarchar](50) NULL,
	[EmailAddressID] [int] IDENTITY(1,1) NOT FOR REPLICATION NOT NULL,
	[ModifiedDate] [datetime] NOT NULL,
 CONSTRAINT [PK_CustomerEmailAddress] PRIMARY KEY CLUSTERED
(
	[EmailAddressID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[CustomerPassWord]    Script Date: 12/25/2025 1:31:59 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[CustomerPassWord](
	[CustomerID] [int] NOT NULL,
	[PasswordSalt] [varchar](10) NOT NULL,
	[ModifiedDate] [datetime] NOT NULL,
 CONSTRAINT [PK_CustomerPassWord] PRIMARY KEY CLUSTERED
(
	[PasswordSalt] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[CustomerPhone]    Script Date: 12/25/2025 1:31:59 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[CustomerPhone](
	[CustomerID] [int] NOT NULL,
	[PhoneNumber] [nvarchar](25) NOT NULL,
	[PhoneNumberTypeID] [int] NOT NULL,
	[ModifiedDate] [datetime] NOT NULL,
 CONSTRAINT [PK_CustomerPhone] PRIMARY KEY CLUSTERED
(
	[CustomerID] ASC,
	[PhoneNumber] ASC,
	[PhoneNumberTypeID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[employees]    Script Date: 12/25/2025 1:31:59 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[employees](
	[BusinessEntityID] [int] NOT NULL,
	[FullName] [nvarchar](101) NOT NULL,
	[BirthDate] [date] NOT NULL,
	[GroupName] [nvarchar](50) NOT NULL,
	[DepartmentName] [nvarchar](50) NOT NULL,
	[StartDate] [date] NOT NULL,
	[EndDate] [date] NULL,
	[PasswordSalt] [varchar](10) NOT NULL,
	[PhoneNumber] [nvarchar](25) NOT NULL,
	[EmailAddress] [nvarchar](50) NULL,
 CONSTRAINT [PK_employees] PRIMARY KEY CLUSTERED
(
	[BusinessEntityID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Location]    Script Date: 12/25/2025 1:31:59 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Location](
	[LocationID] [smallint] IDENTITY(1,1) NOT NULL,
	[Name] [nvarchar](50) NULL,
	[Availability] [int] NULL,
	[ModifiedDate] [datetime] NOT NULL,
 CONSTRAINT [PK_Localtion] PRIMARY KEY CLUSTERED
(
	[LocationID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[product]    Script Date: 12/25/2025 1:31:59 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[product](
	[ProductID] [int] IDENTITY(1,1) NOT NULL,
	[Name] [nvarchar](50) NOT NULL,
	[ProductNumber] [nvarchar](25) NULL,
	[FinishedGoodsFlag] [bit] NOT NULL,
	[Color] [nvarchar](15) NULL,
	[ReorderPoint] [smallint] NOT NULL,
	[SafetyStockLevel] [smallint] NOT NULL,
	[StandardCost] [money] NOT NULL,
	[ListPrice] [money] NOT NULL,
	[Size] [nvarchar](5) NULL,
	[DaysToManufacture] [int] NOT NULL,
	[ProductLine] [nchar](2) NULL,
	[Class] [nchar](2) NULL,
	[Style] [nchar](2) NULL,
	[ProductSubcategoryID] [int] NULL,
	[SellStartDate] [datetime] NOT NULL,
	[SellEndDate] [datetime] NULL,
	[ModifiedDate] [datetime] NOT NULL,
 CONSTRAINT [PK_product] PRIMARY KEY CLUSTERED
(
	[ProductID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ProductCategory]    Script Date: 12/25/2025 1:31:59 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ProductCategory](
	[ProductCategoryID] [int] IDENTITY(1,1) NOT NULL,
	[Name] [nvarchar](50) NOT NULL,
	[ModifiedDate] [datetime] NOT NULL,
 CONSTRAINT [PK_ProductCategory] PRIMARY KEY CLUSTERED
(
	[ProductCategoryID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ProductDescription]    Script Date: 12/25/2025 1:31:59 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ProductDescription](
	[ProductDescriptionID] [int] IDENTITY(1,1) NOT NULL,
	[Description] [nvarchar](400) NULL,
	[ModifiedDate] [datetime] NOT NULL,
 CONSTRAINT [PK_ProductDescription] PRIMARY KEY CLUSTERED
(
	[ProductDescriptionID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ProductInventory]    Script Date: 12/25/2025 1:31:59 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ProductInventory](
	[ProductID] [int] NOT NULL,
	[LocationID] [smallint] NOT NULL,
	[Shelf] [nchar](10) NULL,
	[Bin] [nchar](10) NULL,
	[Quantity] [int] NOT NULL,
	[ModifiedDate] [datetime] NOT NULL,
 CONSTRAINT [PK_ProductInventory] PRIMARY KEY CLUSTERED
(
	[ProductID] ASC,
	[LocationID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ProductReview]    Script Date: 12/25/2025 1:31:59 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ProductReview](
	[ProductReviewID] [int] IDENTITY(1,1) NOT NULL,
	[ProductID] [int] NOT NULL,
	[ReviewerName] [nvarchar](50) NULL,
	[ReviewDate] [datetime] NULL,
	[EmailAddress] [nvarchar](50) NULL,
	[Rating] [int] NULL,
	[Comments] [nvarchar](3850) NULL,
	[ModifiedDate] [datetime] NOT NULL,
 CONSTRAINT [PK_ProductReview] PRIMARY KEY CLUSTERED
(
	[ProductReviewID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ProductSubcategory]    Script Date: 12/25/2025 1:31:59 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ProductSubcategory](
	[ProductSubcategoryID] [int] IDENTITY(1,1) NOT NULL,
	[ProductCategoryID] [int] NOT NULL,
	[Name] [nvarchar](50) NOT NULL,
	[ModifiedDate] [datetime] NOT NULL,
 CONSTRAINT [PK_ProductSubcategory] PRIMARY KEY CLUSTERED
(
	[ProductSubcategoryID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[RankCustomer]    Script Date: 12/25/2025 1:31:59 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[RankCustomer](
	[CustomerID] [int] NOT NULL,
	[R] [int] NULL,
	[F] [decimal](10, 3) NULL,
	[M] [money] NULL,
	[Final_score] [numeric](18, 4) NULL,
	[rank_cus] [nvarchar](20) NULL,
	[discount] [float] NULL,
 CONSTRAINT [FK_RankCustomer] PRIMARY KEY CLUSTERED
(
	[CustomerID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[SalesOrderDetail]    Script Date: 12/25/2025 1:31:59 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[SalesOrderDetail](
	[SalesOrderID] [int] NOT NULL,
	[SalesOrderDetailID] [int] IDENTITY(1,1) NOT NULL,
	[OrderQty] [smallint] NULL,
	[ProductID] [int] NOT NULL,
	[UnitPrice] [money] NULL,
	[ModifiedDate] [datetime] NOT NULL,
 CONSTRAINT [PK_SalesOrderDetail] PRIMARY KEY CLUSTERED
(
	[SalesOrderID] ASC,
	[SalesOrderDetailID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[SalesOrderHeader]    Script Date: 12/25/2025 1:31:59 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[SalesOrderHeader](
	[CustomerID] [int] NOT NULL,
	[SalesOrderID] [int] IDENTITY(1,1) NOT NULL,
	[OrderDate] [datetime] NOT NULL,
	[DueDate] [datetime] NOT NULL,
	[ShipDate] [datetime] NULL,
	[Freight] [money] NOT NULL,
	[SalesOrderNumber] [nvarchar](25) NOT NULL,
	[TotalDue] [money] NOT NULL,
	[ModifiedDate] [datetime] NOT NULL,
	[OrderStatus] [nvarchar](20) NOT NULL,
 CONSTRAINT [PK_SalesOrderHeader] PRIMARY KEY CLUSTERED
(
	[SalesOrderID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Voucher]    Script Date: 12/25/2025 1:31:59 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Voucher](
	[VoucherID] [int] IDENTITY(1,1) NOT NULL,
	[Code] [nvarchar](50) NOT NULL,
	[DiscountPercent] [int] NULL,
	[DiscountAmount] [decimal](10, 2) NULL,
	[StartDate] [datetime] NOT NULL,
	[EndDate] [datetime] NOT NULL,
	[MinOrderAmount] [decimal](10, 2) NULL,
	[Quantity] [int] NULL,
	[Status] [bit] NULL,
PRIMARY KEY CLUSTERED
(
	[VoucherID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
UNIQUE NONCLUSTERED
(
	[Code] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[VoucherUsage]    Script Date: 12/25/2025 1:31:59 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[VoucherUsage](
	[VoucherID] [int] NOT NULL,
	[CustomerID] [int] NOT NULL,
	[OrderID] [int] NULL,
	[UsedDate] [datetime] NULL,
 CONSTRAINT [PK_VoucherUsage] PRIMARY KEY CLUSTERED
(
	[VoucherID] ASC,
	[CustomerID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
ALTER TABLE [dbo].[Cart] ADD  DEFAULT (getdate()) FOR [CreatedDate]
GO
ALTER TABLE [dbo].[Cart] ADD  DEFAULT (getdate()) FOR [ModifiedDate]
GO
ALTER TABLE [dbo].[Cart] ADD  DEFAULT ('Active') FOR [Status]
GO
ALTER TABLE [dbo].[Cart] ADD  DEFAULT ((0)) FOR [IsCheckedOut]
GO
ALTER TABLE [dbo].[CartItem] ADD  DEFAULT ((1)) FOR [Quantity]
GO
ALTER TABLE [dbo].[CartItem] ADD  DEFAULT (getdate()) FOR [DateAdded]
GO
ALTER TABLE [dbo].[CartItem] ADD  DEFAULT (getdate()) FOR [DateUpdated]
GO
ALTER TABLE [dbo].[CustomerAdress] ADD  CONSTRAINT [DF_CustomerAdress_ModifiedDate]  DEFAULT (getdate()) FOR [ModifiedDate]
GO
ALTER TABLE [dbo].[CustomerEmailAddress] ADD  CONSTRAINT [DF_CustomerEmailAddress_ModifiedDate]  DEFAULT (getdate()) FOR [ModifiedDate]
GO
ALTER TABLE [dbo].[CustomerPassWord] ADD  CONSTRAINT [DF_CustomerPassWord_ModifiedDate]  DEFAULT (getdate()) FOR [ModifiedDate]
GO
ALTER TABLE [dbo].[CustomerPhone] ADD  CONSTRAINT [DF_CustomerPhone_ModifiedDate]  DEFAULT (getdate()) FOR [ModifiedDate]
GO
ALTER TABLE [dbo].[Location] ADD  CONSTRAINT [DF_Location_ModifiedDate]  DEFAULT (getdate()) FOR [ModifiedDate]
GO
ALTER TABLE [dbo].[product] ADD  CONSTRAINT [DF_product_FinishedGoodsFlag]  DEFAULT ((1)) FOR [FinishedGoodsFlag]
GO
ALTER TABLE [dbo].[product] ADD  CONSTRAINT [DF_product_ReorderPoint]  DEFAULT ((120)) FOR [ReorderPoint]
GO
ALTER TABLE [dbo].[product] ADD  CONSTRAINT [DF_product_SafetyStockLevel]  DEFAULT ((100)) FOR [SafetyStockLevel]
GO
ALTER TABLE [dbo].[product] ADD  CONSTRAINT [DF_product_SellStartDate]  DEFAULT (getdate()) FOR [SellStartDate]
GO
ALTER TABLE [dbo].[product] ADD  CONSTRAINT [DF_product_ModifiedDate]  DEFAULT (getdate()) FOR [ModifiedDate]
GO
ALTER TABLE [dbo].[ProductCategory] ADD  CONSTRAINT [DF_ProductCategory_ModifiedDate]  DEFAULT (getdate()) FOR [ModifiedDate]
GO
ALTER TABLE [dbo].[ProductDescription] ADD  CONSTRAINT [DF_ProductDescription_ModifiedDate]  DEFAULT (getdate()) FOR [ModifiedDate]
GO
ALTER TABLE [dbo].[ProductInventory] ADD  CONSTRAINT [DF_ProductInventory_ModifiedDate]  DEFAULT (getdate()) FOR [ModifiedDate]
GO
ALTER TABLE [dbo].[ProductReview] ADD  CONSTRAINT [DF_ProductReview_ModifiedDate]  DEFAULT (getdate()) FOR [ModifiedDate]
GO
ALTER TABLE [dbo].[ProductSubcategory] ADD  CONSTRAINT [DF_ProductSubcategory_ModifiedDate]  DEFAULT (getdate()) FOR [ModifiedDate]
GO
ALTER TABLE [dbo].[SalesOrderDetail] ADD  CONSTRAINT [DF_SalesOrderDetail_ModifiedDate]  DEFAULT (getdate()) FOR [ModifiedDate]
GO
ALTER TABLE [dbo].[SalesOrderHeader] ADD  CONSTRAINT [DF_SalesOrderHeader_ModifiedDate]  DEFAULT (getdate()) FOR [ModifiedDate]
GO
ALTER TABLE [dbo].[SalesOrderHeader] ADD  DEFAULT (N'Pending') FOR [OrderStatus]
GO
ALTER TABLE [dbo].[Voucher] ADD  DEFAULT ((1)) FOR [Status]
GO
ALTER TABLE [dbo].[VoucherUsage] ADD  DEFAULT (getdate()) FOR [UsedDate]
GO
ALTER TABLE [dbo].[Cart]  WITH CHECK ADD  CONSTRAINT [FK_Cart_Customer] FOREIGN KEY([CustomerID])
REFERENCES [dbo].[Customer] ([CustomerID])
GO
ALTER TABLE [dbo].[Cart] CHECK CONSTRAINT [FK_Cart_Customer]
GO
ALTER TABLE [dbo].[CartItem]  WITH CHECK ADD  CONSTRAINT [FK_CartItem_Cart] FOREIGN KEY([CartID])
REFERENCES [dbo].[Cart] ([CartID])
GO
ALTER TABLE [dbo].[CartItem] CHECK CONSTRAINT [FK_CartItem_Cart]
GO
ALTER TABLE [dbo].[CartItem]  WITH CHECK ADD  CONSTRAINT [FK_CartItem_Product] FOREIGN KEY([ProductID])
REFERENCES [dbo].[product] ([ProductID])
GO
ALTER TABLE [dbo].[CartItem] CHECK CONSTRAINT [FK_CartItem_Product]
GO
ALTER TABLE [dbo].[CustomerAdress]  WITH CHECK ADD  CONSTRAINT [PK_Customer_CustomerAdress] FOREIGN KEY([CustomerID])
REFERENCES [dbo].[Customer] ([CustomerID])
GO
ALTER TABLE [dbo].[CustomerAdress] CHECK CONSTRAINT [PK_Customer_CustomerAdress]
GO
ALTER TABLE [dbo].[CustomerEmailAddress]  WITH CHECK ADD  CONSTRAINT [PK_Customer_CustomerEmailAddress] FOREIGN KEY([CustomerID])
REFERENCES [dbo].[Customer] ([CustomerID])
GO
ALTER TABLE [dbo].[CustomerEmailAddress] CHECK CONSTRAINT [PK_Customer_CustomerEmailAddress]
GO
ALTER TABLE [dbo].[CustomerPassWord]  WITH CHECK ADD  CONSTRAINT [PK_Customer_CustomerPassWord] FOREIGN KEY([CustomerID])
REFERENCES [dbo].[Customer] ([CustomerID])
GO
ALTER TABLE [dbo].[CustomerPassWord] CHECK CONSTRAINT [PK_Customer_CustomerPassWord]
GO
ALTER TABLE [dbo].[CustomerPhone]  WITH CHECK ADD  CONSTRAINT [PK_Customer_CustomerPhone] FOREIGN KEY([CustomerID])
REFERENCES [dbo].[Customer] ([CustomerID])
GO
ALTER TABLE [dbo].[CustomerPhone] CHECK CONSTRAINT [PK_Customer_CustomerPhone]
GO
ALTER TABLE [dbo].[product]  WITH CHECK ADD  CONSTRAINT [PK_Product_ProductSubcategory] FOREIGN KEY([ProductSubcategoryID])
REFERENCES [dbo].[ProductSubcategory] ([ProductSubcategoryID])
GO
ALTER TABLE [dbo].[product] CHECK CONSTRAINT [PK_Product_ProductSubcategory]
GO
ALTER TABLE [dbo].[ProductInventory]  WITH CHECK ADD  CONSTRAINT [FK_Location_ProductInventory] FOREIGN KEY([LocationID])
REFERENCES [dbo].[Location] ([LocationID])
GO
ALTER TABLE [dbo].[ProductInventory] CHECK CONSTRAINT [FK_Location_ProductInventory]
GO
ALTER TABLE [dbo].[ProductInventory]  WITH CHECK ADD  CONSTRAINT [PK_Product_ProductInventory] FOREIGN KEY([ProductID])
REFERENCES [dbo].[product] ([ProductID])
GO
ALTER TABLE [dbo].[ProductInventory] CHECK CONSTRAINT [PK_Product_ProductInventory]
GO
ALTER TABLE [dbo].[ProductReview]  WITH CHECK ADD  CONSTRAINT [FK_Product_ProductReview] FOREIGN KEY([ProductID])
REFERENCES [dbo].[product] ([ProductID])
GO
ALTER TABLE [dbo].[ProductReview] CHECK CONSTRAINT [FK_Product_ProductReview]
GO
ALTER TABLE [dbo].[ProductSubcategory]  WITH CHECK ADD  CONSTRAINT [PK_ProductSubcategory_ProductCategory] FOREIGN KEY([ProductCategoryID])
REFERENCES [dbo].[ProductCategory] ([ProductCategoryID])
GO
ALTER TABLE [dbo].[ProductSubcategory] CHECK CONSTRAINT [PK_ProductSubcategory_ProductCategory]
GO
ALTER TABLE [dbo].[RankCustomer]  WITH CHECK ADD  CONSTRAINT [FK_RankCustomer_Customer] FOREIGN KEY([CustomerID])
REFERENCES [dbo].[Customer] ([CustomerID])
GO
ALTER TABLE [dbo].[RankCustomer] CHECK CONSTRAINT [FK_RankCustomer_Customer]
GO
ALTER TABLE [dbo].[SalesOrderDetail]  WITH CHECK ADD  CONSTRAINT [FK_SalesOrderHeader_SalesOrderDetail] FOREIGN KEY([SalesOrderID])
REFERENCES [dbo].[SalesOrderHeader] ([SalesOrderID])
GO
ALTER TABLE [dbo].[SalesOrderDetail] CHECK CONSTRAINT [FK_SalesOrderHeader_SalesOrderDetail]
GO
ALTER TABLE [dbo].[SalesOrderHeader]  WITH CHECK ADD  CONSTRAINT [FK_Customer_SalesOrderDetail] FOREIGN KEY([CustomerID])
REFERENCES [dbo].[Customer] ([CustomerID])
GO
ALTER TABLE [dbo].[SalesOrderHeader] CHECK CONSTRAINT [FK_Customer_SalesOrderDetail]
GO
ALTER TABLE [dbo].[VoucherUsage]  WITH CHECK ADD  CONSTRAINT [FK_VoucherUsage_Customer] FOREIGN KEY([CustomerID])
REFERENCES [dbo].[Customer] ([CustomerID])
GO
ALTER TABLE [dbo].[VoucherUsage] CHECK CONSTRAINT [FK_VoucherUsage_Customer]
GO
ALTER TABLE [dbo].[VoucherUsage]  WITH CHECK ADD  CONSTRAINT [FK_VoucherUsage_Voucher] FOREIGN KEY([VoucherID])
REFERENCES [dbo].[Voucher] ([VoucherID])
GO
ALTER TABLE [dbo].[VoucherUsage] CHECK CONSTRAINT [FK_VoucherUsage_Voucher]
GO
ALTER TABLE [dbo].[SalesOrderHeader]  WITH CHECK ADD  CONSTRAINT [CK_SalesOrderHeader_OrderStatus] CHECK  (([OrderStatus]='Cancelled' OR [OrderStatus]='Completed' OR [OrderStatus]='Shipping' OR [OrderStatus]='Confirm' OR [OrderStatus]='Pending'))
GO
ALTER TABLE [dbo].[SalesOrderHeader] CHECK CONSTRAINT [CK_SalesOrderHeader_OrderStatus]
GO