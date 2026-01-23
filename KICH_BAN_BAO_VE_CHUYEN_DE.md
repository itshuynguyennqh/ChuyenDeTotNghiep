# KỊCH BẢN BẢO VỆ CHUYÊN ĐỀ TỐT NGHIỆP
## HỆ THỐNG THƯƠNG MẠI ĐIỆN TỬ BIKE GO

---

## PHẦN 1: GIỚI THIỆU VÀ TỔNG QUAN (5 phút)

### 1.1. Lời mở đầu
Kính thưa Hội đồng chấm thi, thưa các thầy cô và các bạn!

Em xin được trình bày đề tài tốt nghiệp của em: **"Xây dựng hệ thống thương mại điện tử BikeGo - Bán và cho thuê xe đạp"**.

### 1.2. Lý do chọn đề tài
- **Nhu cầu thực tế**: Thị trường xe đạp tại Việt Nam đang phát triển mạnh, đặc biệt là xu hướng sử dụng xe đạp cho mục đích thể thao, giải trí và bảo vệ môi trường
- **Tính ứng dụng cao**: Hệ thống giải quyết bài toán quản lý bán hàng và cho thuê xe đạp một cách toàn diện
- **Tính mới**: Tích hợp cả hai mô hình kinh doanh (bán và cho thuê) trong một hệ thống thống nhất
- **Cơ hội học hỏi**: Áp dụng các công nghệ web hiện đại và best practices trong phát triển phần mềm

### 1.3. Mục tiêu nghiên cứu
1. **Mục tiêu chính**: Xây dựng hệ thống thương mại điện tử hoàn chỉnh cho cửa hàng xe đạp với đầy đủ tính năng bán và cho thuê
2. **Mục tiêu cụ thể**:
   - Phát triển giao diện người dùng thân thiện, responsive
   - Xây dựng hệ thống quản lý kho hàng đa chi nhánh
   - Triển khai hệ thống xếp hạng khách hàng (RFM Analysis)
   - Xây dựng admin panel toàn diện cho quản trị viên
   - Tích hợp hệ thống voucher và khuyến mãi
   - Hỗ trợ cả khách hàng đã đăng ký và khách vãng lai

### 1.4. Phạm vi nghiên cứu
- **Frontend**: Ứng dụng web responsive sử dụng React
- **Backend**: RESTful API sử dụng FastAPI
- **Database**: SQL Server với stored procedures
- **Chức năng**: Bán hàng, cho thuê, quản lý kho, quản lý đơn hàng, quản lý khách hàng

---

## PHẦN 2: KIẾN TRÚC VÀ CÔNG NGHỆ HỆ THỐNG (8 phút)

### 2.1. Kiến trúc tổng thể

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT BROWSER                      │
│              (React Application - Port 3000)            │
│  - Material-UI Components                              │
│  - Responsive Design                                    │
│  - Client-side Routing                                  │
└────────────────────┬──────────────────────────────────┘
                     │ HTTP/REST API
                     │ (JWT Authentication)
┌────────────────────▼──────────────────────────────────┐
│              FASTAPI BACKEND (Port 8001)               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐           │
│  │   Auth   │  │  Admin   │  │  Store   │  ...       │
│  │  Routes  │  │  Routes  │  │  Routes  │           │
│  └──────────┘  └──────────┘  └──────────┘           │
│         │             │             │                 │
│         └─────────────┴─────────────┘                 │
│              SQLAlchemy ORM                             │
└────────────────────┬──────────────────────────────────┘
                     │ ODBC Connection
┌────────────────────▼──────────────────────────────────┐
│              SQL SERVER DATABASE                        │
│         (final_project_getout)                          │
│  ┌──────────────┐  ┌──────────────┐                  │
│  │   Tables     │  │   Stored     │                  │
│  │   & Views    │  │  Procedures  │                  │
│  └──────────────┘  └──────────────┘                  │
└─────────────────────────────────────────────────────────┘
```

### 2.2. Công nghệ sử dụng

#### **Frontend Stack**
- **React 19.2.0**: Framework UI hiện đại với hooks và functional components
- **Material-UI (MUI) 7.3.5**: Component library với design system chuyên nghiệp
- **React Router DOM 7.9.6**: Client-side routing với nested routes
- **Axios 1.13.2**: HTTP client với interceptors cho authentication
- **Recharts 2.12.7**: Data visualization cho admin dashboard
- **Date-fns 2.30.0**: Date manipulation utilities

**Lý do chọn**:
- React là framework phổ biến, có cộng đồng lớn, tài liệu phong phú
- Material-UI cung cấp components đẹp, responsive, tiết kiệm thời gian phát triển
- React Router hỗ trợ routing mạnh mẽ, dễ quản lý navigation

#### **Backend Stack**
- **FastAPI**: Modern Python web framework, nhanh và dễ sử dụng
- **SQLAlchemy**: ORM cho database operations, an toàn và hiệu quả
- **SQL Server**: Production database với stored procedures
- **PyODBC**: SQL Server driver
- **Python-JOSE**: JWT token handling
- **Passlib**: Password hashing với bcrypt
- **FastAPI-Mail**: Email service cho OTP

**Lý do chọn**:
- FastAPI có performance cao, tự động generate API documentation
- SQLAlchemy giúp code dễ maintain, tránh SQL injection
- SQL Server phù hợp với yêu cầu doanh nghiệp, hỗ trợ stored procedures

### 2.3. Cấu trúc dự án

```
ChuyenDeTotNghiep/
├── frontend/                    # React Frontend Application
│   ├── src/
│   │   ├── api/                # API client modules
│   │   ├── components/          # Reusable components
│   │   ├── pages/               # Page components
│   │   └── theme.js             # MUI theme config
│   └── package.json
│
└── backendfapi/                 # FastAPI Backend
    ├── src/
    │   ├── app/
    │   │   ├── routes/          # API routes
    │   │   │   ├── auth/        # Authentication
    │   │   │   ├── admin/       # Admin management
    │   │   │   ├── store/       # Store operations
    │   │   │   ├── users/       # User management
    │   │   │   └── chatbot/    # Chatbot
    │   │   ├── models.py        # SQLAlchemy models
    │   │   └── database.py      # Database config
    │   └── main.py              # Entry point
    └── requirements.txt
```

---

## PHẦN 3: CÁC TÍNH NĂNG CHÍNH (10 phút)

### 3.1. Tính năng dành cho khách hàng

#### **3.1.1. Quản lý sản phẩm**
- **Danh sách sản phẩm**: Hiển thị với pagination, tìm kiếm, lọc theo category, giá, rating
- **Chi tiết sản phẩm**: 
  - Image gallery với thumbnail navigation
  - Thông số kỹ thuật đầy đủ
  - Variant selection (Size, Color, Condition)
  - Tab Buy/Rent riêng biệt
  - Đánh giá và bình luận từ khách hàng
  - Sản phẩm liên quan

#### **3.1.2. Hệ thống giỏ hàng thông minh**
- **Dual Cart System**: 
  - **Authenticated Users**: Cart được lưu trong database, sử dụng stored procedures
  - **Guest Users**: Session-based cart, tự động chuyển đổi khi đăng nhập
- **Tính năng**:
  - Tách riêng "Items to Buy" và "Items to Rent"
  - Update quantity, remove items
  - Select all / Select individual items
  - Order summary với tính toán tự động

#### **3.1.3. Quy trình đặt hàng**
- **Checkout Flow**:
  1. Chọn địa chỉ giao hàng
  2. Chọn phương thức thanh toán (COD, Banking, Momo, VNPay)
  3. Áp dụng voucher (nếu có)
  4. Xác nhận đơn hàng
- **Hỗ trợ Guest Checkout**: Khách vãng lai có thể đặt hàng mà không cần đăng ký

#### **3.1.4. Quản lý tài khoản**
- **Account Info**: Xem và chỉnh sửa thông tin cá nhân
- **Address Management**: Quản lý nhiều địa chỉ, set default address
- **Order History**: Xem lịch sử đơn hàng, theo dõi trạng thái
- **Payment Settings**: Quản lý phương thức thanh toán

### 3.2. Tính năng dành cho quản trị viên

#### **3.2.1. Dashboard với Analytics**
- **Key Metrics**:
  - Total revenue với % thay đổi so với kỳ trước
  - Active rentals count
  - Total customers
  - Overdue returns alerts
- **Charts & Visualizations**:
  - Sales vs Rental revenue (bar chart - 7 ngày)
  - Inventory status (pie chart)
  - Revenue reports theo date range
- **Data Tables**:
  - Top selling products
  - Top rented products

#### **3.2.2. Quản lý sản phẩm**
- **Product List**: Data table với search, filter, pagination
- **Add/Edit Product**: 
  - Upload multiple images
  - Chọn category/subcategory
  - Pricing và inventory management
  - Product specifications
  - Rental configuration
- **Product Reviews**: Xem và quản lý đánh giá, có thể reply

#### **3.2.3. Quản lý đơn hàng**
- **Order List**: Filter theo type (sale/rental), status, date range
- **Order Detail**: 
  - Thông tin đầy đủ đơn hàng
  - Customer info
  - Order items
  - Order status workflow
  - Actions: Confirm, Ship, Complete, Cancel
  - Invoice generation
- **Rental Preparation**: Gán asset, chụp ảnh tình trạng xe

#### **3.2.4. Quản lý khách hàng**
- **Customer List**: Search, filter, view details
- **Customer Detail**: 
  - Full profile
  - Order history
  - Customer ranking và discount
  - Ban/Unban customer

#### **3.2.5. Quản lý khuyến mãi**
- **Promotion List**: View all vouchers với status
- **Add/Edit Promotion**:
  - Discount type (percentage/fixed)
  - Date range
  - Minimum order amount
  - Target ranks
  - Usage limits

#### **3.2.6. Cấu hình hệ thống**
- **Rental Configuration**: 
  - Duration limits (min/max days)
  - Deposit configuration
  - Penalty configuration
  - Rent-to-own settings
- **Chatbot FAQ**: Quản lý FAQ entries cho chatbot

---

## PHẦN 4: ĐẶC ĐIỂM NỔI BẬT (8 phút)

### 4.1. Hệ thống xếp hạng khách hàng (RFM Analysis) ⭐⭐⭐

**RFM Analysis** là một phương pháp phân tích khách hàng dựa trên:
- **R (Recency)**: Số ngày kể từ lần mua cuối cùng
- **F (Frequency)**: Số lần mua trong khoảng thời gian
- **M (Monetary)**: Tổng số tiền đã chi tiêu

**Cách hoạt động**:
1. Tính toán điểm R, F, M cho mỗi khách hàng
2. Tính Final Score = R + F + M
3. Phân loại khách hàng thành các rank:
   - **Diamond**: Khách hàng VIP nhất
   - **Gold**: Khách hàng trung thành
   - **Silver**: Khách hàng thường xuyên
   - **Bronze**: Khách hàng mới
4. Mỗi rank có mức giảm giá riêng (ví dụ: Diamond 15%, Gold 10%, Silver 5%)

**Lợi ích**:
- Tăng customer retention
- Tăng giá trị đơn hàng trung bình
- Tối ưu hóa chiến lược marketing

### 4.2. Dual Cart System ⭐⭐

**Vấn đề**: Làm thế nào để hỗ trợ cả khách hàng đã đăng ký và khách vãng lai?

**Giải pháp**:
- **Authenticated Users**: 
  - Cart lưu trong database
  - Sử dụng stored procedure `dbo.Tao_Gio_Va_Them_San_Pham`
  - Cart được đồng bộ trên mọi thiết bị
- **Guest Users**: 
  - Session-based cart
  - Tự động migrate sang account khi đăng nhập
  - Không cần đăng ký để bắt đầu mua sắm

**Lợi ích**:
- Giảm friction trong quy trình mua hàng
- Tăng conversion rate
- Cải thiện user experience

### 4.3. Hệ thống Voucher thông minh ⭐⭐

**Tính năng**:
- **Discount Types**: 
  - Percentage: Giảm theo %
  - Fixed: Giảm số tiền cố định
- **Validation Rules**:
  - Date range (start_date, end_date)
  - Minimum order amount
  - Usage quantity limits
  - Target ranks (chỉ áp dụng cho một số rank)
- **Usage Tracking**: Lưu lại lịch sử sử dụng voucher

**Lợi ích**:
- Kiểm soát chi phí marketing
- Tăng giá trị đơn hàng trung bình
- Phân tích hiệu quả của các chiến dịch

### 4.4. Multi-Location Inventory Management ⭐

**Tính năng**:
- Inventory được quản lý theo từng location (chi nhánh)
- Mỗi sản phẩm có thể có inventory ở nhiều location
- Tracking: Shelf, Bin, Quantity per location
- Real-time inventory updates

**Lợi ích**:
- Quản lý kho hàng chính xác
- Hỗ trợ mở rộng đa chi nhánh
- Tối ưu hóa logistics

### 4.5. Order Status Workflow ⭐

**Sales Order**:
```
Pending → Confirmed → Preparing → Shipped → Completed
         ↓
      Cancelled (có thể cancel ở bất kỳ giai đoạn nào)
```

**Rental Order**:
```
Pending → Confirmed → Preparing → Rented → Returned
         ↓
      Cancelled
```

**Tính năng đặc biệt**:
- Overdue detection và alerts cho rental orders
- Cancellation request workflow
- Status update tracking

### 4.6. Authentication & Security ⭐

- **JWT Token-based Authentication**: Token có thời hạn 30 ngày
- **Password Hashing**: Sử dụng bcrypt (Argon2)
- **OTP System**: 
  - Gửi OTP qua email khi đăng ký
  - Gửi OTP khi quên mật khẩu
  - OTP có thời hạn 5 phút
- **Role-Based Access Control**:
  - Customer: Truy cập store features
  - Product Staff: Quản lý sản phẩm
  - Order Staff: Quản lý đơn hàng
  - Admin: Full access

---

## PHẦN 5: DEMO VÀ KẾT QUẢ (5 phút)

### 5.1. Demo các tính năng chính

**Trình bày trực tiếp trên hệ thống**:

1. **Trang chủ - Danh sách sản phẩm**:
   - Hiển thị sản phẩm với pagination
   - Tìm kiếm và lọc sản phẩm
   - Responsive design

2. **Chi tiết sản phẩm**:
   - Image gallery
   - Thông số kỹ thuật
   - Tab Buy/Rent
   - Đánh giá sản phẩm

3. **Giỏ hàng**:
   - Tách riêng items mua và thuê
   - Update quantity
   - Checkout flow

4. **Admin Dashboard**:
   - Key metrics
   - Charts và visualizations
   - Top products

5. **Quản lý sản phẩm**:
   - Add/Edit product
   - Upload images
   - Inventory management

6. **Quản lý đơn hàng**:
   - Order list với filters
   - Order detail
   - Status workflow

### 5.2. Kết quả đạt được

✅ **Hoàn thành 100% các tính năng đã đề ra**:
- Frontend: React application với Material-UI
- Backend: FastAPI RESTful API
- Database: SQL Server với stored procedures
- Authentication: JWT token-based
- Admin Panel: Đầy đủ tính năng CRUD

✅ **Tính năng nổi bật**:
- RFM Analysis cho customer ranking
- Dual cart system
- Voucher system
- Multi-location inventory
- Order workflow management

✅ **Code Quality**:
- Clean code, dễ maintain
- Modular architecture
- Error handling
- API documentation với Swagger UI

---

## PHẦN 6: KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN (4 phút)

### 6.1. Kết luận

Hệ thống **BikeGo E-commerce** đã được xây dựng thành công với:
- ✅ Kiến trúc hiện đại, dễ mở rộng
- ✅ Giao diện người dùng thân thiện, responsive
- ✅ Hệ thống quản lý toàn diện cho admin
- ✅ Tính năng đặc biệt: RFM Analysis, Dual Cart, Voucher System
- ✅ Security: JWT authentication, password hashing, role-based access

Hệ thống đáp ứng đầy đủ yêu cầu của một nền tảng thương mại điện tử hiện đại, có thể triển khai thực tế và phục vụ cho cửa hàng xe đạp.

### 6.2. Hạn chế và khó khăn

1. **Payment Gateway**: Chưa tích hợp payment gateway thực tế (Stripe, PayPal, VNPay)
2. **Email Service**: OTP được gửi qua email nhưng chưa có email notifications cho orders
3. **Real-time Updates**: Chưa có WebSocket cho real-time notifications
4. **Mobile App**: Chưa có mobile app (có thể phát triển với React Native)
5. **Advanced Search**: Chưa có full-text search nâng cao

### 6.3. Hướng phát triển

#### **Ngắn hạn (3-6 tháng)**:
- [ ] Tích hợp payment gateway (Stripe/PayPal/VNPay)
- [ ] Email notifications (order confirmations, shipping)
- [ ] Advanced search với full-text search
- [ ] Product recommendations dựa trên AI
- [ ] Inventory alerts và reports tự động

#### **Dài hạn (6-12 tháng)**:
- [ ] Mobile app (React Native)
- [ ] Real-time notifications (WebSocket)
- [ ] Analytics dashboard nâng cao với business intelligence
- [ ] Multi-language support
- [ ] Social media integration
- [ ] Advanced reporting và forecasting

### 6.4. Bài học kinh nghiệm

1. **Kiến trúc**: Tách biệt Frontend-Backend giúp dễ maintain và scale
2. **Security**: Luôn ưu tiên security từ đầu (JWT, password hashing, validation)
3. **User Experience**: Guest checkout giúp tăng conversion rate
4. **Code Organization**: Modular architecture giúp code dễ đọc và maintain
5. **Documentation**: API documentation quan trọng cho team development

---

## PHẦN 7: HỎI ĐÁP (Dự kiến 10-15 phút)

### Câu hỏi thường gặp và câu trả lời

**Q1: Tại sao chọn FastAPI thay vì Django?**
- FastAPI có performance cao hơn, phù hợp với API
- Tự động generate API documentation (Swagger UI)
- Type hints giúp code dễ maintain
- Async support tốt hơn

**Q2: Làm thế nào hệ thống xử lý khi có nhiều người dùng cùng mua một sản phẩm cuối cùng?**
- Sử dụng database transactions để đảm bảo atomicity
- Kiểm tra inventory trước khi checkout
- Có thể implement optimistic locking nếu cần

**Q3: Hệ thống có hỗ trợ thanh toán online không?**
- Hiện tại có UI cho payment methods (Banking, Momo, VNPay)
- Chưa tích hợp payment gateway thực tế
- Đây là hướng phát triển tiếp theo

**Q4: Làm thế nào hệ thống đảm bảo security?**
- JWT token với expiration
- Password hashing với bcrypt
- Input validation
- SQL injection prevention (SQLAlchemy ORM)
- Role-based access control

**Q5: RFM Analysis được tính toán như thế nào?**
- Tính toán R, F, M dựa trên lịch sử mua hàng
- Có thể chạy batch job định kỳ để update ranks
- Hoặc update real-time khi order completed

**Q6: Hệ thống có thể scale như thế nào?**
- Frontend: Có thể deploy lên CDN (Netlify, Vercel)
- Backend: Có thể scale horizontal với load balancer
- Database: Có thể replicate hoặc shard nếu cần

**Q7: Làm thế nào xử lý khi database connection bị lỗi?**
- Sử dụng connection pooling
- Retry mechanism
- Error handling và logging
- Health check endpoints

**Q8: Tại sao sử dụng stored procedures?**
- Business logic phức tạp được xử lý ở database level
- Performance tốt hơn cho các operations phức tạp
- Đảm bảo data integrity
- Dễ maintain và test

---

## PHỤ LỤC: SLIDE LAYOUT ĐỀ XUẤT

### Slide 1: Title Slide
- Tên đề tài
- Sinh viên thực hiện
- Giảng viên hướng dẫn
- Ngày bảo vệ

### Slide 2: Mục lục
- Giới thiệu và tổng quan
- Kiến trúc và công nghệ
- Tính năng chính
- Đặc điểm nổi bật
- Demo và kết quả
- Kết luận

### Slide 3-5: Giới thiệu
- Lý do chọn đề tài
- Mục tiêu nghiên cứu
- Phạm vi nghiên cứu

### Slide 6-8: Kiến trúc
- Kiến trúc tổng thể (sơ đồ)
- Công nghệ Frontend
- Công nghệ Backend

### Slide 9-12: Tính năng
- Tính năng khách hàng
- Tính năng admin
- Screenshots

### Slide 13-16: Đặc điểm nổi bật
- RFM Analysis (sơ đồ, ví dụ)
- Dual Cart System
- Voucher System
- Multi-location Inventory

### Slide 17-18: Demo
- Screenshots các màn hình chính
- Video demo (nếu có)

### Slide 19: Kết quả
- Checklist các tính năng đã hoàn thành
- Metrics (nếu có)

### Slide 20: Kết luận
- Tóm tắt
- Hạn chế
- Hướng phát triển

### Slide 21: Q&A
- Thank you slide

---

## LƯU Ý KHI TRÌNH BÀY

1. **Thời gian**: Tổng cộng khoảng 30-40 phút (trình bày 25-30 phút, Q&A 10-15 phút)
2. **Tone**: Tự tin, rõ ràng, không đọc slide
3. **Eye contact**: Nhìn vào hội đồng, không chỉ nhìn slide
4. **Body language**: Tự nhiên, sử dụng tay để chỉ vào slide khi cần
5. **Demo**: Nếu có demo, chuẩn bị sẵn data và test trước
6. **Backup plan**: Chuẩn bị screenshots nếu demo không chạy được
7. **Q&A**: Lắng nghe câu hỏi kỹ, suy nghĩ trước khi trả lời, thừa nhận nếu không biết

---

**Chúc bạn bảo vệ thành công! 🎓**
