# EduManager — Modern Serverless School Management System

EduManager is a full-featured, enterprise-grade School Management System built with **React**, **Vite**, **Tailwind CSS**, and **MongoDB**, designed to run completely serverless on **Vercel**.

---

## 🚀 Key Features

- **Dashboard**: Real-time KPI statistics (students, faculty, classes, monthly revenue), interactive revenue trend bar charts, today's attendance breakdown pie charts, recent activity stream, and quick action shortcuts.
- **Student Information System**: Comprehensive student roster, student registration, profile viewing, roll number tracking, filtering by grade & status, and contact management.
- **Faculty & Teacher Management**: Teacher profiles, subject specializations, qualifications, experience, payroll tracking, and status monitoring.
- **Academic Classes & Sections**: Class/grade configuration, section allocation, designated class incharge teachers, capacity management, and curriculum subjects.
- **Attendance Tracker**: Dual-mode attendance system with interactive daily marking (Present / Late / Absent) with batch MongoDB upserts, quick batch marking, and detailed date-range attendance analytics.
- **Fee Management & Billing**: Student invoice generation, category breakdown (Tuition, Transport, Lab, Library, Exam), payment tracking, automated receipt numbering, printable branded receipts, and overdue tracking.
- **Role-Based Authentication**: Secure JWT-like cryptographic authentication with automated initial admin setup.

---

## 📁 Architecture Overview

```
├── api/                           # Vercel Serverless Functions
│   ├── lib/
│   │   ├── mongodb.js             # Cached MongoDB client connection
│   │   └── auth.js                # Token verification, password hashing, CORS
│   ├── auth/
│   │   ├── login.js               # POST login & auto-seed default admin
│   │   ├── register.js            # POST user registration
│   │   └── me.js                  # GET current user session
│   ├── students/
│   │   ├── index.js               # GET (list/filter/paginate) & POST (create)
│   │   └── [id].js                # GET, PUT, DELETE student
│   ├── teachers/
│   │   ├── index.js               # GET (list/filter) & POST (create)
│   │   └── [id].js                # GET, PUT, DELETE teacher
│   ├── classes/
│   │   ├── index.js               # GET (list/filter) & POST (create)
│   │   └── [id].js                # GET, PUT, DELETE class
│   ├── attendance/
│   │   ├── index.js               # GET & POST (batch attendance upsert)
│   │   └── report.js              # GET aggregated attendance stats
│   ├── fees/
│   │   ├── index.js               # GET & POST (fee creation/payment)
│   │   └── [id].js                # GET, PUT, DELETE fee records
│   └── dashboard/
│       └── stats.js               # Aggregated KPI and chart metrics
│
├── src/                           # Frontend React SPA
│   ├── components/                # Reusable UI Components
│   │   ├── Layout.jsx             # Sidebar navigation + header layout
│   │   ├── StatsCard.jsx          # KPI card with trends
│   │   ├── DataTable.jsx          # Pagination, loading skeleton, actions
│   │   ├── Modal.jsx              # Backdrop blur animated modal
│   │   ├── FormField.jsx          # Text, select, date, textarea controls
│   │   ├── ConfirmDialog.jsx      # Delete / action confirm modals
│   │   ├── Badge.jsx              # Status badges (active, paid, late, etc.)
│   │   ├── SearchFilter.jsx       # Real-time search & dropdown filters
│   │   ├── LoadingSpinner.jsx     # Pulse & spin loading indicators
│   │   └── EmptyState.jsx         # Empty state illustration & actions
│   ├── context/
│   │   └── AuthContext.jsx        # Auth state provider and hooks
│   ├── pages/
│   │   ├── Login.jsx              # Branded login page
│   │   ├── Dashboard.jsx          # Analytics & metrics dashboard
│   │   ├── Students.jsx           # Student management
│   │   ├── Teachers.jsx           # Faculty management
│   │   ├── Classes.jsx            # Class & curriculum management
│   │   ├── Attendance.jsx         # Daily sheet & report analytics
│   │   └── Fees.jsx               # Invoices & printable receipts
│   ├── utils/
│   │   └── api.js                 # Unified fetch API client
│   ├── App.jsx                    # React Router 6 route declarations
│   ├── main.jsx                   # Entry mount point
│   └── index.css                  # Custom Tailwind components & themes
│
├── vercel.json                    # Serverless routing rules
├── tailwind.config.js             # Custom palette (#1B2A4A, #E8913A, #F5F5F0)
└── package.json
```

---

## 🛠️ Getting Started Locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Verify your `.env` file contains your MongoDB connection string and JWT secret:
```env
MONGODB_URI="mongodb+srv://<username>:<password>@cluster0.mongodb.net/?retryWrites=true&w=majority"
JWT_SECRET="your-jwt-secret-here"
```

### 3. Run Development Server
```bash
npm run dev
```

### 4. Default Credentials
- **Email**: `admin@school.com`
- **Password**: `admin123`
*(Auto-seeded into MongoDB on your first login attempt)*

---

## 🌐 Deploying to Vercel

1. Push this repository to GitHub, GitLab, or Bitbucket.
2. Go to [Vercel Dashboard](https://vercel.com/) and click **Add New Project**.
3. Import this repository. Vercel automatically detects Vite.
4. Under **Environment Variables**, add:
   - `MONGODB_URI`: your MongoDB Atlas connection string
   - `JWT_SECRET`: a random secure secret
5. Click **Deploy**. Vercel will build the React SPA and deploy all `/api` endpoints as serverless functions.

# school-management-live
