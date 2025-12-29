const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();
const fs = require('fs');
const path = require('path');

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

    const token = `fake-jwt-token-for-${customerId}-${Date.now()}`;
    
    res.json({ token, user: customer });
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


// --- End Custom Auth Routes ---


// Custom route for documentation
server.get('/api/docs', (req, res) => {
  const dbPath = path.join(__dirname, 'db.json');
  const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
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
