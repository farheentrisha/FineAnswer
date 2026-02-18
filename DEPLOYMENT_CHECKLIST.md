# Payment Deployment Checklist

## 🔴 Critical Changes Required for Production

### 1. **Server Environment Variables** (`server/.env` or hosting platform env vars)

```env
# Production URLs (update these!)
FRONTEND_URL=https://your-frontend-domain.com
BACKEND_URL=https://your-backend-domain.com

# SSLCommerz Production Credentials
# Get these from: https://developer.sslcommerz.com/
SSLCOMMERZ_STORE_ID=your_production_store_id
SSLCOMMERZ_STORE_PASSWD=your_production_store_password

# Node Environment (IMPORTANT!)
NODE_ENV=production

# Other required vars (already set)
DB_USER=your_db_user
DB_PASSWORD=your_db_password
ADMIN_EMAIL=your_admin_email
JWT_SECRET=your_strong_random_secret_key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

### 2. **Client Environment Variables** (Vite)

Create `.env.production` in `client/` directory:

```env
VITE_API_URL=https://your-backend-domain.com
```

Or set in your hosting platform (Vercel/Netlify):
- **Vercel**: Project Settings → Environment Variables → Add `VITE_API_URL`
- **Netlify**: Site Settings → Environment Variables → Add `VITE_API_URL`

### 3. **SSLCommerz Merchant Dashboard Configuration**

**Required:**
1. Log in to [SSLCommerz Merchant Panel](https://merchant.sslcommerz.com/)
2. Verify your **Store ID** and **Store Password** match the credentials in your `.env` file
3. Ensure your store is **active** (sandbox for testing, live for production)

**Optional (Recommended for Production):**
4. Go to **Settings → IPN Configuration**
5. Set **IPN URL** to: `https://your-backend-domain.com/api/payment/ipn`
   - **Note**: IPN is optional - your payment flow works without it
   - IPN is useful for handling missed payments (if user closes browser before redirect)
   - Currently not implemented - you can add an IPN endpoint later if needed

### 4. **CORS Configuration** (if deploying to new domain)

Update `server/index.js` CORS origins:

```javascript
origin: [
  "http://localhost:5173", // Keep for local dev
  "https://your-frontend-domain.com", // Add your production frontend
],
```

### 5. **SSLCommerz URLs** ✅ (Already Fixed)

The code now automatically uses:
- **Sandbox**: When `NODE_ENV !== "production"` (development)
- **Production**: When `NODE_ENV === "production"` (live)

No code changes needed - just set `NODE_ENV=production` in your server environment.

---

## ✅ Pre-Deployment Verification

- [ ] **Backend**: Set `NODE_ENV=production` in server environment
- [ ] **Backend**: Set `FRONTEND_URL` to production frontend domain
- [ ] **Backend**: Set `BACKEND_URL` to production backend domain
- [ ] **Backend**: Set `SSLCOMMERZ_MODE=sandbox` (or `live` if store is approved)
- [ ] **Backend**: Set SSLCommerz credentials (`SSLCOMMERZ_STORE_ID`, `SSLCOMMERZ_STORE_PASSWD`)
- [ ] **Backend**: Update CORS origins to include production frontend URL
- [ ] **Client**: Set `VITE_API_URL` environment variable to production backend
- [ ] **SSLCommerz**: Verify Store ID and Password are correct in merchant dashboard
- [ ] **SSLCommerz**: Ensure store is active (sandbox for testing, live for production)
- [ ] **SSLCommerz**: Configure IPN URL (optional - only if you add IPN endpoint later)
- [ ] **Database**: Ensure production MongoDB connection string is set
- [ ] **JWT_SECRET**: Use a strong, random secret (not the default)
- [ ] **Email**: Verify SMTP credentials work in production

---

## 🧪 Testing After Deployment

1. **Test Payment Flow**:
   - Create a payment (small amount: 10 BDT)
   - Complete payment on SSLCommerz
   - Verify redirect to success page
   - Check database: payment status should be "success"

2. **Test IPN Validation**:
   - Check server logs for IPN validation
   - Verify payments can't be spoofed

3. **Test Authentication**:
   - Login → Create payment → Verify `userId` is attached

---

## 📝 Notes

- **Sandbox vs Live gateway**: Controlled by `SSLCOMMERZ_MODE`
  - `SSLCOMMERZ_MODE=sandbox` → always use sandbox gateway (safe for testing, even on live site)
  - `SSLCOMMERZ_MODE=live` → use live gateway (`securepay.sslcommerz.com`) – requires approved live store + live credentials
- **IPN URL**: Optional but recommended for missed payment notifications
- **SSLCommerz**: Production (live) credentials are different from sandbox
- **Environment Variables**: Never commit `.env` files to git
- **CORS**: Must include exact production frontend URL (with protocol)

---

## 🚨 Common Issues

1. **Payment callbacks fail**: Check `BACKEND_URL` is correct and accessible
2. **CORS errors**: Add production frontend URL to CORS origins
3. **IPN validation fails**: Verify SSLCommerz credentials are production (not sandbox)
4. **Client can't reach API**: Check `VITE_API_URL` is set correctly
