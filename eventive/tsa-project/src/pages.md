# Pages Documentation

## Overview
This document describes all pages in the TSA Project and their functionality.

---

## Pages

### Home (`pages/home.tsx`)
**Route**: `/`  
**Protected**: No (Public)

**Purpose**: Landing page for the application

**Features**:
- Welcome message
- Personalized greeting for logged-in users
- Sign In button for guests
- Quick links to Account and Settings for authenticated users
- Clean, minimal design

**Auth State**:
- Shows different content based on authentication status
- Displays user's display name or email
- Links change based on auth state

**Usage**: Default landing page for all users

---

### Login (`pages/login.tsx`)
**Route**: `/login`  
**Protected**: No (Public, redirects if authenticated)

**Purpose**: OAuth authentication page

**Features**:
- Google OAuth button with Google branding
- Discord OAuth button with Discord branding
- Auto-redirect if user is already logged in
- Loading state during authentication
- Error handling with user-friendly alerts
- Beautiful gradient background
- Terms of Service notice

**OAuth Flow**:
1. User clicks provider button
2. Redirected to Google/Discord
3. User authorizes
4. Redirected back to app
5. Session created
6. Redirected to home page

**Styling**: `styles/login.css` - Premium login design

---

### Account (`pages/account.tsx`)
**Route**: `/account`  
**Protected**: Yes (Requires authentication)

**Purpose**: User profile management and viewing

**Features**:
- Display user avatar (from OAuth provider)
- Show email (read-only)
- Edit display name
- Set/edit username
- Write/edit bio
- View account role (user/admin)
- Edit mode toggle
- Save/Cancel buttons
- Account creation date display
- Real-time profile updates

**Fields**:
- **Email**: Read-only, from auth provider
- **Display Name**: Editable, full name
- **Username**: Editable, unique identifier
- **Bio**: Editable textarea, about the user
- **Role**: Read-only, user/admin status

**Usage Flow**:
1. User views their profile
2. Clicks "Edit Profile"
3. Updates fields
4. Clicks "Save Changes" or "Cancel"
5. Changes saved to database
6. Profile refreshed

**Auth Integration**:
- Uses `useAuth()` for user/profile data
- Updates via Supabase client
- Calls `refreshProfile()` after save

---

### Settings (`pages/settings.tsx`)
**Route**: `/settings`  
**Protected**: Yes (Requires authentication)

**Purpose**: User preferences and account settings

**Features**:
- Email notifications toggle
- Dark mode toggle (coming soon)
- Public profile toggle
- Save settings button
- Danger zone section
- Delete account button (placeholder)

**Settings Storage**:
- Stored in `profiles.settings` as JSONB
- Flexible structure for future settings
- Each setting is a boolean flag

**Current Settings**:
- `emailNotifications`: Receive email updates
- `darkMode`: Use dark theme (future)
- `publicProfile`: Make profile visible to others

**Usage Flow**:
1. User toggles settings
2. Clicks "Save Settings"
3. Settings saved to database
4. Confirmation alert

**Future Enhancements**:
- Account deletion flow
- Privacy settings
- Notification preferences
- Language selection
- Theme customization

---

## Page Guidelines

### Creating New Pages

1. **Create File**: Add to `src/pages/`
2. **Define Route**: Add to `App.tsx`
3. **Protect if Needed**: Wrap in `<ProtectedRoute>`
4. **Add to Navbar**: Update navbar links if necessary
5. **Document**: Add to this file

### Page Structure Template

```tsx
import { useAuth } from '../contexts/AuthContext';

export default function PageName() {
  const { user, profile } = useAuth();

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Page Title</h1>
      {/* Page content */}
    </div>
  );
}
```

### Best Practices

- **Consistent Layout**: Use similar padding/max-width
- **Auth Awareness**: Check auth state when needed
- **Loading States**: Show loading indicators
- **Error Handling**: Display user-friendly errors
- **Accessibility**: Use semantic HTML
- **TypeScript**: Type all props and state
- **Responsive**: Design for mobile and desktop