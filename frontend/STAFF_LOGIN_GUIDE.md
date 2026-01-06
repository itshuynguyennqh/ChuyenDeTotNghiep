# Staff Login Guide

## Demo Staff Accounts

The following demo accounts are available for testing the staff/admin interface:

### Admin Account
- **Email:** `admin@bikego.com`
- **Password:** `password`
- **Role:** Admin
- **Access:** Full admin dashboard access

### Order Staff Accounts
- **Email:** `staff@bikego.com`
- **Password:** `password`
- **Role:** Order Staff

- **Email:** `order@bikego.com`
- **Password:** `password`
- **Role:** Order Staff

- **Email:** `anv@cycle-shop.com`
- **Password:** `password`
- **Role:** Order Staff

### Product Staff Accounts
- **Email:** `product@bikego.com`
- **Password:** `password`
- **Role:** Product Staff

- **Email:** `eha@cycle-shop.com`
- **Password:** `password`
- **Role:** Product Staff

## How to Login

1. Navigate to the login page: `http://localhost:3000/login`
2. Enter one of the demo staff email addresses above
3. Enter password: `password`
4. Click "Log in"
5. You will be automatically redirected to `/admin/dashboard`

## Features Available

### Admin Role
- Full access to all admin features
- Dashboard, Products, Orders, Categories, Customers, Staff, Settings, etc.

### Order Staff Role
- Access to Order Management
- Can view and update order statuses
- Can handle cancellations and returns

### Product Staff Role
- Access to Product Management
- Can add, edit, and delete products
- Can manage categories

## Notes

- All demo accounts use the same password: `password`
- These accounts are mock accounts and don't require database entries
- The login system automatically assigns roles based on email addresses
- Staff accounts are handled separately from regular customer accounts in the mock server

## Customization

To add more staff accounts, edit `frontend/server.js` and add entries to the `staffAccounts` object in the login endpoint:

```javascript
const staffAccounts = {
    'your-email@bikego.com': { 
        Role: 'Your Role', 
        EmailAddress: 'your-email@bikego.com',
        FirstName: 'First',
        LastName: 'Last'
    },
    // ... more accounts
};
```
