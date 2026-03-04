# RENDER + VERCEL DEPLOYMENT CHECKLIST

## 🚀 DEPLOYMENT SETTINGS

### 📦 BACKEND (Render)
```env
NODE_ENV=production
PORT=3000
MONGO_URI=mongodb+srv://admin:admin321@cluster0.r8w5ryf.mongodb.net/avto_elon?appName=Cluster0
ACCESS_TOKEN_KEY=MY_ACCESS_TOKEN_KEY
REFRESH_TOKEN_KEY=REFRESH_TOKEN_KEY
CORS_ORIGINS=https://5-exam-full.vercel.app,https://*.vercel.app
COOKIE_SECURE=true
PUBLIC_ORIGIN=https://five-exam-full.onrender.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=zoitovfirdavs3@gmail.com
SMTP_PASS=chsvrvtfhkhwrlgv
SMTP_FROM=5-Exam <zoitovfirdavs3@gmail.com>
ADMIN_EMAIL=zoitovfirdavs3@gmail.com
```

### 📦 FRONTEND (Vercel)
```env
VITE_API_BASE_URL=https://five-exam-full.onrender.com/api
VITE_ASSET_BASE_URL=https://five-exam-full.onrender.com
```

---

## 🔧 CHANGED FILES

### ✅ Backend Files
1. **backend/src/server.js**
   - Added `app.set("trust proxy", 1)` for Render
   - Enhanced CORS configuration
   - Static files with proper headers

2. **backend/src/controllers/car.controller.js**
   - Updated to use `PUBLIC_ORIGIN` for imageUrl
   - All endpoints (list, create, update) return proper URLs

3. **backend/src/controllers/auth.controller.js**
   - Environment-aware cookie settings
   - SameSite: "none" for production, "lax" for local
   - Secure: true for production, false for local

4. **backend/.env**
   - Added `PUBLIC_ORIGIN=https://five-exam-full.onrender.com`
   - Updated `CORS_ORIGINS` for Vercel domains

### ✅ Frontend Files
1. **frontend/src/components/CarCard.jsx**
   - Uses `car.imageUrl` from backend
   - No hardcoded URLs

2. **frontend/src/pages/CarDetails.jsx**
   - Uses `car.imageUrl` from backend
   - No hardcoded URLs

3. **frontend/src/api.js**
   - Uses `VITE_API_BASE_URL` environment variable
   - `withCredentials: true` for cookies

4. **frontend/.env**
   - `VITE_API_BASE_URL=https://five-exam-full.onrender.com/api`
   - `VITE_ASSET_BASE_URL=https://five-exam-full.onrender.com`

---

## 🧪 DEPLOYMENT TEST CHECKLIST

### ✅ 1️⃣ CORS Test
```bash
# Browser DevTools → Network
# Login request should show:
# OPTIONS /api/auth/login → 204/200
# POST /api/auth/login → 200
# Response headers:
# Access-Control-Allow-Origin: https://5-exam-full.vercel.app
# Access-Control-Allow-Credentials: true
```

### ✅ 2️⃣ Cookie Test
```bash
# Browser DevTools → Application → Cookies
# Should show:
# Domain: five-exam-full.onrender.com
# Name: refresh_token
# SameSite: None
# Secure: true
# HttpOnly: true
```

### ✅ 3️⃣ Image Test
```bash
# Direct image URL should work:
# https://five-exam-full.onrender.com/uploads/car_123.jpg
# Cards should show images (not "No image")
```

### ✅ 4️⃣ API Test
```bash
# All API calls should go to Render:
# https://five-exam-full.onrender.com/api/*
# No localhost:3000 requests
```

---

## ⚠️ COMMON ERRORS & SOLUTIONS

### ❌ "Frontend still requests localhost:3000"
**Cause**: Environment variables not set correctly or build cache
**Solution**: 
1. Check Vercel environment variables
2. Clear build cache: `vercel --prod --force`
3. Check for hardcoded URLs in code

### ❌ "CORS error on login"
**Cause**: CORS origins not configured correctly
**Solution**:
1. Verify `CORS_ORIGINS` includes Vercel domain
2. Check `credentials: true` is set
3. Ensure preflight OPTIONS work

### ❌ "Cookies not working"
**Cause**: Cookie settings not cross-domain compatible
**Solution**:
1. Set `SameSite: None` for production
2. Set `Secure: true` for production
3. Ensure `trust proxy` is set

### ❌ "Images not loading"
**Cause**: Image URLs not absolute or CORS issues
**Solution**:
1. Use `PUBLIC_ORIGIN` for absolute URLs
2. Check `/uploads` static route
3. Verify CORS headers for static files

---

## 🎯 FINAL VERIFICATION

### ✅ Production Flow:
1. **User visits**: https://5-exam-full.vercel.app
2. **Login request**: https://five-exam-full.onrender.com/api/auth/login
3. **Cookie set**: On Render domain with SameSite=None
4. **API calls**: All go to Render with credentials
5. **Images**: Load from https://five-exam-full.onrender.com/uploads/
6. **No localhost**: No requests to localhost:3000

### ✅ Success Indicators:
- ✅ Login works without CORS errors
- ✅ Refresh token cookie persists
- ✅ Images load correctly
- ✅ All API calls go to Render
- ✅ No console errors
- ✅ Responsive design works

---

## 🚀 DEPLOY COMMANDS

### Backend (Render):
```bash
# Push to main branch
git add .
git commit -m "Fix CORS and cookies for production"
git push origin main
# Render auto-deploys
```

### Frontend (Vercel):
```bash
# Push to main branch
git add .
git commit -m "Fix environment variables for production"
git push origin main
# Vercel auto-deploys
```

---

## 📞 SUPPORT

If issues persist:
1. Check Render logs for CORS errors
2. Check Vercel build logs for env variables
3. Use browser DevTools Network tab
4. Verify all environment variables are set
5. Clear browser cache and re-test
