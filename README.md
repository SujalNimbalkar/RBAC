# RBAC3 - Production Planning System

A comprehensive full-stack application with React frontend and Node.js/Express backend for Role-Based Access Control (RBAC) management and automated production planning.

## 🚀 Features

### 🔐 Authentication & Authorization

- **Firebase Authentication** integration
- **Role-Based Access Control (RBAC)** system
- **Permission-based** feature access
- **JWT Token** management

### 📊 Production Planning System

- **Automated Monthly Production Plans** (Node Cron)
- **Weekly Production Plans** with quantity distribution
- **Daily Production Plans** with shift planning
- **Production Reports** with action plans
- **PDF & Excel Export** functionality

### 🎯 Task Management

- **Hierarchical Workflow**: Monthly → Weekly → Daily → Reports
- **Generic Naming System** (Day 1, Day 2, etc.)
- **Holiday & Sunday Handling**
- **Duplicate Prevention** mechanisms

### 📈 Database & Storage

- **MongoDB Atlas** integration
- **Mongoose ODM** for data modeling
- **Data Migration** from JSON to MongoDB
- **Real-time** data synchronization

## 🏗️ Project Structure

```
RBAC3/
├── frontend/                 # React TypeScript application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── types/          # TypeScript interfaces
│   └── public/             # Static assets
├── backend/                 # Node.js/Express TypeScript API
│   ├── src/
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── models/         # MongoDB schemas
│   │   ├── middleware/     # Express middleware
│   │   └── utils/          # Utility functions
│   └── scripts/            # Automation scripts
└── database/               # Database files and migrations
```

## ⚡ Quick Start

### 1. **Clone the Repository**

```bash
git clone <repository-url>
cd RBAC3
```

### 2. **Install Dependencies**

```bash
npm run install:all
```

### 3. **Environment Setup**

#### Backend Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database

# Firebase Configuration
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_auth_domain
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_storage_bucket
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

### 4. **Start Development Servers**

```bash
npm run dev
```

This will start:

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000

## 🛠️ Development Commands

### Frontend (React)

```bash
cd frontend
npm start          # Start development server
npm run build      # Build for production
npm test           # Run tests
```

### Backend (Node.js/Express)

```bash
cd backend
npm run dev        # Start development server with hot reload
npm run build      # Build TypeScript
npm start          # Start production server
```

## 📋 API Endpoints

### 🔐 Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/profile` - Get user profile

### 📊 Production Management

- `GET /api/production/monthly` - Get monthly plans
- `POST /api/production/monthly` - Create monthly plan
- `POST /api/production/monthly/:id/submit` - Submit monthly plan
- `GET /api/production/weekly` - Get weekly plans
- `POST /api/production/weekly/:id/submit` - Submit weekly plan
- `GET /api/production/daily` - Get daily plans
- `POST /api/production/daily/:id/approve` - Approve daily plan

### 📄 Reports & Downloads

- `GET /api/production/monthly/:id/download/pdf` - Download monthly plan PDF
- `GET /api/production/monthly/:id/download/excel` - Download monthly plan Excel
- `GET /api/production/weekly/:id/download/pdf` - Download weekly plan PDF
- `GET /api/production/daily/:id/download/pdf` - Download daily plan PDF

### ⏰ Cron Management

- `GET /api/cron/status` - Get cron service status
- `POST /api/cron/trigger/monthly` - Manually trigger monthly plan

### 📋 Task Management

- `GET /api/production/tasks` - Get all tasks
- `DELETE /api/production/tasks/:id` - Delete task

## 🔄 Production Planning Workflow

### 1. **Automated Monthly Plan Creation**

- **Schedule**: 4th of every month at 17:00 IST
- **Creates**: Empty monthly plan for next month
- **Assigns**: Production Manager
- **Status**: Pending (ready for user input)

### 2. **Monthly Plan Submission**

- **User adds**: Production items and quantities
- **System creates**: 4 weekly plans automatically
- **Distributes**: Monthly quantities across weeks
- **Creates**: Weekly tasks for each plan

### 3. **Weekly Plan Submission**

- **User reviews**: Weekly quantities
- **System creates**: 7 daily plans automatically
- **Distributes**: Weekly quantities across days
- **Creates**: Daily tasks for each plan

### 4. **Daily Plan Approval**

- **Production Manager**: Reviews daily plan
- **System creates**: Daily production report
- **Creates**: Report task for completion
- **Updates**: Task status to completed

## 🎯 Key Features

### ✅ **Generic Naming System**

- **Monthly**: "Monthly Production Plan - September 2025"
- **Weekly**: "Weekly Production Plan - Week 1"
- **Daily**: "Daily Production Plan - Day 1 (Week 1)"
- **Benefits**: No date conflicts, handles holidays/Sundays

### ✅ **Automated Scheduling**

- **Node Cron**: Automated monthly plan creation
- **Timezone**: Asia/Kolkata (IST)
- **Duplicate Prevention**: Checks existing plans
- **Manual Triggers**: For testing and emergencies

### ✅ **Data Export**

- **PDF Generation**: Using pdfkit
- **Excel Generation**: Using exceljs
- **Formats**: Monthly, Weekly, Daily plans
- **Headers**: Company information and timestamps

### ✅ **MongoDB Integration**

- **Atlas Cloud**: Scalable cloud database
- **Mongoose ODM**: Type-safe data modeling
- **Migration Scripts**: JSON to MongoDB conversion
- **Real-time**: Live data synchronization

## 🧪 Testing Scripts

### Backend Testing

```bash
cd backend
npm run test-cron-service      # Test cron service
npm run test-monthly-creation # Test monthly plan creation
npm run test-generic-naming   # Test generic naming system
npm run cleanup-all-production # Clean all production data
```

## 📦 Available Scripts

### Root Level

- `npm run dev` - Start both frontend and backend
- `npm run dev:frontend` - Start only frontend
- `npm run dev:backend` - Start only backend
- `npm run build` - Build both frontend and backend
- `npm run install:all` - Install dependencies for all packages

### Backend Scripts

- `npm run dev` - Start development server
- `npm run build` - Build TypeScript
- `npm start` - Start production server
- `npm run test-cron-service` - Test cron functionality
- `npm run cleanup-all-production` - Clean production data

## 🔧 Technology Stack

### Frontend

- **React 18** with TypeScript
- **Create React App** for build tooling
- **Axios** for API communication
- **React Router** for navigation

### Backend

- **Node.js** with Express
- **TypeScript** for type safety
- **MongoDB Atlas** with Mongoose
- **Firebase Authentication**
- **Node Cron** for scheduling
- **PDFKit & ExcelJS** for exports

### Development Tools

- **Nodemon** for hot reloading
- **ESLint** for code linting
- **TypeScript** compiler
- **CORS** for cross-origin requests

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@blackcat.in or create an issue in the repository.

---

**Built with ❤️ by the RBAC3 Team**
