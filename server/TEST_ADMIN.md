# Admin Functionality Testing Guide

## ✅ Backend Configuration Verified

- **Admin Email**: `fineanswer2025@gmail.com` ✅
- **Environment Variable**: Set in `.env` file ✅
- **Admin Detection**: Automatic on login ✅

## How to Test Admin Functionality

### Test 1: Admin Email Login

**Request:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "fineanswer2025@gmail.com",
    "password": "your_password"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "jwt_token_here",
  "data": {
    "_id": "...",
    "name": "...",
    "email": "fineanswer2025@gmail.com",
    "isAdmin": true,
    ...
  },
  "isAdmin": true
}
```

**✅ Check**: `isAdmin` should be `true` in both `data.isAdmin` and root level `isAdmin`

### Test 2: Regular User Login

**Request:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "regular@example.com",
    "password": "password123"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "jwt_token_here",
  "data": {
    "_id": "...",
    "name": "...",
    "email": "regular@example.com",
    "isAdmin": false,
    ...
  },
  "isAdmin": false
}
```

**✅ Check**: `isAdmin` should be `false`

### Test 3: Google Login with Admin Email

**Request:**
```bash
curl -X POST http://localhost:5000/api/auth/google \
  -H "Content-Type: application/json" \
  -d '{
    "email": "fineanswer2025@gmail.com",
    "googleId": "123456789",
    "name": "Admin User",
    "picture": "https://..."
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "jwt_token_here",
  "data": {
    "_id": "...",
    "name": "Admin User",
    "email": "fineanswer2025@gmail.com",
    "isAdmin": true,
    "authProvider": "google",
    ...
  },
  "isAdmin": true
}
```

**✅ Check**: `isAdmin` should be `true` even for Google login

### Test 4: Get Current User (Admin)

**Request:**
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "...",
    "email": "fineanswer2025@gmail.com",
    "isAdmin": true,
    ...
  },
  "isAdmin": true
}
```

**✅ Check**: Should return `isAdmin: true` for admin user

## Frontend Testing Checklist

### ✅ Login Flow
- [ ] Admin user logs in → Redirects to `/admin/dashboard`
- [ ] Regular user logs in → Redirects to `/dashboard`
- [ ] Google login with admin email → Redirects to `/admin/dashboard`
- [ ] Google login with regular email → Redirects to `/dashboard`

### ✅ Route Protection
- [ ] Regular user tries to access `/admin/dashboard` → Redirects to `/dashboard`
- [ ] Admin user accesses `/admin/dashboard` → Shows admin dashboard
- [ ] Unauthenticated user accesses any route → Redirects to `/login`

### ✅ UI Elements
- [ ] Admin navigation links only visible to admin users
- [ ] Admin badge/indicator shows for admin users
- [ ] Regular users don't see admin features

### ✅ State Management
- [ ] `isAdmin` is stored in auth context/state
- [ ] `isAdmin` persists after page refresh
- [ ] `isAdmin` updates correctly on login/logout

## Common Issues & Solutions

### Issue 1: Admin status not updating
**Solution**: The admin status is checked and updated on every login. If an existing user's email is changed to the admin email, they will get admin status on next login.

### Issue 2: Case sensitivity
**Solution**: The code uses `.toLowerCase()` comparison, so `FineAnswer2025@gmail.com` and `fineanswer2025@gmail.com` both work.

### Issue 3: Admin status not in response
**Solution**: Check that:
1. Email exactly matches `fineanswer2025@gmail.com`
2. User exists in database
3. Login endpoint is working correctly

## Verification Commands

### Check Admin Email Configuration
```bash
cd /home/rafi/Works/FineAnswer/server
node -e "require('dotenv').config(); console.log('ADMIN_EMAIL:', process.env.ADMIN_EMAIL);"
```

### Test Admin Login (if you have a test user)
```bash
# Replace with actual password
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "fineanswer2025@gmail.com", "password": "test_password"}'
```

## Next Steps

1. **Create Admin User**: Register or login with `fineanswer2025@gmail.com`
2. **Test Frontend**: Implement the frontend code from `ADMIN_FRONTEND_IMPLEMENTATION.md`
3. **Verify Redirects**: Ensure admin users go to admin dashboard
4. **Test Protection**: Ensure regular users can't access admin routes
