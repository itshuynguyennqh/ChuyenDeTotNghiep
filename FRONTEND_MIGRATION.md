# Frontend Migration to FastAPI Backend

This document describes the changes made to migrate the frontend from Django REST Framework to FastAPI backend.

## Changes Made

### 1. API Client Configuration (`frontend/src/api/axiosClient.js`)

**Changes:**
- Updated base URL to use FastAPI backend (port 8000)
- Removed `/api` prefix (FastAPI routes don't use this prefix)
- Changed `withCredentials` to `false` (FastAPI CORS handles this)

**Before:**
```javascript
const baseURL = process.env.REACT_APP_API_URL || `http://${window.location.hostname}:8000`;
// Routes used /api/ prefix
```

**After:**
```javascript
const baseURL = process.env.REACT_APP_API_URL || `http://${window.location.hostname}:8000`;
// Routes use direct paths like /auth/login, /admin/dashboard
```

### 2. Authentication API (`frontend/src/api/authApi.js`)

**Changes:**
- Updated login request format: `{ identifier, password }` instead of `{ email, password }`
- Added new endpoints: `verifyRegistration`, `forgotPassword`, `resetPassword`
- Updated response handling to match FastAPI format

**New Endpoints:**
- `POST /auth/login` - Returns `{ access_token, token_type, role, name, id }`
- `POST /auth/register` - Register new customer
- `POST /auth/verify-registration` - Verify OTP after registration
- `POST /auth/forgot-password` - Request password reset OTP
- `POST /auth/reset-password` - Reset password with OTP

### 3. Login Page (`frontend/src/pages/LoginPage.js`)

**Changes:**
- Updated to use `identifier` instead of `email` in login request
- Changed token storage: `response.data.access_token` instead of `response.data.token`
- Updated user data structure: `{ id, name, role }` instead of full user object
- Updated role checking: `'admin'`, `'staff'`, `'customer'` (lowercase) instead of `'Admin'`, `'Order Staff'`, etc.
- Improved error handling to show backend error messages

**Before:**
```javascript
localStorage.setItem('token', response.data.token);
localStorage.setItem('user', JSON.stringify(response.data.user));
const userRole = response.data.user.Role;
```

**After:**
```javascript
localStorage.setItem('token', response.data.access_token);
localStorage.setItem('user', JSON.stringify({
    id: response.data.id,
    name: response.data.name,
    role: response.data.role
}));
const userRole = response.data.role; // 'admin', 'staff', or 'customer'
```

### 4. Admin API (`frontend/src/api/adminApi.js`)

**Changes:**
- Replaced all mock data with actual API calls
- Updated endpoint paths to match FastAPI routes
- Added response transformation to match frontend expectations
- Updated query parameter formats (e.g., `start_date`, `end_date` instead of `start`, `end`)

**Key Endpoints Updated:**
- Dashboard: `GET /admin/dashboard`
- Reports: `GET /admin/reports?start_date=...&end_date=...`
- Products: `GET /admin/products`, `POST /admin/products`, etc.
- Categories: `GET /admin/categories`
- Customers: `GET /admin/customers`
- Orders: `GET /admin/orders?type=...`
- Staff: `GET /admin/staffs` (note: plural)
- Promotions: `GET /admin/promotions`
- Settings: `GET /admin/settings/rental`
- FAQs: `GET /admin/faqs`

## API Response Format Changes

### Authentication Response

**FastAPI Format:**
```json
{
  "access_token": "eyJ...",
  "token_type": "bearer",
  "role": "admin",
  "name": "John Doe",
  "id": 123
}
```

**Old Format:**
```json
{
  "token": "eyJ...",
  "user": {
    "id": 123,
    "Role": "Admin",
    ...
  }
}
```

### Admin Responses

Most admin endpoints now return:
```json
{
  "success": true,
  "data": [...],
  "pagination": { "page": 1, "limit": 10, ... }
}
```

## Environment Variables

No changes needed - the frontend still uses:
- `REACT_APP_API_URL` - Optional override for API base URL

Default: `http://localhost:8000`

## Testing Checklist

- [ ] Login with customer account
- [ ] Login with admin/staff account
- [ ] Register new customer
- [ ] Admin dashboard loads
- [ ] Admin products list loads
- [ ] Admin categories list loads
- [ ] Admin customers list loads
- [ ] Admin orders list loads
- [ ] Token is stored correctly
- [ ] Token is sent in Authorization header
- [ ] Error messages display correctly

## Breaking Changes

1. **Login Request Format**: Changed from `{ email, password }` to `{ identifier, password }`
2. **Token Field**: Changed from `token` to `access_token`
3. **User Role Values**: Changed from `'Admin'`, `'Order Staff'` to `'admin'`, `'staff'`, `'customer'`
4. **API Prefix**: Removed `/api` prefix from all routes
5. **Endpoint Paths**: Some paths changed (e.g., `/admin/staff` → `/admin/staffs`)

## Notes

- The admin API functions transform FastAPI responses to match the frontend's expected format
- Some endpoints may return 501 (Not Implemented) - these need backend implementation
- Error handling has been improved to show backend error messages
- The frontend is backward compatible with the new API structure

## Next Steps

1. Test all authentication flows
2. Test all admin pages
3. Implement OTP verification UI (if not already implemented)
4. Update any other components that use the old API structure
5. Test error handling and edge cases
