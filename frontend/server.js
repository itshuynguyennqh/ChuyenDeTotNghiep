const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

// Use default middlewares (logger, static, cors, etc.)
server.use(middlewares);
server.use(jsonServer.bodyParser);

// --- Custom Auth Routes ---

// Login Endpoint
server.post('/auth/login', (req, res) => {
    const { email, password } = req.body;
    const db = router.db;

    const emailRecord = db.get('CustomerEmailAddress').find({ EmailAddress: email }).value();
    if (!emailRecord) {
        return res.status(400).json({ message: 'User not found' });
    }

    const customerId = emailRecord.CustomerID;
    const passwordRecord = db.get('CustomerPassWord').find({ CustomerID: customerId }).value();

    if (!passwordRecord || passwordRecord.PasswordSalt !== password) {
        return res.status(400).json({ message: 'Invalid password' });
    }

    const customer = db.get('Customer').find({ CustomerID: customerId }).value();

    // --- MOCK ADMIN LOGIC ---
    // Giả lập: Nếu email là admin@bikego.com thì gán Role = 'Admin'
    // Các user khác là 'Customer'
    const userRole = email === 'admin@bikego.com' ? 'Admin' : 'Customer';
    const userResponse = { ...customer, Role: userRole };

    const token = `fake-jwt-token-for-${customerId}-${Date.now()}`;
    
    res.json({ token, user: userResponse });
});

// Register Endpoint
server.post('/auth/register', (req, res) => {
    const { password, email, firstname, lastname } = req.body;
    const db = router.db;

    const existingEmail = db.get('CustomerEmailAddress').find({ EmailAddress: email }).value();
    if (existingEmail) {
        return res.status(400).json({ message: 'Email already exists' });
    }

    const customers = db.get('Customer').value() || [];
    const newCustomerId = customers.length > 0 ? Math.max(...customers.map(c => c.CustomerID)) + 1 : 1;
    const newCustomer = {
        CustomerID: newCustomerId,
        FirstName: firstname,
        LastName: lastname,
        MiddleName: ""
    };
    db.get('Customer').push(newCustomer).write();

    const emailAddresses = db.get('CustomerEmailAddress').value() || [];
    const newEmailId = emailAddresses.length > 0 ? Math.max(...emailAddresses.map(e => e.EmailAddressID)) + 1 : 1;
    const newEmail = {
        CustomerID: newCustomerId,
        EmailAddress: email,
        EmailAddressID: newEmailId,
        ModifiedDate: new Date().toISOString()
    };
    db.get('CustomerEmailAddress').push(newEmail).write();

    const newPassword = {
        CustomerID: newCustomerId,
        PasswordSalt: password,
        ModifiedDate: new Date().toISOString()
    };
    db.get('CustomerPassWord').push(newPassword).write();

    const carts = db.get('Cart').value() || [];
    const newCartId = carts.length > 0 ? Math.max(...carts.map(c => c.CartID)) + 1 : 1;
    const newCart = {
        CartID: newCartId,
        CustomerID: newCustomerId,
        CreatedDate: new Date().toISOString(),
        ModifiedDate: new Date().toISOString(),
        Status: "Active",
        IsCheckedOut: 0
    };
    db.get('Cart').push(newCart).write();

    res.status(201).json({ 
        message: 'Registration successful', 
        user: newCustomer
    });
});

// Account Details Endpoint
server.get('/account/:customerId', (req, res) => {
    const { customerId } = req.params;
    const db = router.db;

    const customer = db.get('Customer').find({ CustomerID: parseInt(customerId) }).value();
    if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
    }

    const email = db.get('CustomerEmailAddress').find({ CustomerID: parseInt(customerId) }).value();
    const address = db.get('CustomerAdress').find({ CustomerID: parseInt(customerId) }).value();
    const phone = db.get('CustomerPhone').find({ CustomerID: parseInt(customerId) }).value();

    const accountDetails = {
        ...customer,
        Email: email ? email.EmailAddress : 'N/A',
        Address: address ? `${address.AddressLine1}, ${address.City}, ${address.PostalCode}` : 'N/A',
        Phone: phone ? phone.PhoneNumber : 'N/A'
    };

    res.json(accountDetails);
});

server.get('/api/proc/view-orders/', (req, res) => {
    const { customerid } = req.query;
    const db = router.db;

    const customer = db.get('Customer').find({ CustomerID: parseInt(customerid) }).value();
    if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
    }

    // Logic mapped from SP: Xem_Danh_Sach_Don
    // SELECT SalesOrderID, CustomerID, OrderDate, TotalDue, OrderStatus FROM SalesOrderHeader
    const orders = db.get('SalesOrderHeader')
        .filter({ CustomerID: parseInt(customerid) })
        .map(order => ({
            SalesOrderID: order.SalesOrderID,
            CustomerID: order.CustomerID,
            OrderDate: order.OrderDate,
            TotalDue: order.TotalDue,
            OrderStatus: order.OrderStatus
        }))
        .value();

    res.json(orders || []);
});

server.get('/api/cart/', (req, res) => {
    const db = router.db;
    
    // 1. Extract CustomerID from token
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }
    
    const token = authHeader.split(' ')[1];
    const match = token.match(/fake-jwt-token-for-(\d+)-/);
    
    if (!match) {
        return res.status(401).json({ message: "Unauthorized: Invalid token format" });
    }
    
    const CustomerID = parseInt(match[1]);

    // 2. Find Active Cart
    const cart = db.get('Cart').find({ CustomerID: CustomerID, IsCheckedOut: 0 }).value();

    if (!cart) {
        return res.json({ CartID: null, Items: [], Total: 0 });
    }

    // 3. Get Items and Join with Product details
    const cartItems = db.get('CartItem').filter({ CartID: cart.CartID }).value();

    const itemsWithDetails = cartItems.map(item => {
        // Table name is 'product' based on your previous code
        const product = db.get('product').find({ ProductID: item.ProductID }).value();
        
        return {
            ...item,
            // Merge product info for display
            Name: product ? product.Name : 'Unknown Product',
            ProductNumber: product ? product.ProductNumber : '',
            Color: product ? product.Color : '',
            Size: product ? product.Size : '',
            ListPrice: product ? product.ListPrice : 0,
            ThumbNailPhoto: product ? product.ThumbNailPhoto : null
        };
    });

    const total = itemsWithDetails.reduce((sum, item) => sum + (item.Quantity * item.UnitPrice), 0);

    res.json({ CartID: cart.CartID, Items: itemsWithDetails, Total: total });
});

server.post('/api/cart/items/', (req, res) => {
    const db = router.db;
    const { ProductID, Quantity } = req.body;

    // 1. Extract CustomerID from the fake JWT token
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }
    
    // Token format: Bearer fake-jwt-token-for-{customerId}-{timestamp}
    const token = authHeader.split(' ')[1];
    const match = token.match(/fake-jwt-token-for-(\d+)-/);
    
    if (!match) {
        return res.status(401).json({ message: "Unauthorized: Invalid token format" });
    }
    
    const CustomerID = parseInt(match[1]);

    // Logic mapped from SP: Tao_Gio_Va_Them_San_Pham
    
    // 2. Get Product Price (Table name in schema is 'product')
    const product = db.get('product').find({ ProductID: parseInt(ProductID) }).value();
    
    if (!product) {
        return res.status(404).json({ message: 'Sản phẩm không tồn tại hoặc chưa có giá.' });
    }
    
    const UnitPrice = product.ListPrice;

    // 3. Check/Create Cart
    let cart = db.get('Cart').find({ CustomerID: CustomerID, IsCheckedOut: 0 }).value();

    if (!cart) {
        const carts = db.get('Cart').value() || [];
        const newCartId = carts.length > 0 ? Math.max(...carts.map(c => c.CartID)) + 1 : 1;
        
        cart = {
            CartID: newCartId,
            CustomerID: CustomerID,
            CreatedDate: new Date().toISOString(),
            ModifiedDate: new Date().toISOString(),
            Status: 'Active',
            IsCheckedOut: 0
        };
        
        db.get('Cart').push(cart).write();
    }

    const CartID = cart.CartID;

    // 4. Add/Update CartItem
    const existingItem = db.get('CartItem')
        .find({ CartID: CartID, ProductID: parseInt(ProductID) })
        .value();

    if (existingItem) {
        db.get('CartItem')
            .find({ CartItemID: existingItem.CartItemID })
            .assign({
                Quantity: existingItem.Quantity + parseInt(Quantity),
                DateUpdated: new Date().toISOString()
            })
            .write();
    } else {
        const cartItems = db.get('CartItem').value() || [];
        const newCartItemID = cartItems.length > 0 ? Math.max(...cartItems.map(c => c.CartItemID)) + 1 : 1;
        
        const newItem = {
            CartItemID: newCartItemID,
            CartID: CartID,
            ProductID: parseInt(ProductID),
            Quantity: parseInt(Quantity),
            UnitPrice: UnitPrice,
            DateAdded: new Date().toISOString(),
            DateUpdated: new Date().toISOString()
        };
        
        db.get('CartItem').push(newItem).write();
    }

    res.json({ Message: 'Đã thêm sản phẩm vào giỏ hàng!', CartID: CartID });
});

server.post('/api/proc/update-order-status/', (req, res) => {
    const db = router.db;
    const { SalesOrderID, NewStatus } = req.body;

    // Logic mapped from SP: Cap_Nhat_Trang_Thai_Don
    const order = db.get('SalesOrderHeader').find({ SalesOrderID: parseInt(SalesOrderID) }).value();

    if (!order) {
        return res.status(404).json({ message: "Order not found" });
    }

    db.get('SalesOrderHeader')
        .find({ SalesOrderID: parseInt(SalesOrderID) })
        .assign({
            OrderStatus: NewStatus,
            ModifiedDate: new Date().toISOString()
        })
        .write();

    res.json({ message: "Cập nhật trạng thái đơn hàng thành công!" });
});

// --- Address Routes (Mapped to CustomerAdress table) ---

server.get('/api/addresses/', (req, res) => {
    const db = router.db;
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "Unauthorized" });
    
    const token = authHeader.split(' ')[1];
    const match = token.match(/fake-jwt-token-for-(\d+)-/);
    if (!match) return res.status(401).json({ message: "Invalid token" });
    
    const CustomerID = parseInt(match[1]);

    // Table name in db.json seems to be 'CustomerAdress' based on existing code
    const addresses = db.get('CustomerAdress').filter({ CustomerID: CustomerID }).value();
    res.json(addresses || []);
});

server.post('/api/addresses/', (req, res) => {
    const db = router.db;
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "Unauthorized" });
    
    const token = authHeader.split(' ')[1];
    const match = token.match(/fake-jwt-token-for-(\d+)-/);
    if (!match) return res.status(401).json({ message: "Invalid token" });
    
    const CustomerID = parseInt(match[1]);
    const { addressline1, contactname, phonenumber } = req.body;

    const addresses = db.get('CustomerAdress').value() || [];
    // Generate new ID
    const newAddressId = addresses.length > 0 ? Math.max(...addresses.map(a => a.AddressID || 0)) + 1 : 1;

    const newAddress = {
        AddressID: newAddressId,
        CustomerID: CustomerID,
        AddressLine1: addressline1,
        ContactName: contactname,
        PhoneNumber: phonenumber,
        ModifiedDate: new Date().toISOString(),
        rowguid: 'uuid-' + Date.now()
    };

    db.get('CustomerAdress').push(newAddress).write();
    res.status(201).json(newAddress);
});

server.put('/api/addresses/:id/', (req, res) => {
    const db = router.db;
    const { id } = req.params;
    const { addressline1, contactname, phonenumber } = req.body;

    db.get('CustomerAdress')
        .find({ AddressID: parseInt(id) })
        .assign({
            AddressLine1: addressline1,
            ContactName: contactname,
            PhoneNumber: phonenumber,
            ModifiedDate: new Date().toISOString()
        })
        .write();
    
    res.json({ message: "Address updated" });
});

server.delete('/api/addresses/:id/', (req, res) => {
    const db = router.db;
    const { id } = req.params;
    
    db.get('CustomerAdress').remove({ AddressID: parseInt(id) }).write();
    res.json({ message: "Address deleted" });
});

// --- End Custom Auth Routes ---


// Custom route for documentation
server.get('/api/docs', (req, res) => {
  const db = router.db.getState();
  const resources = Object.keys(db);
  
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>BikeGo API Documentation</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; background-color: #f9f9f9; color: #333; }
        h1 { color: #e67e00; border-bottom: 2px solid #e67e00; padding-bottom: 10px; }
        .card { background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); padding: 20px; margin-bottom: 20px; }
        ul { list-style-type: none; padding: 0; }
        li { margin: 15px 0; padding: 10px; border-bottom: 1px solid #eee; display: flex; align-items: center; justify-content: space-between; }
        li:last-child { border-bottom: none; }
        a { text-decoration: none; color: #007bff; font-weight: 600; font-size: 1.1em; }
        a:hover { text-decoration: underline; }
        .badge { background: #e67e00; color: white; padding: 4px 8px; border-radius: 4px; font-size: 0.8em; font-weight: bold; margin-right: 10px; }
        .count { color: #666; font-size: 0.9em; background: #eee; padding: 2px 8px; border-radius: 10px; }
        .info { margin-top: 20px; font-size: 0.9em; color: #666; }
        .custom-endpoint { background-color: #e8f5e9; border-left: 4px solid #28a745; padding: 10px; margin-bottom: 10px; }
      </style>
    </head>
    <body>
      <div class="card">
        <h1>BikeGo API Resources</h1>
        <p>Base URL: <code>http://localhost:8000/api</code></p>
        
        <h3>Custom Auth Endpoints</h3>
        <div class="custom-endpoint">
            <strong>POST /auth/login</strong> - Login user
        </div>
        <div class="custom-endpoint">
            <strong>POST /auth/register</strong> - Register new user (Creates User, Customer, Cart)
        </div>
        <div class="custom-endpoint">
            <strong>GET /account/:customerId</strong> - Get full account details for a customer
        </div>

        <h3>Database Resources</h3>
        <ul>
          ${resources.map(resource => `
            <li>
              <div>
                <span class="badge">RES</span>
                <a href="/api/${resource}" target="_blank">/api/${resource}</a>
              </div>
              <span class="count">${Array.isArray(db[resource]) ? db[resource].length : 'Object'} items</span>
            </li>
          `).join('')}
        </ul>
      </div>
    </body>
    </html>
  `;
  res.send(html);
});

// To prevent json-server from lowercasing keys
router.render = (req, res) => {
  res.jsonp(res.locals.data);
};

// Add a URL prefix by mounting the router under a specific path
server.use('/api', router); // All json-server routes will now start with /api

server.listen(8000, () => {
    console.log('JSON Server is running on http://localhost:8000/api');
    console.log('API Documentation available at http://localhost:8000/api/docs');
});
