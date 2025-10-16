# 🧭 HRM Software – Location-based Employee Attendance Management System

A secure and modular **backend API** for a Human Resource Management (HRM) system that allows **Admins** to manage employees and **Employees** to mark their attendance with **live geolocation tracking**.  
Built using **Node.js**, **Express.js**, and **MongoDB Atlas**, with JWT-based authentication and Swagger documentation.

---

## 🚀 Features

### 👤 Authentication & Roles
- Register and Login APIs for Admins and Employees
- JWT Authentication with **Access & Refresh Tokens**
- Password hashing with **bcrypt**
- Role-based Access Control (Admin / Employee)

### 🧑‍💼 Employee Management (Admin only)
- Create, View, Update, and Delete Employees  
- Set Office Location (Latitude, Longitude, Radius in meters)  
- Paginated & searchable employee list  

### ⏱️ Attendance Management
#### Employee:
- Check-in / Check-out with current geolocation  
- Validates location using **Haversine Formula** (must be within allowed radius)  
- View personal attendance history (paginated)

#### Admin:
- View all attendance records with filters (employee, date, department)  
- Daily summary (present, absent, late entries)  
- Export attendance report as **JSON/CSV**

### 📊 General APIs (Both Roles)
- Get user profile  
- Dashboard summary  
  - **Admin:** Total employees, attendance overview  
  - **Employee:** Personal attendance stats  

---

## 🧩 Tech Stack

| Component | Technology |
|------------|-------------|
| Backend Framework | Node.js + Express.js |
| Database | MongoDB Atlas |
| Authentication | JWT (Access & Refresh Tokens) |
| Validation | Joi / express-validator |
| Password Hashing | bcrypt |
| Geolocation Validation | Haversine formula / geolib |
| Deployment | Render |
| Documentation | Swagger UI |

---

## 📁 Folder Structure

HRM_Backend/
│
├── controllers/ # Handles core logic for each route
│ ├── authController.js
│ ├── employeeController.js
│ ├── adminController.js
│ └── attendanceController.js
│
├── routes/ # API route definitions
│ ├── authRoutes.js
│ ├── adminRoutes.js
│ ├── employeeRoutes.js
│ └── attendanceRoutes.js
│
├── models/ # MongoDB schemas
│ ├── User.js
│ ├── Attendance.js
│ └── Config.js
│
├── middlewares/ # Auth, validation, role-based checks
│ ├── authMiddleware.js
│ ├── roleMiddleware.js
│ └── errorHandler.js
│
├── utils/ # Helper utilities
│ ├── generateToken.js
│ ├── geolocationUtils.js
│ └── responseFormatter.js
│
├── config/ # Environment setup
│ └── db.js
│
├── swagger/ # Swagger configuration
│ └── swagger.json
│
├── .env.example # Sample environment variables
├── package.json
├── server.js # Application entry point
└── README.md


---

## ⚙️ Local Setup Guide

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/<your-username>/HRM_Backend.git
cd HRM_Backend
```
Step 2️⃣ – Install Dependencies
npm install

Step 3️⃣ – Create a .env File
# .env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret

Step 4️⃣ – Run the Server Locally
npm run dev

Step 5️⃣ – Deploy on Render
# Deployment Steps:

1. Push your code to a GitHub repository.

2. Create a free MongoDB Atlas cluster.
   - Get the connection string (MONGO_URI).
   - Whitelist IPs: 0.0.0.0/0

3. Go to https://render.com
   - Click “New Web Service” → “Build from GitHub”
   - Connect your repository

4. Set Render configuration:
   Build Command: npm install
   Start Command: npm start
   Environment: Node
   Region: Closest to your users
   Environment Variables: Add all from your .env file

5. Click “Deploy”.

# After deployment:
Base URL → https://hrm-backend-9qxz.onrender.com

