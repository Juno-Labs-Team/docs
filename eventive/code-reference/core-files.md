# Core Files Reference

This document provides detailed code documentation for the core files in the Eventive frontend application.

## Application Entry Points

### `src/main.tsx`

**Purpose**: Application bootstrap and initialization

**Code**:
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

**What it does**:
- **Imports React 19's `createRoot`**: Uses the new concurrent rendering API
- **Finds the root DOM element**: Targets `#root` div in `index.html`
- **Wraps in StrictMode**: Enables additional checks and warnings in development
- **Renders the App**: Mounts the entire application tree

**Key Points**:
- This file runs once when the application starts
- `StrictMode` helps identify unsafe lifecycle methods and deprecated APIs
- The `!` operator asserts that `getElementById` won't return null

---

### `src/App.tsx`

**Purpose**: Root component with routing and global providers

**Code**:
```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/home';
import Login from './pages/login';
import Account from './pages/account';
import Settings from './pages/settings';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              path="/account"
              element={
                <ProtectedRoute>
                  <Account />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
```

**What it does**:
- **Sets up React Router**: Uses `BrowserRouter` for client-side routing
- **Provides authentication context**: `AuthProvider` wraps entire app
- **Provides toast notifications**: `ToastProvider` enables global notifications
- **Defines application routes**: Maps URLs to page components
- **Protects routes**: Wraps authenticated routes with `ProtectedRoute`

**Provider Hierarchy**:
```
BrowserRouter
└── AuthProvider (manages user state)
    └── ToastProvider (manages notifications)
        └── Routes (page routing)
```

**Route Breakdown**:
| Path | Component | Protected | Description |
|------|-----------|-----------|-------------|
| `/login` | `Login` | ❌ | Public login page |
| `/` | `Home` | ✅ | Main dashboard |
| `/account` | `Account` | ✅ | User profile settings |
| `/settings` | `Settings` | ✅ | Application settings |

---

## Library Files

### `src/lib/supabaseClient.ts`

**Purpose**: Supabase client singleton for authentication and database access

**Code**:
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
```

**What it does**:
- **Reads environment variables**: Gets Supabase URL and anonymous key from Vite env
- **Validates configuration**: Throws error if env vars are missing
- **Creates Supabase client**: Initializes client with authentication options
- **Exports singleton**: Single client instance used throughout the app

**Configuration Options**:
- **`autoRefreshToken: true`**: Automatically refreshes expired tokens
- **`persistSession: true`**: Saves session to localStorage for persistence across page reloads
- **`detectSessionInUrl: true`**: Handles OAuth redirect callbacks

**Usage Example**:
```typescript
import { supabase } from '@/lib/supabaseClient';

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123',
});

// Query database
const { data: profiles } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId);

// Upload to storage
await supabase.storage
  .from('avatars')
  .upload('path/to/file.jpg', file);
```

---

### `src/lib/apiClient.ts`

**Purpose**: Axios HTTP client with authentication and automatic token refresh

**Code**:
```typescript
import axios from 'axios';
import { supabase } from './supabaseClient';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Add auth token
apiClient.interceptors.request.use(
  async (config) => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Handle token refresh and errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If 401 and haven't retried yet, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const { data: { session } } = await supabase.auth.refreshSession();
        
        if (session?.access_token) {
          originalRequest.headers.Authorization = `Bearer ${session.access_token}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        await supabase.auth.signOut();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
```

**What it does**:

**Request Interceptor**:
1. Gets current session from Supabase
2. Extracts access token
3. Adds `Authorization: Bearer <token>` header to every request

**Response Interceptor**:
1. Passes through successful responses
2. On 401 error:
   - Marks request as retry attempt (`_retry` flag)
   - Attempts to refresh the session token
   - If refresh succeeds, retries original request with new token
   - If refresh fails, logs user out and redirects to login

**Key Features**:
- **Automatic authentication**: No need to manually add tokens
- **Token refresh**: Handles expired tokens seamlessly
- **Retry logic**: Automatically retries failed requests after refresh
- **Logout on auth failure**: Cleans up invalid sessions

**Usage Example**:
```typescript
import apiClient from '@/lib/apiClient';

// GET request
const response = await apiClient.get('/users/me');
const user = response.data.data;

// POST request
await apiClient.post('/settings', {
  theme: 'dark',
  language: 'en',
});

// PUT request with FormData
const formData = new FormData();
formData.append('avatar', file);
await apiClient.post('/uploads/avatar', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
```

---

### `src/lib/avatarUpload.ts`

**Purpose**: Client-side avatar image processing and upload

**Code**:
```typescript
import apiClient from './apiClient';

interface UploadResult {
  url: string;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
const TARGET_SIZE = 400; // 400x400px

/**
 * Validates file type and size
 */
function validateFile(file: File): void {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Invalid file type. Please upload an image (PNG, JPEG, GIF, or WebP).');
  }
  
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File too large. Maximum size is 5MB.');
  }
}

/**
 * Resizes image to target dimensions using canvas
 */
function resizeImage(file: File, targetSize: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        // Calculate dimensions (maintain aspect ratio, crop to square)
        const size = Math.min(img.width, img.height);
        const x = (img.width - size) / 2;
        const y = (img.height - size) / 2;
        
        canvas.width = targetSize;
        canvas.height = targetSize;
        
        // Draw image centered and cropped
        ctx.drawImage(
          img,
          x, y, size, size,  // Source
          0, 0, targetSize, targetSize  // Destination
        );
        
        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to convert canvas to blob'));
            }
          },
          file.type,
          0.9  // Quality (90%)
        );
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Uploads avatar to backend
 */
export async function uploadAvatar(file: File): Promise<string> {
  // Validate
  validateFile(file);
  
  // Resize
  const resizedBlob = await resizeImage(file, TARGET_SIZE);
  
  // Create FormData
  const formData = new FormData();
  formData.append('avatar', resizedBlob, file.name);
  
  // Upload
  const response = await apiClient.post<{ success: boolean; data: UploadResult }>(
    '/uploads/avatar',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  
  if (!response.data.success) {
    throw new Error('Upload failed');
  }
  
  return response.data.data.url;
}

/**
 * Deletes user's avatar
 */
export async function deleteAvatar(): Promise<void> {
  const response = await apiClient.delete<{ success: boolean }>('/uploads/avatar');
  
  if (!response.data.success) {
    throw new Error('Delete failed');
  }
}
```

**What it does**:

**`validateFile(file)`**:
- Checks file type against allowed types
- Checks file size doesn't exceed 5MB
- Throws descriptive errors

**`resizeImage(file, targetSize)`**:
1. Reads file as Data URL using FileReader
2. Creates Image element and loads file
3. Creates canvas element (400x400)
4. Calculates crop dimensions (center crop to square)
5. Draws image to canvas at target size
6. Converts canvas to Blob with 90% quality
7. Returns resized Blob

**`uploadAvatar(file)`**:
1. Validates file
2. Resizes to 400x400px
3. Creates FormData with resized blob
4. POSTs to `/uploads/avatar`
5. Returns new avatar URL

**`deleteAvatar()`**:
- Sends DELETE request to `/uploads/avatar`
- Throws error if deletion fails

**Image Processing**:
```
Original Image (e.g., 1920x1080)
    ↓ Center crop to square (1080x1080)
    ↓ Resize to 400x400
    ↓ Compress to 90% quality
    ↓ Convert to Blob
    ↓ Upload to backend
```

**Usage Example**:
```typescript
import { uploadAvatar, deleteAvatar } from '@/lib/avatarUpload';

// Upload
try {
  const avatarUrl = await uploadAvatar(selectedFile);
  console.log('New avatar:', avatarUrl);
} catch (error) {
  console.error('Upload failed:', error.message);
}

// Delete
try {
  await deleteAvatar();
  console.log('Avatar deleted');
} catch (error) {
  console.error('Delete failed:', error.message);
}
```

---

## Type Definitions

### `src/types/auth.ts`

**Purpose**: TypeScript types for authentication and user data

**Code**:
```typescript
export interface User {
  id: string;
  email: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
}

export interface Session {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at?: number;
  token_type: string;
  user: User;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

export interface AuthError {
  message: string;
  status?: number;
}
```

**Type Descriptions**:

**`User`**:
- Core user information from Supabase Auth
- `user_metadata` contains profile data (name, avatar)

**`Session`**:
- Authentication session data
- Contains access token, refresh token, and expiry
- Includes user object

**`Profile`**:
- Extended user profile from `profiles` database table
- Includes settings, timestamps, and profile details

**`AuthState`**:
- State shape for `AuthContext`
- Tracks user, session, and loading status

**`AuthError`**:
- Error structure for authentication failures
- Optional HTTP status code

---

## Related Documentation

- [Contributor Guide](../contributing/contributor-guide.md) - Development workflow
- [Context Providers](./contexts.md) - AuthContext and ToastContext
- [Components Reference](./components.md) - All components
- [Pages Reference](./pages.md) - All pages
