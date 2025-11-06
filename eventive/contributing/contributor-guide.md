# Frontend Contributor Guide

Welcome to the Eventive frontend project! This guide will help you understand the codebase, development workflow, and best practices.

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Quick Start](#quick-start)
- [Project Architecture](#project-architecture)
- [Key Files & What They Do](#key-files--what-they-do)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Component Guidelines](#component-guidelines)
- [State Management](#state-management)
- [Styling Guide](#styling-guide)
- [Testing](#testing)
- [Common Tasks](#common-tasks)
- [Troubleshooting](#troubleshooting)

## Project Overview

**Eventive** is a modern React application built with TypeScript, featuring:
- 🔐 **Authentication**: Supabase Auth with OAuth (Google, Discord)
- 🎨 **Modern UI**: Custom CSS with design system
- ⚡ **Fast Build**: Vite with Rolldown bundler
- 🛣️ **Routing**: React Router v7
- 🎯 **Type Safety**: Full TypeScript coverage
- 🐳 **Containerized**: Docker support for deployment

### Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.1.0 | UI framework |
| TypeScript | 5.9.2 | Type safety |
| Vite | 7.1.0 | Build tool |
| React Router | 7.9.0 | Client-side routing |
| Supabase JS | 2.78.3 | Backend integration |
| ESLint | 9.18.0 | Code linting |

## Quick Start

### Prerequisites

- Node.js 20.x or higher
- npm or pnpm
- Git
- Supabase account (for auth/database)

### Setup

```bash
# Clone the repository
git clone https://github.com/127msafran/tsa-repository.git
cd tsa-repository

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Add your Supabase credentials to .env
# VITE_SUPABASE_URL=your-project-url
# VITE_SUPABASE_ANON_KEY=your-anon-key

# Start development server
npm run dev
```

Visit `http://localhost:5173` to see the app.

## Project Architecture

### Directory Structure

```
tsa-repository/
├── src/                    # Source code
│   ├── components/         # Reusable React components
│   ├── contexts/          # React Context providers
│   ├── lib/               # Utility functions & clients
│   ├── pages/             # Page-level components
│   ├── styles/            # CSS stylesheets
│   ├── types/             # TypeScript type definitions
│   ├── App.tsx            # Root component with routing
│   ├── main.tsx           # Application entry point
│   └── index.css          # Global styles
├── public/                # Static assets
├── docs/                  # Documentation
├── scripts/               # Build and utility scripts
├── vite.config.ts         # Vite configuration
├── tsconfig.json          # TypeScript configuration
├── eslint.config.js       # ESLint configuration
└── package.json           # Dependencies and scripts
```

### Architecture Principles

1. **Component-Based**: UI broken into reusable components
2. **Context for State**: Global state managed via React Context
3. **Type-Safe**: Full TypeScript coverage with strict mode
4. **API Layer**: Centralized API client for backend communication
5. **Route Protection**: Authentication guards on protected routes

## Key Files & What They Do

### Entry Points

#### `src/main.tsx`
**Purpose**: Application entry point

**What it does**:
- Renders the root `<App />` component
- Wraps app with `<StrictMode>` for development warnings
- Mounts the application to the DOM (`#root` div)

```typescript
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

#### `src/App.tsx`
**Purpose**: Root component with routing and providers

**What it does**:
- Sets up React Router with all application routes
- Wraps app with `AuthProvider` for authentication state
- Wraps app with `ToastProvider` for notifications
- Defines protected and public routes

**Routes**:
- `/` - Home page (protected)
- `/login` - Login page (public)
- `/account` - Account settings (protected)
- `/settings` - User settings (protected)

```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/home';
import Login from './pages/login';
import Account from './pages/account';
import Settings from './pages/settings';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
```

### Core Library Files

#### `src/lib/supabaseClient.ts`
**Purpose**: Supabase client singleton

**What it does**:
- Creates and exports a configured Supabase client
- Reads Supabase URL and anon key from environment variables
- Used throughout the app for auth, database, and storage

**Usage**:
```typescript
import { supabase } from '@/lib/supabaseClient';

// Sign in
const { data } = await supabase.auth.signInWithPassword({ email, password });

// Query database
const { data } = await supabase.from('profiles').select('*');
```

#### `src/lib/apiClient.ts`
**Purpose**: Axios HTTP client for backend API

**What it does**:
- Creates Axios instance with base URL
- Automatically adds authentication token to requests
- Handles token refresh and logout on 401 errors
- Includes request/response interceptors

**Key Features**:
- Base URL: `http://localhost:3000/api`
- Auto-attaches `Authorization: Bearer <token>`
- Refreshes expired tokens automatically
- Redirects to login on auth failure

```typescript
import apiClient from '@/lib/apiClient';

// GET request
const response = await apiClient.get('/users/me');

// POST request
const response = await apiClient.post('/settings', { theme: 'dark' });
```

#### `src/lib/avatarUpload.ts`
**Purpose**: Avatar upload utility

**What it does**:
- Validates image files (type, size, dimensions)
- Resizes images to 400x400 using canvas
- Uploads to backend `/uploads/avatar` endpoint
- Returns the new avatar URL

**Validation**:
- Max size: 5MB
- Allowed types: PNG, JPEG, GIF, WebP
- Auto-resize to 400x400px

```typescript
import { uploadAvatar } from '@/lib/avatarUpload';

const newAvatarUrl = await uploadAvatar(file);
```

### Context Providers

#### `src/contexts/AuthContext.tsx`
**Purpose**: Global authentication state management

**What it does**:
- Manages user authentication state
- Provides login, logout, and session refresh functions
- Implements session caching (5-minute cache)
- Listens for auth state changes from Supabase
- Provides loading states during auth operations

**Exported Values**:
```typescript
interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}
```

**Usage**:
```typescript
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, loading, signIn, signOut } = useAuth();
  
  if (loading) return <Spinner />;
  if (!user) return <Login />;
  
  return <div>Welcome {user.email}</div>;
}
```

#### `src/contexts/ToastContext.tsx`
**Purpose**: Global toast notification system

**What it does**:
- Manages toast notifications (success, error, info, warning)
- Auto-dismisses toasts after 5 seconds
- Allows manual dismissal
- Queues multiple toasts

**Exported Values**:
```typescript
interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}
```

**Usage**:
```typescript
import { useToast } from '@/contexts/ToastContext';

function MyComponent() {
  const { showToast } = useToast();
  
  const handleSuccess = () => {
    showToast('Profile updated!', 'success');
  };
  
  const handleError = () => {
    showToast('Something went wrong', 'error');
  };
}
```

### Components

#### `src/components/navbar.tsx`
**Purpose**: Application navigation bar

**What it does**:
- Displays app logo and navigation links
- Shows user avatar (if logged in)
- Provides logout button
- Responsive mobile menu

**Features**:
- Links to Home, Account, Settings
- User dropdown with avatar
- Logout functionality
- Mobile-friendly hamburger menu

#### `src/components/ProtectedRoute.tsx`
**Purpose**: Authentication guard for routes

**What it does**:
- Checks if user is authenticated
- Redirects to `/login` if not authenticated
- Shows loading spinner during auth check
- Renders children if authenticated

**Usage**:
```typescript
<Route 
  path="/account" 
  element={
    <ProtectedRoute>
      <Account />
    </ProtectedRoute>
  } 
/>
```

#### `src/components/OnboardingModal.tsx`
**Purpose**: First-time user onboarding

**What it does**:
- Shows welcome modal for new users
- Collects full name via form
- Updates user profile
- Only shows once (checks localStorage)

**Flow**:
1. Check if user has completed onboarding (`localStorage`)
2. If not, show modal with welcome message
3. Collect full name from user
4. Save to profile via API
5. Mark onboarding as complete

#### `src/components/Spinner.tsx`
**Purpose**: Loading indicator

**What it does**:
- Displays animated spinner
- Centers on screen or inline
- Optional custom size and message

**Usage**:
```typescript
<Spinner />
<Spinner message="Loading..." />
```

#### `src/components/SkeletonLoader.tsx`
**Purpose**: Content placeholder during loading

**What it does**:
- Shows skeleton/shimmer UI while content loads
- Improves perceived performance
- Customizable width, height, and count

**Usage**:
```typescript
<SkeletonLoader width="200px" height="20px" count={3} />
```

#### `src/components/Toast.tsx`
**Purpose**: Toast notification component

**What it does**:
- Renders individual toast notifications
- Color-coded by type (success, error, info, warning)
- Auto-dismiss after timeout
- Manual close button
- Animated entrance/exit

### Pages

#### `src/pages/home.tsx`
**Purpose**: Main landing page (protected)

**What it does**:
- Displays welcome message with user's name
- Shows navigation cards to other pages
- Protected route (requires authentication)

#### `src/pages/login.tsx`
**Purpose**: Login and authentication page

**What it does**:
- Email/password login form
- OAuth login buttons (Google, Discord)
- Redirects to home after successful login
- Displays error messages for failed login

**Flow**:
1. User enters email/password
2. Submit calls `supabase.auth.signInWithPassword()`
3. On success, redirect to `/`
4. On error, show error message

**OAuth Flow**:
1. User clicks OAuth provider button
2. Redirect to provider (Google/Discord)
3. Provider redirects back with auth code
4. Supabase exchanges code for session
5. Redirect to `/`

#### `src/pages/account.tsx`
**Purpose**: User account management

**What it does**:
- Displays user profile information
- Avatar upload/delete functionality
- Full name editing
- Shows user email (read-only)

**Features**:
- Avatar preview with upload/delete buttons
- Inline editing for full name
- Real-time updates
- Success/error notifications

#### `src/pages/settings.tsx`
**Purpose**: Application settings

**What it does**:
- Theme selection (light/dark/auto)
- Notification preferences (email, push)
- Language selection
- Timezone selection
- Saves settings to backend

**Settings Structure**:
```typescript
interface UserSettings {
  theme: 'light' | 'dark' | 'auto';
  notifications: {
    email: boolean;
    push: boolean;
  };
  language: string;
  timezone: string;
}
```

### Configuration Files

#### `vite.config.ts`
**Purpose**: Vite build configuration

**What it does**:
- Configures React plugin
- Sets up path aliases (`@/` → `src/`)
- Configures dev server (port, host, HMR)
- Optimizes production build

**Key Settings**:
- Dev server: `http://localhost:5173`
- Path alias: `@` → `./src`
- Build output: `./dist`

#### `tsconfig.json`
**Purpose**: TypeScript compiler configuration

**What it does**:
- Enables strict type checking
- Configures module resolution
- Sets up path aliases
- Defines compilation options

**Key Settings**:
- Strict mode: enabled
- Target: ES2020
- Module: ESNext
- JSX: react-jsx

#### `eslint.config.js`
**Purpose**: ESLint code quality rules

**What it does**:
- Enforces code style consistency
- Catches common errors
- Integrates with TypeScript
- React-specific linting rules

**Configured Rules**:
- TypeScript ESLint recommended
- React Hooks rules
- React Refresh rules
- Custom overrides for specific cases

#### `package.json`
**Purpose**: Project metadata and dependencies

**Scripts**:
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run type-check   # Check TypeScript types
```

**Key Dependencies**:
- React 19.1.0
- TypeScript 5.9.2
- Vite 7.1.0
- Supabase 2.78.3
- React Router 7.9.0

### Docker Files

#### `Dockerfile`
**Purpose**: Container image definition

**What it does**:
- Multi-stage build for optimization
- Installs dependencies
- Builds production bundle
- Serves with nginx

**Stages**:
1. **Build**: Install deps, compile TypeScript, bundle with Vite
2. **Production**: Copy build artifacts, serve with nginx

#### `docker-compose.yml`
**Purpose**: Multi-container orchestration

**What it does**:
- Defines frontend service
- Sets environment variables
- Maps ports (80:80)
- Configures volumes

**Usage**:
```bash
docker-compose up --build
```

## Development Workflow

### Branch Strategy

```bash
main            # Production-ready code
  ├── develop   # Integration branch
  │   ├── feature/your-feature
  │   ├── bugfix/your-fix
  │   └── hotfix/critical-fix
```

### Creating a Feature

```bash
# 1. Create feature branch from develop
git checkout develop
git pull origin develop
git checkout -b feature/add-user-settings

# 2. Make changes and commit
git add .
git commit -m "feat: add user settings page"

# 3. Push and create PR
git push origin feature/add-user-settings
# Create PR on GitHub: feature/add-user-settings → develop
```

### Commit Message Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add user settings page
fix: resolve avatar upload bug
docs: update contributor guide
style: format code with prettier
refactor: extract auth logic to hook
test: add unit tests for settings
chore: update dependencies
```

### Code Review Checklist

Before submitting PR:
- ✅ Code follows style guide
- ✅ TypeScript types are correct (no `any`)
- ✅ ESLint passes (`npm run lint`)
- ✅ Components are properly typed
- ✅ Tests pass (if applicable)
- ✅ No console errors/warnings
- ✅ Works on mobile/desktop
- ✅ Accessibility considerations

## Coding Standards

### TypeScript

**DO**: Use explicit types
```typescript
// ✅ Good
const fetchUser = async (id: string): Promise<User> => {
  const response = await apiClient.get<User>(`/users/${id}`);
  return response.data;
};
```

**DON'T**: Use `any`
```typescript
// ❌ Bad
const fetchUser = async (id: any): Promise<any> => {
  const response = await apiClient.get(`/users/${id}`);
  return response.data;
};
```

### Component Structure

```typescript
// 1. Imports
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import './MyComponent.css';

// 2. Types/Interfaces
interface MyComponentProps {
  title: string;
  onSave?: () => void;
}

// 3. Component
export default function MyComponent({ title, onSave }: MyComponentProps) {
  // 3a. Hooks
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  
  // 3b. Effects
  useEffect(() => {
    // Side effects
  }, []);
  
  // 3c. Handlers
  const handleClick = () => {
    // Event handlers
  };
  
  // 3d. Render
  return (
    <div className="my-component">
      <h1>{title}</h1>
      {/* JSX */}
    </div>
  );
}
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `UserProfile.tsx` |
| Hooks | camelCase with `use` prefix | `useAuth.ts` |
| Utilities | camelCase | `formatDate.ts` |
| Constants | UPPER_SNAKE_CASE | `MAX_FILE_SIZE` |
| Types/Interfaces | PascalCase | `User`, `AuthState` |
| CSS Classes | kebab-case | `.user-profile` |

### Import Order

```typescript
// 1. React imports
import { useState, useEffect } from 'react';

// 2. Third-party libraries
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// 3. Internal imports (contexts, lib, types)
import { useAuth } from '@/contexts/AuthContext';
import apiClient from '@/lib/apiClient';
import type { User } from '@/types/auth';

// 4. Components
import Navbar from '@/components/navbar';
import Spinner from '@/components/Spinner';

// 5. Styles
import './styles.css';
```

## Component Guidelines

### Props Interface

Always define props with TypeScript interface:

```typescript
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  children?: React.ReactNode;
}

export default function Button({ 
  label, 
  onClick, 
  variant = 'primary',
  disabled = false 
}: ButtonProps) {
  return (
    <button 
      className={`btn btn--${variant}`}
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </button>
  );
}
```

### Error Handling

```typescript
const [error, setError] = useState<string | null>(null);

const handleSubmit = async () => {
  setError(null);
  
  try {
    await apiClient.post('/endpoint', data);
  } catch (err) {
    if (axios.isAxiosError(err)) {
      setError(err.response?.data?.error?.message || 'Something went wrong');
    } else {
      setError('An unexpected error occurred');
    }
  }
};
```

### Loading States

```typescript
const [loading, setLoading] = useState(true);

useEffect(() => {
  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchData();
      setData(data);
    } finally {
      setLoading(false);
    }
  };
  
  loadData();
}, []);

if (loading) return <SkeletonLoader />;
```

## State Management

### When to Use Context

Use React Context for:
- ✅ Authentication state (user, session)
- ✅ Theme preferences
- ✅ Toast notifications
- ✅ Global UI state (modals, sidebar)

**DON'T** use Context for:
- ❌ Frequently changing data (use local state)
- ❌ Server data (use React Query or SWR)
- ❌ Form state (use local state)

### Local State

For component-specific state:

```typescript
const [name, setName] = useState('');
const [isOpen, setIsOpen] = useState(false);
```

### Server State

For data from API:

```typescript
const [user, setUser] = useState<User | null>(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchUser = async () => {
    const response = await apiClient.get('/users/me');
    setUser(response.data.data);
    setLoading(false);
  };
  
  fetchUser();
}, []);
```

## Styling Guide

### CSS Architecture

We use **CSS Modules** approach with organized stylesheets:

```
src/styles/
  ├── variables.css    # CSS custom properties
  ├── root.css         # Global reset and base styles
  ├── navbar.css       # Component-specific styles
  ├── login.css
  └── account.css
```

### CSS Variables

Define reusable values in `variables.css`:

```css
:root {
  /* Colors */
  --color-primary: #007bff;
  --color-secondary: #6c757d;
  --color-success: #28a745;
  --color-error: #dc3545;
  
  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  
  /* Typography */
  --font-family: 'Inter', sans-serif;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
}
```

### Component Styles

```css
/* navbar.css */
.navbar {
  display: flex;
  align-items: center;
  padding: var(--spacing-md);
  background: var(--color-primary);
  box-shadow: var(--shadow-md);
}

.navbar__logo {
  font-size: var(--font-size-lg);
  font-weight: bold;
  color: white;
}

.navbar__menu {
  display: flex;
  gap: var(--spacing-md);
  margin-left: auto;
}
```

### Responsive Design

Use mobile-first approach:

```css
/* Mobile first (default) */
.container {
  padding: var(--spacing-sm);
}

/* Tablet and up */
@media (min-width: 768px) {
  .container {
    padding: var(--spacing-md);
  }
}

/* Desktop and up */
@media (min-width: 1024px) {
  .container {
    padding: var(--spacing-lg);
    max-width: 1200px;
    margin: 0 auto;
  }
}
```

## Testing

### Manual Testing

Before submitting PR, test:

1. **Authentication Flow**
   - Login with email/password
   - Login with OAuth (Google, Discord)
   - Logout
   - Session persistence (refresh page)

2. **Protected Routes**
   - Try accessing `/account` without login → redirects to `/login`
   - Login → redirect back to protected route

3. **User Actions**
   - Upload avatar
   - Update profile name
   - Change settings
   - All toast notifications appear

4. **Responsive Design**
   - Test on mobile (< 768px)
   - Test on tablet (768px - 1024px)
   - Test on desktop (> 1024px)

5. **Error Cases**
   - Network error (disconnect internet)
   - Invalid credentials
   - File upload errors

### Browser Testing

Test on:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest, if on Mac)

## Common Tasks

### Add a New Page

```bash
# 1. Create page component
# src/pages/profile.tsx
import { useAuth } from '@/contexts/AuthContext';
import './profile.css';

export default function Profile() {
  const { user } = useAuth();
  
  return (
    <div className="profile">
      <h1>Profile</h1>
      <p>{user?.email}</p>
    </div>
  );
}

# 2. Create stylesheet
# src/styles/profile.css
.profile {
  padding: var(--spacing-lg);
}

# 3. Add route in App.tsx
import Profile from './pages/profile';

<Route 
  path="/profile" 
  element={
    <ProtectedRoute>
      <Profile />
    </ProtectedRoute>
  } 
/>

# 4. Add navigation link in navbar.tsx
<Link to="/profile">Profile</Link>
```

### Add a New Component

```bash
# 1. Create component file
# src/components/UserCard.tsx
interface UserCardProps {
  name: string;
  email: string;
  avatarUrl?: string;
}

export default function UserCard({ name, email, avatarUrl }: UserCardProps) {
  return (
    <div className="user-card">
      {avatarUrl && <img src={avatarUrl} alt={name} />}
      <h3>{name}</h3>
      <p>{email}</p>
    </div>
  );
}

# 2. Create styles (optional)
# src/styles/user-card.css
.user-card {
  border: 1px solid var(--color-gray-200);
  border-radius: 8px;
  padding: var(--spacing-md);
}

# 3. Import and use
import UserCard from '@/components/UserCard';

<UserCard name="John" email="john@example.com" />
```

### Add API Endpoint Integration

```typescript
// Define types
interface CreatePostData {
  title: string;
  content: string;
}

interface Post {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

// Create API function
const createPost = async (data: CreatePostData): Promise<Post> => {
  const response = await apiClient.post<{ data: Post }>('/posts', data);
  return response.data.data;
};

// Use in component
const [loading, setLoading] = useState(false);

const handleSubmit = async (data: CreatePostData) => {
  setLoading(true);
  
  try {
    const newPost = await createPost(data);
    showToast('Post created successfully!', 'success');
    navigate(`/posts/${newPost.id}`);
  } catch (error) {
    showToast('Failed to create post', 'error');
  } finally {
    setLoading(false);
  }
};
```

### Add Environment Variable

```bash
# 1. Add to .env
VITE_NEW_VARIABLE=value

# 2. Update .env.example
VITE_NEW_VARIABLE=your-value-here

# 3. Update vite-env.d.ts (if needed)
interface ImportMetaEnv {
  readonly VITE_NEW_VARIABLE: string;
}

# 4. Use in code
const newVar = import.meta.env.VITE_NEW_VARIABLE;
```

## Troubleshooting

### Build Errors

**Problem**: `Cannot find module '@/...'`

**Solution**: Check `tsconfig.json` and `vite.config.ts` have matching path aliases:

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}

// vite.config.ts
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

---

**Problem**: `Module not found: Can't resolve 'react-router-dom'`

**Solution**: Install dependencies:
```bash
npm install
```

---

**Problem**: TypeScript errors about missing types

**Solution**: Install type definitions:
```bash
npm install -D @types/node @types/react @types/react-dom
```

### Runtime Errors

**Problem**: "Supabase client not initialized"

**Solution**: Check `.env` file has correct values:
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Restart dev server after changing `.env`:
```bash
npm run dev
```

---

**Problem**: 401 Unauthorized on API requests

**Solution**: Check authentication:
1. Verify user is logged in (`useAuth()`)
2. Check token is being sent (Network tab → Headers)
3. Token might be expired (try logout/login)
4. Backend might be down (check backend logs)

---

**Problem**: CORS errors

**Solution**: Backend must allow frontend origin:
```typescript
// Backend: src/index.ts
app.use(cors({
  origin: 'http://localhost:5173', // Frontend URL
  credentials: true,
}));
```

### Development Issues

**Problem**: Hot reload not working

**Solution**: 
1. Check Vite dev server is running
2. Hard refresh browser (Ctrl+Shift+R)
3. Restart dev server
4. Check firewall isn't blocking WebSocket connection

---

**Problem**: Styles not updating

**Solution**:
1. Hard refresh browser
2. Check CSS file is imported in component
3. Check class name matches CSS selector
4. Inspect element to see which styles are applied

---

**Problem**: "Port 5173 already in use"

**Solution**:
```bash
# Find process using port
netstat -ano | findstr :5173

# Kill process (Windows)
taskkill /PID <process-id> /F

# Or change port in vite.config.ts
server: {
  port: 3001,
}
```

## Additional Resources

- [Project Documentation](../../README.md)
- [File Reference](../reference/file-reference.md) - Detailed file explanations
- [Installation Guide](../getting-started/installation.md)
- [Folder Structure](../architecture/folder-structure.md)
- [Styling Guide](../tsa-project/styling/styling-guide.md)

## Getting Help

- **Issues**: Check [GitHub Issues](https://github.com/127msafran/tsa-repository/issues)
- **Discussions**: Use [GitHub Discussions](https://github.com/127msafran/tsa-repository/discussions)
- **Code Review**: Tag maintainers in your PR

## Contributing Checklist

Before submitting PR:
- [ ] Code follows style guide
- [ ] All TypeScript types are correct
- [ ] ESLint passes (`npm run lint`)
- [ ] Manually tested all changes
- [ ] Responsive on mobile/tablet/desktop
- [ ] No console errors/warnings
- [ ] Commit messages follow convention
- [ ] PR description explains changes
- [ ] Documentation updated (if needed)

---

**Welcome aboard! Happy coding! 🚀**
