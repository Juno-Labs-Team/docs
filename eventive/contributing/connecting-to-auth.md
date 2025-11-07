# Connecting Your New Page to the Auth System

This guide shows you how to integrate authentication into new pages and components you create for Eventive.

## Table of Contents

1. [Understanding the Auth System](#understanding-the-auth-system)
2. [Protecting Routes](#protecting-routes)
3. [Accessing User Data](#accessing-user-data)
4. [Making Authenticated API Calls](#making-authenticated-api-calls)
5. [Common Patterns](#common-patterns)
6. [Backend API Endpoints](#backend-api-endpoints)

---

## Understanding the Auth System

Eventive uses **Supabase Auth** with a custom `AuthContext` wrapper that provides:
- User authentication state
- User profile data
- Helper functions for auth operations
- Automatic session management

### Key Files

- **`src/contexts/AuthContext.tsx`** - Auth state management
- **`src/components/ProtectedRoute.tsx`** - Route protection wrapper
- **`src/lib/supabaseClient.ts`** - Supabase client configuration
- **`src/lib/apiClient.ts`** - Backend API client

---

## Protecting Routes

### Option 1: Using ProtectedRoute Component (Recommended)

Wrap your page component with `ProtectedRoute` in `src/App.tsx`:

```tsx
import ProtectedRoute from './components/ProtectedRoute';
import YourNewPage from './pages/your-new-page';

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      
      {/* Protected routes */}
      <Route
        path="/your-new-page"
        element={
          <ProtectedRoute>
            <YourNewPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
```

**What ProtectedRoute does:**
- ✅ Checks if user is authenticated
- ✅ Redirects to `/login` if not authenticated
- ✅ Shows loading state while checking auth
- ✅ Displays onboarding modal for new users

### Option 2: Manual Auth Check

If you need custom logic, check auth manually in your component:

```tsx
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function YourNewPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null; // Will redirect
  }

  return (
    <div>
      {/* Your page content */}
    </div>
  );
}
```

---

## Accessing User Data

### Using the AuthContext Hook

The `useAuth()` hook provides everything you need:

```tsx
import { useAuth } from '../contexts/AuthContext';

export default function YourNewPage() {
  const {
    user,           // Supabase user object (id, email, etc.)
    profile,        // User profile (display_name, username, bio, avatar_url)
    loading,        // Auth loading state
    refreshProfile, // Function to refresh profile data
  } = useAuth();

  return (
    <div>
      <h1>Welcome, {profile?.display_name || user?.email}!</h1>
      <p>Username: @{profile?.username}</p>
      {profile?.avatar_url && (
        <img src={profile.avatar_url} alt="Avatar" />
      )}
    </div>
  );
}
```

### Available User Data

**`user` object (from Supabase):**
```typescript
{
  id: string;              // Unique user ID
  email: string;           // User email
  user_metadata: {         // OAuth data
    avatar_url?: string;
    full_name?: string;
    // ... other OAuth fields
  }
}
```

**`profile` object (from database):**
```typescript
{
  id: string;              // Same as user.id
  email: string;
  username: string;
  display_name: string;
  bio?: string;
  avatar_url?: string;
  role: 'user' | 'admin';
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}
```

### Handling Loading States

Always check `loading` before rendering:

```tsx
export default function YourNewPage() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <p>Not authenticated</p>;
  }

  return (
    <div>
      {/* Your content */}
    </div>
  );
}
```

---

## Making Authenticated API Calls

### Using the API Client

The `apiClient` automatically includes authentication tokens:

```tsx
import { api } from '../lib/apiClient';
import { useEffect, useState } from 'react';
import { useToast } from '../contexts/ToastContext';

export default function YourNewPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await api.getProfile(); // Example API call
      setData(result);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // ... render logic
}
```

### Available API Methods

**User Profile:**
```typescript
await api.getProfile();                    // Get current user profile
await api.updateProfile({ bio: 'New bio' }); // Update profile
await api.getUserById(userId);              // Get another user's profile
```

**Settings:**
```typescript
await api.getSettings();                   // Get user settings
await api.updateSettings({ theme: 'dark' }); // Update settings
```

**File Uploads:**
```typescript
const formData = new FormData();
formData.append('file', file);
await api.uploadAvatar(formData);          // Upload avatar
await api.deleteAvatar();                   // Delete avatar
```

**Health Check:**
```typescript
await api.healthCheck();                   // Check API status
```

### Error Handling

Always wrap API calls in try-catch:

```tsx
const handleSave = async () => {
  try {
    await api.updateProfile({ display_name: newName });
    toast.success('Profile updated!');
  } catch (error: any) {
    console.error('Update failed:', error);
    toast.error(error.message || 'Failed to update profile');
  }
};
```

---

## Common Patterns

### Pattern 1: User Profile Display

```tsx
import { useAuth } from '../contexts/AuthContext';

export default function ProfileCard() {
  const { user, profile } = useAuth();

  return (
    <div className="profile-card">
      {profile?.avatar_url ? (
        <img src={profile.avatar_url} alt="Avatar" />
      ) : (
        <div className="avatar-placeholder">
          {profile?.display_name?.[0]?.toUpperCase() || '?'}
        </div>
      )}
      <h3>{profile?.display_name || 'User'}</h3>
      <p>@{profile?.username}</p>
      {profile?.bio && <p>{profile.bio}</p>}
    </div>
  );
}
```

### Pattern 2: Role-Based Access

```tsx
import { useAuth } from '../contexts/AuthContext';

export default function AdminPanel() {
  const { profile, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (profile?.role !== 'admin') {
    return (
      <div>
        <h1>Access Denied</h1>
        <p>You must be an administrator to view this page.</p>
      </div>
    );
  }

  return (
    <div>
      <h1>Admin Panel</h1>
      {/* Admin-only content */}
    </div>
  );
}
```

### Pattern 3: User-Specific Data

```tsx
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function MyEvents() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);

  useEffect(() => {
    if (user) {
      fetchUserEvents();
    }
  }, [user]);

  const fetchUserEvents = async () => {
    const { data } = await supabase
      .from('events')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    setEvents(data || []);
  };

  return (
    <div>
      <h1>My Events</h1>
      {events.map(event => (
        <div key={event.id}>{event.title}</div>
      ))}
    </div>
  );
}
```

### Pattern 4: Form with Authentication

```tsx
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/apiClient';
import { useState } from 'react';
import { useToast } from '../contexts/ToastContext';

export default function EditProfileForm() {
  const { profile, refreshProfile } = useAuth();
  const toast = useToast();
  const [formData, setFormData] = useState({
    display_name: profile?.display_name || '',
    bio: profile?.bio || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await api.updateProfile(formData);
      await refreshProfile(); // Refresh auth context
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={formData.display_name}
        onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
        placeholder="Display Name"
      />
      <textarea
        value={formData.bio}
        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
        placeholder="Bio"
      />
      <button type="submit" disabled={saving}>
        {saving ? 'Saving...' : 'Save Changes'}
      </button>
    </form>
  );
}
```

---

## Backend API Endpoints

### Need a New API Endpoint?

If you need backend functionality that doesn't exist yet:

1. **Open an issue on Discord** in the `#backend` or `#development` channel
2. **Describe what you need:**
   - What data you need to fetch/update
   - What the endpoint should do
   - Any specific requirements
3. **Backend maintainers will:**
   - Review your request
   - Create the endpoint
   - Update the API documentation
   - Let you know when it's ready

### Current API Endpoints

These endpoints are already available via `api.*` methods:

- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update current user profile
- `GET /api/users/:id` - Get user by ID
- `GET /api/settings` - Get user settings
- `PUT /api/settings` - Update user settings
- `POST /api/uploads/avatar` - Upload avatar
- `DELETE /api/uploads/avatar` - Delete avatar
- `GET /health` - API health check

---

## Best Practices

### ✅ Do:
- Always use `useAuth()` hook to access user data
- Wrap authenticated pages with `ProtectedRoute`
- Handle loading and error states
- Use the `apiClient` for backend calls
- Show user-friendly error messages
- Call `refreshProfile()` after updating profile data

### ❌ Don't:
- Access `localStorage` directly for auth tokens
- Make raw fetch calls to the backend (use `apiClient`)
- Forget to check `loading` state
- Assume `user` or `profile` is always defined
- Hard-code user IDs or tokens
- Skip error handling on API calls

---

## Examples

### Complete Page Example

```tsx
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/apiClient';
import { useToast } from '../contexts/ToastContext';
import { useState, useEffect } from 'react';
import { SkeletonLoader } from '../components/SkeletonLoader';

export default function MyNewPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const toast = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await api.getProfile();
      setData(result);
    } catch (error: any) {
      console.error('Error:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Show skeleton while auth is loading
  if (authLoading) {
    return <SkeletonLoader type="profile" />;
  }

  // Show loading while fetching data
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="page-container">
      <h1>Welcome, {profile?.display_name}!</h1>
      {/* Your page content */}
    </div>
  );
}
```

### Add Route in App.tsx

```tsx
import ProtectedRoute from './components/ProtectedRoute';
import MyNewPage from './pages/my-new-page';

function App() {
  return (
    <Routes>
      <Route
        path="/my-new-page"
        element={
          <ProtectedRoute>
            <MyNewPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
```

---

## Troubleshooting

### User is null after login
- Check if you're calling `useAuth()` inside `AuthProvider`
- Verify Supabase configuration in `.env`
- Check browser console for errors

### Profile data is outdated
- Call `refreshProfile()` after updating profile
- Check if you're caching profile data incorrectly

### API calls failing
- Verify backend is running (`npm run dev` in EventiveAPI)
- Check `VITE_API_URL` in `.env` points to correct backend
- Look for CORS errors in console
- Verify you're using `api.*` methods, not raw fetch

### ProtectedRoute not working
- Make sure you're inside `<Router>` component
- Check if `AuthProvider` wraps your app
- Verify route path matches exactly

---

## Need Help?

- **Check existing pages:** Look at `src/pages/account.tsx` or `src/pages/settings.tsx` for examples
- **Ask on Discord:** Post in `#development` or `#help`
- **Review the code:** `src/contexts/AuthContext.tsx` has detailed comments

Happy coding! 🚀
