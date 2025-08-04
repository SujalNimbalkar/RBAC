# RBAC3 Frontend

A React TypeScript frontend with Firebase authentication and Asana-like dashboard for the RBAC3 task management system.

## Features

- 🔐 **Firebase Authentication** - Secure login/signup with email/password
- 📊 **Asana-like Dashboard** - Modern task management interface
- 🎨 **Responsive Design** - Works on desktop, tablet, and mobile
- 🔄 **Real-time Updates** - Live task status updates
- 🎯 **Role-based Access** - Different views based on user roles
- 📱 **Modern UI/UX** - Clean, intuitive interface

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Firebase Configuration

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication (Email/Password)
3. Copy your Firebase config from Project Settings
4. Update `src/config/firebase.ts` with your configuration

### 3. Environment Variables

Create a `.env` file in the frontend directory:

```
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=your-app-id
```

### 4. Start Development Server

```bash
npm start
```

The app will be available at http://localhost:3000

## Project Structure

```
src/
├── components/
│   ├── auth/
│   │   ├── LoginPage.tsx          # Login/Signup form
│   │   ├── LoginPage.css          # Login page styles
│   │   └── ProtectedRoute.tsx     # Route protection
│   └── dashboard/
│       ├── Dashboard.tsx           # Main dashboard
│       └── Dashboard.css           # Dashboard styles
├── contexts/
│   └── AuthContext.tsx            # Firebase auth context
├── config/
│   └── firebase.ts                # Firebase configuration
└── App.tsx                        # Main app component
```

## Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

## Authentication Flow

1. **Login Page** - User enters email/password
2. **Firebase Auth** - Validates credentials
3. **Dashboard** - Redirects to main interface
4. **Protected Routes** - Ensures authenticated access
5. **Logout** - Clears session and redirects to login

## Dashboard Features

- **My Tasks** - View assigned tasks with status and priority
- **Projects** - Manage project workflows (coming soon)
- **Procedures** - Handle IATF 16949 procedures (coming soon)
- **Reports** - Analytics and reporting (coming soon)

## Development

### Adding New Components

1. Create component in appropriate directory
2. Add TypeScript interfaces for props
3. Include CSS module or styled component
4. Update routing if needed

### Styling Guidelines

- Use CSS modules or styled-components
- Follow BEM methodology for class names
- Maintain responsive design principles
- Use consistent color scheme and typography

### State Management

- Use React Context for global state
- Local state for component-specific data
- Consider Redux for complex state (future)

## Deployment

### Build for Production

```bash
npm run build
```

### Environment Setup

- Set production Firebase config
- Configure environment variables
- Update API endpoints for production

## Contributing

1. Follow TypeScript best practices
2. Write meaningful component names
3. Include proper error handling
4. Test on multiple devices
5. Document new features

## Troubleshooting

### Common Issues

**Firebase Configuration Error**

- Check environment variables
- Verify Firebase project settings
- Ensure Authentication is enabled

**TypeScript Errors**

- Run `npm run build` to check types
- Fix interface mismatches
- Update type definitions

**Styling Issues**

- Check CSS class names
- Verify responsive breakpoints
- Test on different screen sizes
