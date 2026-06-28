# 🚀 Quick Setup Guide - Authentication Enabled

## Prerequisites
- Node.js installed
- MongoDB running on `mongodb://localhost:27017`
- Redis (optional)

---

## ⚡ Quick Start (5 Minutes)

### Step 1: Install Backend Dependencies
```bash
cd backend
npm install
```

✅ This installs: bcryptjs, jsonwebtoken, twilio, and other dependencies

### Step 2: Create Default Admin
```bash
npm run seed
```

✅ Output:
```
✅ Default admin created successfully
Username: admin
Password: Admin@123
```

### Step 3: Start Backend
```bash
npm run dev
```

✅ Backend running on http://localhost:5000

### Step 4: Start Frontend (New Terminal)
```bash
cd frontend
npm run dev
```

✅ Frontend running on http://localhost:5173

### Step 5: Access Application
```
http://localhost:5173
```

✅ You'll be redirected to login page

### Step 6: Login
- **Username:** admin
- **Password:** Admin@123

✅ Success! You're now on the dashboard

---

## 🔑 Login Credentials

**Development:**
```
Username: admin
Password: Admin@123
```

**Change After First Login:**
- Use forgot password flow to set new password
- Or restart with: `npm run seed` (only in dev)

---

## 📁 File Structure

```
health-prediction-system/
├── backend/
│   ├── models/
│   │   ├── Admin.js           ← NEW: Admin credentials
│   │   └── Patient.js         ← UPDATED: Added mobile field
│   ├── controllers/
│   │   ├── authController.js  ← NEW: Authentication logic
│   │   └── patientController.js ← UPDATED: WhatsApp integration
│   ├── middleware/
│   │   └── authenticateToken.js ← NEW: JWT verification
│   ├── routes/
│   │   ├── authRoutes.js      ← NEW: Auth endpoints
│   │   └── patientRoutes.js   ← UPDATED: Protected routes
│   ├── services/
│   │   └── whatsappService.js ← NEW: WhatsApp integration
│   ├── seed.js                ← NEW: Create default admin
│   ├── server.js              ← UPDATED: Added auth routes
│   └── .env                   ← UPDATED: JWT & Twilio config
│
├── frontend/
│   ├── src/
│   │   ├── context/
│   │   │   └── AuthContext.jsx    ← NEW: Authentication state
│   │   ├── components/
│   │   │   └── ProtectedRoute.jsx ← NEW: Route protection
│   │   ├── pages/
│   │   │   ├── Login.jsx          ← NEW: Login form
│   │   │   ├── ForgotPassword.jsx ← NEW: Forgot password
│   │   │   ├── ResetPassword.jsx  ← NEW: Reset password
│   │   │   ├── AddPatient.jsx     ← UPDATED: Mobile field
│   │   │   └── EditPatient.jsx    ← UPDATED: Mobile field
│   │   ├── layouts/
│   │   │   └── MainLayout.jsx     ← UPDATED: Logout button
│   │   ├── services/
│   │   │   └── api.js             ← UPDATED: Auto auth header
│   │   └── App.jsx                ← UPDATED: Auth routing
│   └── [other files unchanged]
│
└── [documentation files]
```

---

## 🔒 Security Features Enabled

✅ **JWT Authentication** - Token-based session management
✅ **Password Hashing** - bcryptjs with 10 salt rounds
✅ **Protected Routes** - Require login to access dashboard
✅ **Auto-auth Headers** - Token sent with every API request
✅ **Token Expiration** - 7 days (configurable)
✅ **Forgot Password** - Reset token generation (30 min validity)
✅ **Mobile Validation** - 10-digit mobile number required
✅ **WhatsApp Integration** - Optional Twilio integration
✅ **Environment Variables** - Sensitive data in .env
✅ **Error Handling** - User-friendly error messages

---

## 📝 Environment Configuration

### Backend `.env` File:

```env
# Server
PORT=5000
MONGO_URI=mongodb://localhost:27017/health_prediction_db

# AI Prediction
GEMINI_API_KEY=
GEMINI_MODEL=gemini-1.0

# JWT Authentication
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES_IN=7d

# Twilio WhatsApp (Optional)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_FROM=+1234567890
```

### Default Values:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/health_prediction_db
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES_IN=7d
```

---

## 🌐 API Endpoints

### Public Endpoints (No Auth Required):
```
POST   /api/auth/login              - Login
POST   /api/auth/forgot-password    - Request password reset
POST   /api/auth/reset-password     - Reset password
```

### Protected Endpoints (Auth Required):
```
GET    /api/auth/verify             - Verify token
GET    /api/patients                - Get all patients
GET    /api/patients/:id            - Get single patient
POST   /api/patients                - Create patient
PUT    /api/patients/:id            - Update patient
DELETE /api/patients/:id            - Delete patient
POST   /api/predict                 - Generate prediction
```

---

## ✨ New Features

### 1. Authentication
- Admin login with username/email
- Secure password storage (bcryptjs)
- Session management with JWT

### 2. Password Recovery
- Forgot password flow
- Reset token generation (30-minute validity)
- Secure password reset

### 3. Mobile Number
- 10-digit validation
- Auto-filtering (only digits)
- Required field for patient creation
- Used for WhatsApp messaging

### 4. WhatsApp Integration
- Automatic message after patient save
- Contains: Name, Prediction, Recommendation
- Falls back gracefully if Twilio not configured
- Tracks: whatsappSent, whatsappError

### 5. Protected Routes
- Dashboard requires login
- Automatic redirect to login if session expires
- Token verification on every request

---

## 🧪 Testing the Features

### Test 1: Login
```
URL: http://localhost:5173/login
Username: admin
Password: Admin@123
Expected: Redirect to dashboard
```

### Test 2: Logout
```
Click logout button (top-right)
Expected: Redirect to login page
localStorage is cleared
```

### Test 3: Protected Route
```
Open console: localStorage.removeItem('authToken')
Visit: http://localhost:5173/
Expected: Redirect to login
```

### Test 4: Add Patient with Mobile
```
Go to: http://localhost:5173/add
Fill form with 10-digit mobile
Click "Save Patient"
Expected: Patient saved + WhatsApp logged
```

### Test 5: Forgot Password
```
Go to: http://localhost:5173/forgot-password
Enter: admin
Copy token shown
Go to: http://localhost:5173/reset-password
Paste token + new password
Expected: Redirect to login
Try login with new password
```

---

## 🐛 Common Issues & Fixes

### Issue: Cannot login (Invalid credentials)
```bash
# Solution 1: Reseed admin
cd backend
npm run seed

# Solution 2: Check MongoDB connection
# Ensure MongoDB is running
# Check MONGO_URI in .env
```

### Issue: "Module not found: bcryptjs"
```bash
# Solution: Install dependencies
cd backend
npm install
```

### Issue: "Invalid or expired token"
```bash
# Solution: Clear localStorage and login again
# Or check JWT_SECRET in .env matches backend
```

### Issue: Mobile validation error
```
# Ensure exactly 10 digits
# No hyphens, spaces, or +91
# Format: 9876543210
```

### Issue: Blank screen on login
```bash
# Check if frontend is running on port 5173
# Check if backend is running on port 5000
# Open browser console for errors
```

---

## 📚 Documentation Files

1. **AUTHENTICATION_IMPLEMENTATION.md** - Detailed implementation guide
2. **PROJECT_COMPLETION_REPORT.md** - Complete project status
3. **FIXES_AND_IMPROVEMENTS.md** - Previous bug fixes

---

## 🎯 Next Steps (Optional)

1. **Change Admin Password**
   - Use forgot password flow
   - Or update directly in MongoDB

2. **Configure Twilio** (For Production)
   - Create Twilio account
   - Get Account SID, Auth Token, WhatsApp Number
   - Add to .env file
   - Test WhatsApp messages

3. **Setup Email Notifications** (Enhancement)
   - Integrate SendGrid/Mailgun
   - Send password reset link via email
   - Send WhatsApp alternative via email

4. **Deploy Application**
   - Backend: Railway, Render, Heroku
   - Frontend: Vercel, Netlify, GitHub Pages
   - Database: MongoDB Atlas

---

## ⚙️ Configuration Options

### Change JWT Expiration:
```env
JWT_EXPIRES_IN=30d  # Change from 7d to 30 days
```

### Change JWT Secret:
```env
JWT_SECRET=your-new-super-secret-key
```

### Change Reset Token Validity:
Edit `backend/models/Admin.js`:
```javascript
this.resetTokenExpiry = Date.now() + 60 * 60 * 1000; // 60 minutes instead of 30
```

### Change Admin Username/Password:
```bash
# Option 1: Use seed.js
# Edit default values in seed.js

# Option 2: Update directly in MongoDB
# db.admins.updateOne({username: 'admin'}, {$set: {password: '...'}})
```

---

## 📞 Support & Troubleshooting

### Check Backend Logs:
```bash
# Terminal should show:
Server running on port 5000
Connected to MongoDB
```

### Check Frontend Logs:
```bash
# Press F12 in browser
# Go to Console tab
# Look for errors
```

### Check Database:
```bash
# MongoDB Compass or Mongo Shell
use health_prediction_db
db.admins.find()        # Check if admin exists
db.patients.find()      # Check patients with mobile field
```

---

## ✅ Installation Verification

After setup, verify:

- [ ] Backend running: http://localhost:5000 (check with browser)
- [ ] Frontend running: http://localhost:5173
- [ ] Can login with admin/Admin@123
- [ ] Can navigate to dashboard
- [ ] Can add patient with mobile number
- [ ] Logout works
- [ ] Forgot password page loads

---

## 🔒 Production Checklist

Before deploying to production:

- [ ] Change JWT_SECRET to strong, random value
- [ ] Change default admin username and password
- [ ] Enable HTTPS
- [ ] Setup environment variables on server
- [ ] Configure Twilio for WhatsApp (if needed)
- [ ] Setup email for password recovery
- [ ] Enable CORS only for your domain
- [ ] Setup error logging (Sentry, LogRocket)
- [ ] Setup monitoring and alerts
- [ ] Backup MongoDB regularly

---

*Last Updated: June 24, 2026*
*Version: 2.0 - Authentication Ready*
