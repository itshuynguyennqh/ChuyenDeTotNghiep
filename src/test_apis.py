import pytest
from fastapi.testclient import TestClient
from unittest.mock import MagicMock, patch
from app.routes.admin.apis import admin_router
from fastapi import FastAPI

# Create a test app
app = FastAPI()
app.include_router(admin_router)

client = TestClient(app)

# Mock database session
@pytest.fixture
def mock_db():
    return MagicMock()

@pytest.fixture(autouse=True)
def mock_get_db(mock_db):
    with patch("app.routes.admin.apis.get_db", return_value=mock_db):
        yield mock_db

# Test Dashboard
def test_get_dashboard_stats(mock_get_db):
    # Mock the queries
    mock_get_db.query.return_value.scalar.return_value = 1000.0  # total_sales
    mock_get_db.query.return_value.filter.return_value.scalar.return_value = 500.0  # total_rentals
    mock_get_db.query.return_value.filter.return_value.scalar.return_value = 10  # active_rental
    mock_get_db.query.return_value.scalar.return_value = 100  # total_customers
    mock_get_db.query.return_value.filter.return_value.scalar.return_value = 5  # overdue

    response = client.get("/admin/dashboard")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "summary" in data["data"]
    assert "revenue_chart" in data["data"]
    assert "inventory_status" in data["data"]

# Test Products List
def test_get_products_list(mock_get_db):
    # Mock Product query
    mock_product = MagicMock()
    mock_product.ProductID = 1
    mock_product.ProductNumber = "PROD-001"
    mock_product.Name = "Test Product"
    mock_product.ListPrice = 100.0
    mock_product.RentPrice = 10.0
    mock_product.images = [MagicMock(ImageURL="http://example.com/img.jpg", IsPrimary=True)]

    mock_get_db.query.return_value.filter.return_value.count.return_value = 1
    mock_get_db.query.return_value.filter.return_value.offset.return_value.limit.return_value.all.return_value = [mock_product]
    mock_get_db.query.return_value.filter.return_value.scalar.return_value = 10  # total_stock
    mock_get_db.query.return_value.filter.return_value.scalar.return_value = 8  # available_stock
    mock_get_db.query.return_value.filter.return_value.scalar.return_value = 2  # renting_stock
    mock_get_db.query.return_value.filter.return_value.scalar.return_value = 0  # maint_stock
    mock_get_db.query.return_value.filter.return_value.scalar.return_value = 4.5  # avg_rating

    response = client.get("/admin/products?page=1&limit=10")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert len(data["data"]) == 1
    assert data["data"][0]["id"] == "PROD-001"

# Test Create Product
def test_create_product(mock_get_db):
    # Mock category check
    mock_cat = MagicMock()
    mock_get_db.query.return_value.filter.return_value.first.return_value = mock_cat

    # Mock new product
    mock_new_product = MagicMock()
    mock_new_product.ProductID = 1
    mock_get_db.add.return_value = None
    mock_get_db.flush.return_value = None
    mock_get_db.commit.return_value = None

    payload = {
        "name": "New Product",
        "category_id": 1,
        "stock_details": {
            "total_stock": 10,
            "maintenance_stock": 2,
            "available_stock": 8,
            "renting_stock": 0
        },
        "attributes": {
            "size": "M",
            "color": "Red",
            "condition": "New"
        },
        "pricing": {
            "sell_price": 100.0,
            "currency": "USD"
        },
        "rental_config": {
            "is_rentable": True,
            "rental_price": 10.0,
            "security_deposit": 50.0,
            "rental_period_unit": "day"
        },
        "description": "Test product",
        "images": ["http://example.com/img.jpg"]
    }

    response = client.post("/admin/products", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["status"] == "success"
    assert data["message"] == "Product created successfully"

# Test Get Product Detail
def test_get_product_detail(mock_get_db):
    mock_product = MagicMock()
    mock_product.ProductID = 1
    mock_product.ProductNumber = "PROD-001"
    mock_product.Name = "Test Product"
    mock_product.ProductSubcategoryID = 1
    mock_product.Description = "Description"
    mock_product.Size = "M"
    mock_product.Color = "Red"
    mock_product.Condition = "New"
    mock_product.ListPrice = 100.0
    mock_product.RentPrice = 10.0
    mock_product.IsRentable = True
    mock_product.SecurityDeposit = 50.0
    mock_product.RentalPeriodUnit = "day"
    mock_product.images = [MagicMock(ImageURL="http://example.com/img.jpg")]

    mock_get_db.query.return_value.filter.return_value.first.return_value = mock_product

    response = client.get("/admin/products/1")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["data"]["id"] == 1
    assert data["data"]["name"] == "Test Product"

# Test Categories List
def test_get_categories(mock_get_db):
    mock_cat = MagicMock()
    mock_cat.ProductSubcategoryID = 1
    mock_cat.Name = "Test Category"
    mock_get_db.query.return_value.outerjoin.return_value.filter.return_value.group_by.return_value.order_by.return_value.offset.return_value.limit.return_value.all.return_value = [(1, "Test Category", 5)]

    response = client.get("/admin/categories?page=1&limit=10")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert len(data["data"]) == 1
    assert data["data"][0]["id"] == "CAT-001"
    assert data["data"][0]["name"] == "Test Category"
    assert data["data"][0]["product_count"] == 5

# Test Customers List
def test_get_customers(mock_get_db):
    mock_customer = MagicMock()
    mock_customer.CustomerID = 1
    mock_customer.FirstName = "John"
    mock_customer.LastName = "Doe"
    mock_customer.Status = 1
    mock_customer.AvatarURL = None
    mock_customer.phones = [MagicMock(PhoneNumber="123456789")]

    mock_get_db.query.return_value.outerjoin.return_value.filter.return_value.group_by.return_value.order_by.return_value.offset.return_value.limit.return_value.all.return_value = [mock_customer]
    mock_get_db.query.return_value.with_entities.return_value.scalar.return_value = 1

    response = client.get("/admin/customers?page=1&limit=10")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert len(data["data"]) == 1
    assert data["data"][0]["id"] == "CUS-001"
    assert data["data"][0]["full_name"] == "John Doe"

# Test Staffs List
def test_get_staffs(mock_get_db):
    mock_staff = MagicMock()
    mock_staff.BusinessEntityID = 1
    mock_staff.FullName = "Jane Doe"
    mock_staff.PhoneNumber = "987654321"
    mock_staff.EmailAddress = "jane@example.com"
    mock_staff.GroupName = "Order Staff"
    mock_staff.IsActive = True

    mock_get_db.query.return_value.filter.return_value.count.return_value = 1
    mock_get_db.query.return_value.filter.return_value.order_by.return_value.offset.return_value.limit.return_value.all.return_value = [mock_staff]

    response = client.get("/admin/staffs?page=1&limit=10")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert len(data["data"]) == 1
    assert data["data"][0]["id"] == "STF-001"
    assert data["data"][0]["full_name"] == "Jane Doe"

# Test Rental Settings
def test_get_rental_settings(mock_get_db):
    mock_config = MagicMock()
    mock_config.MinRentalDays = 1
    mock_config.MaxRentalDays = 30
    mock_config.DefaultDepositRate = 80.0
    mock_config.OverdueFeeRate = 150.0
    mock_config.CancellationPolicy = "flexible"
    mock_config.IsRentToOwnEnabled = True
    mock_config.RentDeductionRate = 100.0

    mock_get_db.query.return_value.filter.return_value.first.return_value = mock_config

    response = client.get("/admin/settings/rental")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["data"]["duration_limits"]["min_days"] == 1
    assert data["data"]["duration_limits"]["max_days"] == 30
    assert data["data"]["deposit"]["default_rate"] == 80.0

# Test FAQs List
def test_get_faqs(mock_get_db):
    mock_faq = MagicMock()
    mock_faq.FAQID = 1
    mock_faq.Question = "What is this?"
    mock_faq.Answer = "This is a test."
    mock_faq.Keywords = "test,faq"
    mock_faq.IsActive = True

    mock_get_db.query.return_value.filter.return_value.count.return_value = 1
    mock_get_db.query.return_value.filter.return_value.order_by.return_value.offset.return_value.limit.return_value.all.return_value = [mock_faq]

    response = client.get("/admin/faqs?page=1&limit=10")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert len(data["data"]) == 1
    assert data["data"][0]["id"] == "FAQ-001"
    assert data["data"][0]["question"] == "What is this?"
    assert data["data"][0]["keywords"] == ["test", "faq"]

# Run tests
if __name__ == "__main__":
    pytest.main([__file__])