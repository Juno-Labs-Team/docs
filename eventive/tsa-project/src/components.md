# Components Documentation

## Overview
This document describes all reusable components in the TSA Project.

## Components

### Navbar (`components/navbar.tsx`)
**Purpose**: Main navigation bar with authentication-aware UI

**Features**:
- Logo/brand link to home
- Navigation links (Home, Account, Settings)
- Displays user avatar and name when logged in
- Sign In button when logged out
- Sign Out button when logged in
- Fixed position at top of page
- Responsive design

**Usage**:
```tsx
import Navbar from './components/navbar';

<Navbar />
```

**Auth Integration**:
- Uses `useAuth()` hook to get current user state
- Conditionally renders links based on authentication
- Handles sign out functionality

**Styling**: `styles/navbar.css`

---

### ProtectedRoute (`components/ProtectedRoute.tsx`)
**Purpose**: Route wrapper that requires authentication

**Props**:
- `children`: ReactNode - The component to render if authenticated
- `requireAdmin?`: boolean - Optional flag to require admin role

**Features**:
- Shows loading state during auth check
- Redirects to `/login` if not authenticated
- Shows "Access Denied" for non-admin users on admin routes
- Seamless navigation flow

**Usage**:
```tsx
import { ProtectedRoute } from './components/ProtectedRoute';

// Basic protection
<Route
  path="/account"
  element={
    <ProtectedRoute>
      <Account />
    </ProtectedRoute>
  }
/>

// Admin-only route
<Route
  path="/admin"
  element={
    <ProtectedRoute requireAdmin={true}>
      <AdminPanel />
    </ProtectedRoute>
  }
/>
```

**Auth Integration**:
- Uses `useAuth()` hook
- Checks `user` for authentication
- Checks `profile.role` for admin access

---

## Adding New Components

1. Create component file in `src/components/`
2. Use TypeScript for type safety
3. Import and use `useAuth()` if auth is needed
4. Add styling in `src/styles/`
5. Document here with purpose, props, and usage examples

## Component Guidelines

- **Reusability**: Components should be generic and reusable
- **TypeScript**: Always define prop interfaces
- **Styling**: Use separate CSS files for styling
- **Auth Awareness**: Use `useAuth()` hook for auth-related features
- **Accessibility**: Include proper ARIA labels and semantic HTML