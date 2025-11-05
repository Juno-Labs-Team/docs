# Authentication System Documentation

## Overview
The TSA Project uses Supabase for authentication with OAuth providers (Google and Discord). The system includes user profile management, protected routes, and role-based access control.

## Architecture

### Authentication Flow
1. User clicks OAuth button (Google/Discord) on login page
2. Redirected to provider for authorization
3. Provider redirects back to app with auth token
4. Supabase exchanges token and creates session
5. Profile auto-created in database via trigger
6. User redirected to home page

### Tech Stack
- **Supabase Auth**: OAuth provider management, session handling
- **React Context**: Global auth state management
- **React Router**: Protected routes and navigation
- **PostgreSQL**: User profile storage

## File Structure

```
src/
├── lib/
│   └── supabaseClient.ts          # Supabase client configuration
├── types/
│   └── auth.ts                     # TypeScript interfaces
├── contexts/
│   └── AuthContext.tsx             # Auth state provider
├── components/
│   ├── ProtectedRoute.tsx          # Route wrapper for auth
│   └── navbar.tsx                  # Auth-aware navigation
├── pages/
│   ├── login.tsx                   # OAuth login page
│   ├── account.tsx                 # User profile management
│   ├── settings.tsx                # User preferences
│   └── home.tsx                    # Public home page
└── styles/
    ├── login.css                   # Login page styles
    └── navbar.css                  # Navigation styles
```

## Core Components

### AuthContext (`contexts/AuthContext.tsx`)
Provides global auth state and methods:
- `user`: Current Supabase user object
- `profile`: User profile from database
- `loading`: Auth initialization state
- `signInWithGoogle()`: Google OAuth
- `signInWithDiscord()`: Discord OAuth
- `signOut()`: Sign out user
- `refreshProfile()`: Reload profile data

### useAuth Hook
Custom hook to access auth context:
```tsx
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { user, profile, signOut } = useAuth();
  // ...
}
```

### ProtectedRoute Component
Wraps routes that require authentication:
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

Optional `requireAdmin` prop for admin-only routes:
```tsx
<ProtectedRoute requireAdmin={true}>
  <AdminPanel />
</ProtectedRoute>
```

## Database Schema

### profiles Table
```sql
id              UUID (references auth.users)
username        TEXT (unique)
display_name    TEXT
avatar_url      TEXT
bio             TEXT
role            TEXT (user | admin)
settings        JSONB
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

### Row Level Security (RLS)
- Everyone can view profiles
- Users can only insert/update their own profile
- Auto-creates profile on signup via trigger

## Usage Guide

### Adding a New Protected Page
1. Create the page component in `src/pages/`
2. Add route in `App.tsx`:
```tsx
<Route
  path="/my-page"
  element={
    <ProtectedRoute>
      <MyPage />
    </ProtectedRoute>
  }
/>
```

### Accessing User Data
```tsx
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { user, profile } = useAuth();

  return (
    <div>
      <p>Email: {user?.email}</p>
      <p>Name: {profile?.display_name}</p>
      <p>Role: {profile?.role}</p>
    </div>
  );
}
```

### Updating User Profile
```tsx
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

const { user, refreshProfile } = useAuth();

const updateProfile = async () => {
  const { error } = await supabase
    .from('profiles')
    .update({ display_name: 'New Name' })
    .eq('id', user.id);

  if (!error) {
    await refreshProfile(); // Reload profile data
  }
};
```

### Role-Based Features
```tsx
const { profile } = useAuth();

// Show admin features
if (profile?.role === 'admin') {
  return <AdminFeatures />;
}
```

## Environment Variables

Required in `.env`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## OAuth Configuration

### Google OAuth
- Configured in: Google Cloud Console
- Redirect URI: `https://[project-ref].supabase.co/auth/v1/callback`
- Enabled in: Supabase Dashboard → Authentication → Providers

### Discord OAuth
- Configured in: Discord Developer Portal
- Redirect URI: `https://[project-ref].supabase.co/auth/v1/callback`
- Enabled in: Supabase Dashboard → Authentication → Providers

## Admin Management

To promote a user to admin:
1. Go to Supabase Dashboard
2. Navigate to Table Editor → profiles
3. Find the user
4. Change `role` from 'user' to 'admin'

## Security Notes

- **Never expose service role key** in frontend
- Only use `VITE_SUPABASE_ANON_KEY` in client code
- RLS policies protect user data
- OAuth credentials stored in Supabase (not in frontend)
- Sessions persist via localStorage (auto-refresh)

## Troubleshooting

### User not redirected after login
- Check OAuth redirect URIs match in provider settings
- Verify Supabase URL is correct

### Profile not created
- Check SQL trigger: `on_auth_user_created`
- Verify RLS policies allow INSERT

### Auth state not updating
- Ensure `AuthProvider` wraps your app in `App.tsx`
- Check for multiple React instances

## Future Enhancements

- [ ] Email verification flow
- [ ] Password reset functionality
- [ ] Two-factor authentication
- [ ] Social profile linking
- [ ] Admin dashboard
- [ ] User search/directory