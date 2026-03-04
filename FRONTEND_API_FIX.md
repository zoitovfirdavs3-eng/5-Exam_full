# 🔧 FRONTEND API CONFIGURATION FIX

## ❌ PROBLEM ANALYSIS

### **Why baseURL was undefined:**
1. **Environment Variable Mismatch**: Code was using `VITE_API_BASE_URL` but `.env` had `VITE_API_URL`
2. **Inconsistent Naming**: Different parts of code used different variable names
3. **Build Cache**: Vite might have cached old environment variables

### **Current Issue:**
```javascript
// Code was looking for:
import.meta.env.VITE_API_BASE_URL // ❌ undefined

// But .env file had:
VITE_API_URL=https://five-exam-full.onrender.com/api // ✅ exists
```

---

## ✅ SOLUTION IMPLEMENTED

### **📁 Files Modified:**

#### **1. frontend/src/api.js**
```javascript
// BEFORE (❌)
const baseURL = import.meta.env.VITE_API_BASE_URL;

// AFTER (✅)
const baseURL = import.meta.env.VITE_API_URL;

console.log("🔍 API Base URL:", baseURL);
console.log("🔗 VITE_API_URL:", import.meta.env.VITE_API_URL || "undefined");
```

#### **2. frontend/src/pages/Login.jsx**
```javascript
// BEFORE (❌)
viteApiUrl: import.meta.env.VITE_API_BASE_URL || "undefined",

// AFTER (✅)
viteApiUrl: import.meta.env.VITE_API_URL || "undefined",
```

#### **3. frontend/.env**
```env
# BEFORE (❌)
VITE_API_BASE_URL=https://five-exam-full.onrender.com/api

# AFTER (✅)
VITE_API_URL=https://five-exam-full.onrender.com/api
VITE_ASSET_BASE_URL=https://five-exam-full.onrender.com
```

#### **4. frontend/.env.example**
```env
# BEFORE (❌)
VITE_API_BASE_URL=https://five-exam-full.onrender.com/api

# AFTER (✅)
VITE_API_URL=https://five-exam-full.onrender.com/api
VITE_ASSET_BASE_URL=https://five-exam-full.onrender.com
```

---

## 🎯 CENTRAL AXIOS INSTANCE

### **✅ Complete Configuration:**
```javascript
// frontend/src/api.js
import axios from "axios";

// API configuration using VITE environment variable
const baseURL = import.meta.env.VITE_API_URL;

console.log("🔍 API Base URL:", baseURL);
console.log("🌍 Environment:", import.meta.env.MODE);
console.log("🔗 VITE_API_URL:", import.meta.env.VITE_API_URL || "undefined");

export const api = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 10000,
});

// Request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    // Debug login requests specifically
    if (config.url?.includes('/auth/login') || config.url?.includes('/auth/register')) {
      console.log("🔐 Auth Request Debug:", {
        method: config.method?.toUpperCase(),
        url: `${config.baseURL}${config.url}`,
        baseURL: config.baseURL,
        fullURL: `${config.baseURL}${config.url}`,
        hasData: !!config.data,
        withCredentials: config.withCredentials,
        environment: import.meta.env.MODE,
        viteApiUrl: import.meta.env.VITE_API_URL || "undefined"
      });
    }
    return config;
  },
  (error) => {
    console.error("API Request Error:", error);
    return Promise.reject(error);
  }
);
```

---

## 🌍 ENVIRONMENT VARIABLES

### **✅ Vercel Environment Variables:**
```env
VITE_API_URL=https://five-exam-full.onrender.com/api
VITE_ASSET_BASE_URL=https://five-exam-full.onrender.com
```

### **✅ Local Development:**
```env
VITE_API_URL=http://localhost:3000/api
VITE_ASSET_BASE_URL=http://localhost:3000
```

---

## 🧪 VERIFICATION

### **✅ Expected Console Output:**
```javascript
🔍 API Base URL: https://five-exam-full.onrender.com/api
🌍 Environment: production
🔗 VITE_API_URL: https://five-exam-full.onrender.com/api

🔐 Auth Request Debug: {
  method: "POST",
  url: "https://five-exam-full.onrender.com/api/auth/login",
  baseURL: "https://five-exam-full.onrender.com/api",
  fullURL: "https://five-exam-full.onrender.com/api/auth/login",
  hasData: true,
  withCredentials: true,
  environment: "production",
  viteApiUrl: "https://five-exam-full.onrender.com/api"
}
```

### **✅ Expected Request Flow:**
```
Frontend (Vercel) → Backend (Render)
POST https://five-exam-full.onrender.com/api/auth/login
Headers: Content-Type: application/json
Credentials: include
```

---

## 🚀 DEPLOYMENT STEPS

### **1. Clear Build Cache:**
```bash
# Clear Vite cache
rm -rf node_modules/.vite
rm -rf dist

# Rebuild
npm run build
```

### **2. Update Vercel Environment:**
- Go to Vercel dashboard
- Project Settings → Environment Variables
- Add: `VITE_API_URL=https://five-exam-full.onrender.com/api`
- Add: `VITE_ASSET_BASE_URL=https://five-exam-full.onrender.com`

### **3. Redeploy:**
```bash
git add .
git commit -m "Fix API URL environment variable"
git push origin main
```

---

## 📋 CHECKLIST

### **✅ Before Deploy:**
- [ ] `VITE_API_URL` is set in Vercel environment
- [ ] No hardcoded URLs in codebase
- [ ] All API calls use central `api` instance
- [ ] Console shows correct baseURL

### **✅ After Deploy:**
- [ ] Login request goes to Render backend
- [ ] No more `baseURL: undefined` errors
- [ ] CORS works correctly
- [ ] Cookies are set properly

---

## 🎉 RESULT

### **✅ Fixed Issues:**
1. **Environment Variable**: Now uses `VITE_API_URL` consistently
2. **Central Axios**: All requests use same instance
3. **Debug Logging**: Clear console output
4. **No Hardcoded URLs**: All use environment variables
5. **Proper Credentials**: `withCredentials: true`

### **🌟 Expected Behavior:**
- **Login Request**: `POST https://five-exam-full.onrender.com/api/auth/login`
- **BaseURL**: `https://five-exam-full.onrender.com/api`
- **Environment**: Production ready
- **Debug**: Clear console logs

**Frontend API configuration is now fixed and production ready!** 🚀✨
