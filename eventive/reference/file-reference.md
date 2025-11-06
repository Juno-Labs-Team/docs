---
title: File Reference - Frontend
description: Complete reference of every file in the Eventive frontend codebase
---

# File Reference - Frontend

Detailed explanation of every file in the Eventive frontend project.

## Core Application Files

### `/src/main.tsx`

**Purpose**: Application entry point that bootstraps React

**What it does**:
- Imports React's `createRoot` from React 18/19 API
- Mounts the root `App` component to the DOM
- Attaches to `<div id="root">` in `index.html`
- Loads global styles (`index.css`)

**Code Overview**:
```tsx
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(<App />)
```

**Key Points**:
- Uses React 19's `createRoot` (concurrent mode)
- No `StrictMode` wrapper (consider adding for dev)
- Single render call (no double-render in production)

---

### `/src/App.tsx`

**Purpose**: Main application component with routing and providers

**What it does**:
- Sets up React Router with `BrowserRouter`
- Wraps app in `AuthProvider` for authentication state
- Wraps app in `ToastProvider` for notifications
- Defines all application routes
- Renders persistent `Navbar` component
- Renders `OnboardingModal` for new users
- Implements protected route logic

**Routes Defined**:
- `/` - Home page (public)
- `/login` - Login page (public)
- `/account` - User account page (protected)
- `/settings` - User settings page (protected)

**Provider Hierarchy**:
```tsx
BrowserRouter
  └── AuthProvider
      └── ToastProvider
          ├── Navbar
          ├── OnboardingModal
          └── Routes
```

**Code Pattern**:
```tsx
<Route
  path="/account"
  element={
    <ProtectedRoute>
      <Account />
    </ProtectedRoute>
  }
/>
```

---

### `/src/index.css`

**Purpose**: Global styles and CSS resets

**What it does**:
- Imports CSS custom properties from `variables.css`
- Defines global box-sizing rules
- Sets default body styles
- Removes default margins/paddings
- Configures smooth scrolling
- Sets font family and rendering

**Key Styles**:
```css
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', ...;
  -webkit-font-smoothing: antialiased;
}

html {
  scroll-behavior: smooth;
}
```

---

### `/src/App.css`

**Purpose**: App component-specific styles

**What it does**:
- Styles the main app container
- Sets minimum height constraints
- Configures layout structure
- Provides base spacing

---

## Components

### `/src/components/navbar.tsx`

**Purpose**: Site-wide navigation bar with authentication state

**What it does**:
- Displays app logo/name
- Shows navigation links based on auth state
- Provides login/logout buttons
- Displays user avatar when logged in
- Handles user menu dropdown
- Shows loading state during auth checks
- Navigates between routes using React Router

**Key Features**:
- **Authenticated**: Shows Account, Settings, Sign Out
- **Unauthenticated**: Shows Login button
- **Loading**: Shows loading indicator
- **Responsive**: Mobile-friendly design

**Dependencies**:
- `useAuth()` - Gets authentication state
- `useNavigate()` - Route navigation
- `Link` - Client-side navigation

**State Management**:
```tsx
const { user, profile, loading, signOut } = useAuth()
const [menuOpen, setMenuOpen] = useState(false)
```

---

### `/src/components/ProtectedRoute.tsx`

**Purpose**: Route guard for authenticated-only pages

**What it does**:
- Checks if user is authenticated
- Shows loading spinner while checking auth
- Redirects to `/login` if not authenticated
- Renders protected content if authenticated
- Preserves intended destination for redirect

**Logic Flow**:
```
loading? → Show Spinner
  └─ No
     └─ user? → Render children
          └─ No → Navigate to /login
```

**Usage**:
```tsx
<Route
  path="/account"
  element={
    <ProtectedRoute>
      <Account />
    </ProtectedRoute>
  }
/>
```

---

### `/src/components/OnboardingModal.tsx`

**Purpose**: First-time user guide modal

**What it does**:
- Detects first login (checks localStorage)
- Shows welcome message and quick tour
- Explains key features
- Provides "Get Started" action
- Stores completion in localStorage
- Only shows once per user

**Key Features**:
- **Auto-trigger**: Shows on first authenticated visit
- **Dismissible**: User can close or complete
- **Persistent**: Doesn't show again after dismissal
- **Helpful**: Guides new users through the app

**LocalStorage Key**: `onboardingComplete`

---

### `/src/components/Spinner.tsx`

**Purpose**: Loading indicator component

**What it does**:
- Displays animated spinner
- Used during async operations
- CSS-based animation (no images)
- Customizable size via props
- Accessible (aria-label)

**Usage**:
```tsx
<Spinner size="large" />
```

---

### `/src/components/SkeletonLoader.tsx`

**Purpose**: Content placeholder during loading

**What it does**:
- Shows shimmer effect while content loads
- Maintains layout structure
- Prevents layout shift (CLS)
- Better UX than blank spaces
- Customizable shapes (text, avatar, card)

**Usage**:
```tsx
<SkeletonLoader type="avatar" />
<SkeletonLoader type="text" width="200px" />
```

---

### `/src/components/Toast.tsx`

**Purpose**: Notification toast component

**What it does**:
- Displays temporary notifications
- Shows success/error/info messages
- Auto-dismisses after timeout
- Supports manual dismiss
- Queues multiple toasts
- Positioned at top-right (customizable)

**Types**:
- `success` - Green toast for successful actions
- `error` - Red toast for errors
- `info` - Blue toast for information

**Usage via Context**:
```tsx
const { showToast } = useToast()
showToast('Profile updated!', 'success')
```

---

## Contexts

### `/src/contexts/AuthContext.tsx`

**Purpose**: Global authentication state management

**What it does**:
- Manages user authentication state
- Stores user and profile data
- Provides sign-in methods (Google, Discord)
- Provides sign-out method
- Handles profile fetching and caching
- Syncs with Supabase Auth
- Listens for auth state changes
- Implements profile caching (memory + localStorage)

**Exported Interface**:
```tsx
interface AuthContextType {
  user: any | null              // Supabase user object
  profile: Profile | null       // User profile from DB
  loading: boolean              // Auth check in progress
  signInWithGoogle: () => Promise<void>
  signInWithDiscord: () => Promise<void>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}
```

**Caching Strategy**:
- **Memory Cache**: 5-minute TTL, fastest
- **LocalStorage Cache**: 5-minute TTL, fallback
- **Force Refresh**: Available via `refreshProfile()`

**Key Functions**:
- `fetchProfile()` - Fetches user profile from database
- `getCachedProfile()` - Retrieves cached profile
- `cacheProfile()` - Stores profile in cache
- `clearProfileCache()` - Clears cached data
- `refreshProfile()` - Forces fresh fetch

**Profile Creation**:
- Auto-creates profile on first login
- Populates from OAuth metadata
- Updates missing avatar URLs

**Usage**:
```tsx
const { user, profile, signInWithGoogle, signOut } = useAuth()
```

---

### `/src/contexts/ToastContext.tsx`

**Purpose**: Global toast notification management

**What it does**:
- Manages toast notification queue
- Provides `showToast()` function
- Auto-dismisses after 3 seconds
- Supports different toast types
- Prevents duplicate toasts
- Removes toasts after display

**Exported Interface**:
```tsx
interface ToastContextType {
  showToast: (message: string, type: 'success' | 'error' | 'info') => void
}
```

**Usage**:
```tsx
const { showToast } = useToast()

// Show success
showToast('Profile updated!', 'success')

// Show error
showToast('Failed to upload', 'error')

// Show info
showToast('Check your email', 'info')
```

---

## Pages

### `/src/pages/home.tsx`

**Purpose**: Public homepage / landing page

**What it does**:
- Displays welcome message
- Shows app description
- Provides call-to-action buttons
- Adapts content based on auth state
- Shows different content for logged-in users

**Key Sections**:
- Hero section with tagline
- Feature highlights
- "Get Started" or "Go to Account" CTA
- Footer with links

---

### `/src/pages/login.tsx`

**Purpose**: Authentication page with OAuth options

**What it does**:
- Provides Google sign-in button
- Provides Discord sign-in button
- Shows loading state during OAuth
- Handles OAuth errors
- Redirects after successful login
- Shows error messages via toast

**OAuth Flow**:
1. User clicks "Sign in with Google"
2. Redirects to Google OAuth
3. Google redirects back to app
4. Supabase creates session
5. AuthContext fetches/creates profile
6. User redirected to home

**Error Handling**:
- Network errors
- OAuth cancellation
- Invalid credentials
- Supabase errors

---

### `/src/pages/account.tsx`

**Purpose**: User profile management page (protected)

**What it does**:
- Displays user profile information
- Shows avatar (with fallback)
- Displays username, display name, bio
- Provides avatar upload functionality
- Allows profile editing
- Shows profile creation date
- Handles avatar deletion

**Key Features**:
- **Avatar Upload**: Click to upload new image
- **Profile Edit**: Update name and bio
- **Real-time Updates**: Reflects changes immediately
- **Error Handling**: Shows errors via toast
- **Loading States**: Skeleton loaders during fetch

**State Management**:
```tsx
const [editing, setEditing] = useState(false)
const [displayName, setDisplayName] = useState('')
const [bio, setBio] = useState('')
const [uploading, setUploading] = useState(false)
```

---

### `/src/pages/settings.tsx`

**Purpose**: User preferences and settings page (protected)

**What it does**:
- Manages user preferences
- Stores settings in profile.settings (JSONB)
- Provides theme toggle (planned)
- Notification preferences
- Privacy settings
- Account management options

**Settings Structure**:
```tsx
interface Settings {
  theme: 'light' | 'dark' | 'auto'
  notifications: boolean
  publicProfile: boolean
  emailNotifications: boolean
}
```

**Key Features**:
- **Theme Preference**: Light/dark mode
- **Privacy Controls**: Public profile toggle
- **Notifications**: Enable/disable notifications
- **Account Actions**: Delete account option

---

## Library Files

### `/src/lib/supabaseClient.ts`

**Purpose**: Supabase client initialization and configuration

**What it does**:
- Creates and exports configured Supabase client
- Reads credentials from environment variables
- Provides single client instance across app
- Configures auth persistence
- Sets up storage bucket access

**Code**:
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

**Usage Throughout App**:
```typescript
import { supabase } from './lib/supabaseClient'

// Auth
await supabase.auth.signInWithOAuth({ provider: 'google' })

// Database
const { data } = await supabase.from('profiles').select('*')

// Storage
await supabase.storage.from('avatars').upload(path, file)
```

---

### `/src/lib/apiClient.ts`

**Purpose**: HTTP client wrapper for EventiveAPI requests

**What it does**:
- Wraps fetch API with defaults
- Adds authentication headers automatically
- Handles common errors
- Provides typed responses
- Implements retry logic (optional)
- Base URL configuration

**Example Implementation**:
```typescript
export async function apiGet(endpoint: string) {
  const { data: { session } } = await supabase.auth.getSession()
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${session?.access_token}`,
      'Content-Type': 'application/json'
    }
  })
  
  if (!response.ok) throw new Error('API request failed')
  return response.json()
}
```

**Usage**:
```typescript
import { apiGet, apiPost } from './lib/apiClient'

const profile = await apiGet('/users/me')
await apiPost('/users/me', { display_name: 'New Name' })
```

---

### `/src/lib/avatarUpload.ts`

**Purpose**: Avatar upload utilities and validation

**What it does**:
- Validates file type (images only)
- Validates file size (max 5MB)
- Generates unique filenames
- Uploads to Supabase Storage
- Returns public URL
- Handles upload errors
- Provides upload progress (optional)

**Key Functions**:
```typescript
export async function uploadAvatar(file: File, userId: string) {
  // Validate
  if (!file.type.startsWith('image/')) {
    throw new Error('File must be an image')
  }
  
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('File must be under 5MB')
  }
  
  // Generate path
  const fileExt = file.name.split('.').pop()
  const filePath = `${userId}/avatar.${fileExt}`
  
  // Upload
  const { data, error } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, { upsert: true })
  
  if (error) throw error
  
  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath)
  
  return publicUrl
}

export async function deleteAvatar(userId: string) {
  // Implementation
}
```

---

## Type Definitions

### `/src/types/auth.ts`

**Purpose**: TypeScript interfaces for authentication

**What it defines**:

```typescript
// User profile from database
export interface Profile {
  id: string
  username?: string
  display_name?: string
  avatar_url?: string
  bio?: string
  role: 'user' | 'admin'
  settings?: Record<string, any>
  created_at: string
  updated_at: string
}

// Auth context type
export interface AuthContextType {
  user: any | null
  profile: Profile | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signInWithDiscord: () => Promise<void>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

// Toast notification type
export interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
  duration?: number
}
```

**Usage**:
```typescript
import type { Profile, AuthContextType } from './types/auth'

const profile: Profile = { ... }
```

---

## Configuration Files

### `vite.config.ts`

**Purpose**: Vite build tool configuration

**What it configures**:
- React plugin with Fast Refresh
- Dev server port (5173)
- API proxy to backend
- Build optimizations
- Path aliases (optional)

**Key Settings**:
```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
```

---

### `tsconfig.json`

**Purpose**: TypeScript compiler configuration

**What it configures**:
- Target ES2020
- JSX transformation
- Strict type checking
- Module resolution
- Path mappings

**Key Options**:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "strict": true,
    "moduleResolution": "bundler"
  }
}
```

---

### `eslint.config.js`

**Purpose**: ESLint linting rules

**What it configures**:
- TypeScript ESLint rules
- React-specific rules
- React Hooks rules
- Import/export rules
- Code style preferences

See [ESLint Rules](/eventive/typescript/eslint-rules) for complete details.

---

### `package.json`

**Purpose**: NPM package configuration

**What it defines**:
- Project metadata (name, version)
- Dependencies and versions
- Dev dependencies
- Build scripts
- Browserslist

**Key Scripts**:
```json
{
  "scripts": {
    "dev": "vite",                    // Dev server
    "build": "tsc -b && vite build",  // Production build
    "lint": "eslint .",               // Run linter
    "preview": "vite preview"         // Preview build
  }
}
```

---

### `index.html`

**Purpose**: HTML entry point

**What it provides**:
- Document structure
- Root mounting point (`<div id="root">`)
- Meta tags for SEO
- Title and favicon
- Script tag for `main.tsx`

**Key Elements**:
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Eventive</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

---

## Docker Files

### `Dockerfile`

**Purpose**: Docker image build instructions

**What it does**:
- Multi-stage build (builder + runtime)
- Installs dependencies
- Builds production bundle
- Serves with Nginx
- Optimizes image size

See [Docker Guide](/eventive/docker/docker) for complete details.

---

### `docker-compose.yml`

**Purpose**: Multi-container Docker setup

**What it defines**:
- Frontend service configuration
- Port mappings
- Environment variables
- Volume mounts
- Network configuration

---

### `nginx.conf`

**Purpose**: Nginx web server configuration

**What it configures**:
- Static file serving
- SPA routing (all routes → index.html)
- Gzip compression
- Cache headers
- Security headers

---

## Style Files

### `/src/styles/variables.css`

**Purpose**: CSS custom properties (design tokens)

**What it defines**:
```css
:root {
  /* Colors */
  --color-primary: #3b82f6;
  --color-success: #10b981;
  --color-error: #ef4444;
  --color-background: #ffffff;
  --color-text: #1f2937;
  
  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  
  /* Typography */
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  
  /* Border */
  --border-radius: 0.375rem;
  --border-width: 1px;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
}
```

---

## Additional Files

### `README.md`

Project overview and setup instructions (to be updated to point to these docs).

### `CONTRIBUTING.md`

Contribution guidelines for developers.

### `SECURITY.md`

Security policies and vulnerability reporting.

### `TODO.md`

Planned features and improvements roadmap.

### `.env.example`

Template for environment variables.

### `.gitignore`

Git ignore patterns for build files, dependencies, etc.

---

## Next Steps

- [Backend File Reference](/eventive-api/reference/file-reference) - Similar guide for backend
- [Component Architecture](/eventive/tsa-project/src/components) - Deep dive into components
- [API Integration](/eventive/api/client) - How components use APIs

---

**Questions?** Check the [Contributing Guide](/CONTRIBUTING) or ask the team!
