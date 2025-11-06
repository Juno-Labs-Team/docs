# Components Reference

Detailed code documentation for all React components in the Eventive application.

## Navigation Components

### Navbar

**File**: `src/components/navbar.tsx`

**Purpose**: Main navigation bar with authentication-aware UI

**Full Code**:
```typescript
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/navbar.css';

export default function Navbar() {
  const { user, profile, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          Eventive
        </Link>

        <div className="navbar-links">
          <Link to="/" className="navbar-link">
            Home
          </Link>

          {user ? (
            <>
              <Link to="/account" className="navbar-link">
                Account
              </Link>
              <Link to="/settings" className="navbar-link">
                Settings
              </Link>
              <div className="navbar-user">
                <img 
                  src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.display_name || user?.email?.split('@')[0] || 'User')}&size=40&background=667eea&color=fff`} 
                  alt="Avatar" 
                  className="navbar-avatar"
                />
                <span className="navbar-username">
                  {profile?.display_name || user.email?.split('@')[0]}
                </span>
              </div>
              <button onClick={handleSignOut} className="navbar-button">
                Sign Out
              </button>
            </>
          ) : (
            <Link to="/login" className="navbar-button">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
```

**Code Breakdown**:

**Authentication State**:
```typescript
const { user, profile, signOut } = useAuth();
```
- Gets current user, profile, and signOut function from AuthContext
- `user` is null when not logged in
- `profile` contains extended user data (display name, avatar)

**Sign Out Handler**:
```typescript
const handleSignOut = async () => {
  try {
    await signOut();
  } catch (error) {
    console.error('Failed to sign out:', error);
  }
};
```
- Calls `signOut()` from AuthContext
- Handles errors gracefully (logs but doesn't break UI)
- User is redirected to login by AuthContext

**Conditional Rendering**:
```typescript
{user ? (
  // Authenticated user UI
  <>
    <Link to="/account">Account</Link>
    <Link to="/settings">Settings</Link>
    <button onClick={handleSignOut}>Sign Out</button>
  </>
) : (
  // Guest UI
  <Link to="/login">Sign In</Link>
)}
```
- Shows different UI based on authentication state
- Authenticated: Shows navigation links, user info, sign out button
- Guest: Shows sign in link only

**Avatar Fallback**:
```typescript
src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.display_name || user?.email?.split('@')[0] || 'User')}&size=40&background=667eea&color=fff`}
```
- Uses profile avatar if available
- Falls back to UI Avatars service with user's name/email
- Generates colorful placeholder with user's initials

---

## Route Guards

### ProtectedRoute

**File**: `src/components/ProtectedRoute.tsx`

**Purpose**: Authentication wrapper for protected pages

**Full Code**:
```typescript
import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { SkeletonLoader } from './SkeletonLoader';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();

  // Show skeleton loader while checking auth
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        flexDirection: 'column',
        padding: '40px'
      }}>
        <div style={{ maxWidth: '800px', width: '100%' }}>
          <SkeletonLoader type="card" count={1} />
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check admin requirement
  if (requireAdmin && profile?.role !== 'admin') {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        flexDirection: 'column'
      }}>
        <h1>Access Denied</h1>
        <p>You need admin privileges to access this page.</p>
      </div>
    );
  }

  return <>{children}</>;
}
```

**Code Breakdown**:

**Props Interface**:
```typescript
interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
}
```
- `children`: The page component to render if authorized
- `requireAdmin`: Optional flag for admin-only pages

**Loading State**:
```typescript
if (loading) {
  return <SkeletonLoader type="card" count={1} />;
}
```
- Shows skeleton while checking authentication
- Prevents flash of login page
- Improves perceived performance

**Authentication Check**:
```typescript
if (!user) {
  return <Navigate to="/login" replace />;
}
```
- Redirects to login if not authenticated
- `replace` prevents going back to protected page
- User can return after logging in

**Admin Check**:
```typescript
if (requireAdmin && profile?.role !== 'admin') {
  return <div>Access Denied</div>;
}
```
- Optional role-based authorization
- Checks profile role from database
- Shows error message instead of redirect

**Usage Example**:
```typescript
// Basic protected route
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
    <ProtectedRoute requireAdmin>
      <AdminDashboard />
    </ProtectedRoute>
  } 
/>
```

---

## Onboarding

### OnboardingModal

**File**: `src/components/OnboardingModal.tsx`

**Purpose**: Multi-step onboarding flow for new users

**Key Features**:
- 4-step wizard (Avatar → Username → Display Name → Bio)
- Avatar upload or OAuth avatar selection
- Username validation and availability check
- Progress indicator
- Skip option
- Saves to profile and marks onboarding complete

**Code Structure**:

**State Management**:
```typescript
const [isOpen, setIsOpen] = useState(false);
const [currentStep, setCurrentStep] = useState(0);
const [saving, setSaving] = useState(false);
const [uploading, setUploading] = useState(false);
const [usernameError, setUsernameError] = useState('');
const [formData, setFormData] = useState({
  username: '',
  display_name: '',
  bio: '',
  avatar_url: '',
  useOAuthAvatar: true,
});
```

**Show Condition**:
```typescript
useEffect(() => {
  if (!profile || !user) return;

  const hasCompletedOnboarding = profile.settings?.onboardingCompleted;
  const hasUsername = profile.username && profile.username.trim() !== '';
  const hasDisplayName = profile.display_name && profile.display_name.trim() !== '';

  // Show if not completed AND missing essential info
  if (!hasCompletedOnboarding && (!hasUsername || !hasDisplayName)) {
    setIsOpen(true);
  }
}, [profile, user]);
```

**What it checks**:
- Profile exists
- Onboarding not marked as complete
- Missing username or display name
- Only shows once per session

**Username Validation**:
```typescript
const validateUsername = async (username: string): Promise<boolean> => {
  // Length check
  if (username.length < 3 || username.length > 20) {
    setUsernameError('Username must be 3-20 characters');
    return false;
  }

  // Format check (alphanumeric + underscore)
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    setUsernameError('Only letters, numbers, and underscores allowed');
    return false;
  }

  // Availability check
  const { data } = await supabase
    .from('profiles')
    .select('username')
    .eq('username', username)
    .maybeSingle();

  if (data) {
    setUsernameError('Username is already taken');
    return false;
  }

  return true;
};
```

**Validation Rules**:
- 3-20 characters
- Alphanumeric + underscores only
- Must be unique (checked against database)
- Case-insensitive (stored as lowercase)

**Avatar Upload**:
```typescript
const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (!file || !user) return;

  // Validate file
  const validation = validateAvatarFile(file);
  if (!validation.valid) {
    toast.error(validation.error);
    return;
  }

  setUploading(true);
  setUploadProgress(0);

  // Upload to Supabase Storage
  const result = await uploadAvatar({
    file,
    userId: user.id,
    onProgress: setUploadProgress,
  });

  if (result.success) {
    setFormData({ ...formData, avatar_url: result.url, useOAuthAvatar: false });
    toast.success('Avatar uploaded!');
  }

  setUploading(false);
};
```

**Upload Flow**:
1. User selects file
2. Validates file type and size
3. Shows progress bar
4. Uploads to Supabase Storage
5. Updates form data with new URL
6. Shows success toast

**Step Navigation**:
```typescript
const handleNext = async () => {
  // Validate current step before proceeding
  if (currentStep === 1) {
    const isValid = await validateUsername(formData.username);
    if (!isValid) return;
  }

  if (currentStep === 2) {
    if (!formData.display_name.trim()) {
      toast.warning('Please enter a display name');
      return;
    }
  }

  if (currentStep < 3) {
    setCurrentStep(currentStep + 1);
  }
};

const handleBack = () => {
  if (currentStep > 0) {
    setCurrentStep(currentStep - 1);
  }
};
```

**Completion**:
```typescript
const handleComplete = async () => {
  // Final validation
  const isUsernameValid = await validateUsername(formData.username);
  if (!isUsernameValid) {
    setCurrentStep(1);
    return;
  }

  setSaving(true);

  // Determine avatar to use
  const avatarToUse = formData.useOAuthAvatar 
    ? (user.user_metadata?.avatar_url || profile?.avatar_url) 
    : formData.avatar_url;

  // Save to database
  const { error } = await supabase
    .from('profiles')
    .update({
      username: formData.username.toLowerCase(),
      display_name: formData.display_name,
      bio: formData.bio || null,
      avatar_url: avatarToUse || null,
      settings: {
        ...profile?.settings,
        onboardingCompleted: true,
        onboardingCompletedAt: new Date().toISOString(),
      }
    })
    .eq('id', user.id);

  if (error) {
    toast.error(`Failed to save: ${error.message}`);
    return;
  }

  setIsOpen(false);
  await refreshProfile();
  toast.success('🎉 Welcome to Eventive!');
  setSaving(false);
};
```

**Steps Flow**:
```
Step 0: Avatar Selection
  ↓
Step 1: Username (validated)
  ↓
Step 2: Display Name (required)
  ↓
Step 3: Bio (optional)
  ↓
Complete → Save to DB → Refresh profile → Close modal
```

---

## Loading Components

### Spinner

**File**: `src/components/Spinner.tsx`

**Purpose**: Simple inline loading indicator

**Full Code**:
```typescript
import '../styles/spinner.css';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

export function Spinner({ size = 'md', color }: SpinnerProps) {
  return (
    <div 
      className={`spinner spinner-${size}`}
      style={color ? { borderTopColor: color } : undefined}
    />
  );
}
```

**Props**:
- `size`: Spinner size (sm: 16px, md: 32px, lg: 48px)
- `color`: Optional custom color for spinner

**CSS** (`spinner.css`):
```css
.spinner {
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.spinner-sm { width: 16px; height: 16px; border-width: 2px; }
.spinner-md { width: 32px; height: 32px; }
.spinner-lg { width: 48px; height: 48px; border-width: 4px; }

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

**Usage**:
```typescript
// Default
<Spinner />

// Small spinner
<Spinner size="sm" />

// Custom color
<Spinner color="#ff0000" />

// In a button
<button disabled={loading}>
  {loading ? <Spinner size="sm" /> : 'Submit'}
</button>
```

---

### SkeletonLoader

**File**: `src/components/SkeletonLoader.tsx`

**Purpose**: Content placeholder during data loading

**Full Code**:
```typescript
import '../styles/skeleton.css';

interface SkeletonLoaderProps {
  type?: 'text' | 'card' | 'avatar' | 'custom';
  count?: number;
  width?: string;
  height?: string;
}

export function SkeletonLoader({ 
  type = 'text', 
  count = 1,
  width,
  height 
}: SkeletonLoaderProps) {
  const skeletons = Array.from({ length: count }, (_, i) => i);

  const getSkeletonClass = () => {
    switch (type) {
      case 'card':
        return 'skeleton-card';
      case 'avatar':
        return 'skeleton-avatar';
      case 'custom':
        return 'skeleton-custom';
      default:
        return 'skeleton-text';
    }
  };

  return (
    <>
      {skeletons.map((key) => (
        <div
          key={key}
          className={`skeleton ${getSkeletonClass()}`}
          style={width || height ? { width, height } : undefined}
        />
      ))}
    </>
  );
}
```

**Props**:
- `type`: Skeleton style (text, card, avatar, custom)
- `count`: Number of skeletons to render
- `width`: Custom width (for custom type)
- `height`: Custom height (for custom type)

**CSS Animation** (`skeleton.css`):
```css
.skeleton {
  background: linear-gradient(
    90deg,
    #f0f0f0 25%,
    #e0e0e0 50%,
    #f0f0f0 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-text {
  height: 16px;
  margin-bottom: 8px;
  border-radius: 4px;
}

.skeleton-card {
  height: 200px;
  border-radius: 8px;
  margin-bottom: 16px;
}

.skeleton-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
```

**Usage**:
```typescript
// Text skeleton
<SkeletonLoader type="text" count={3} />

// Card skeleton
<SkeletonLoader type="card" count={2} />

// Avatar skeleton
<SkeletonLoader type="avatar" />

// Custom size
<SkeletonLoader type="custom" width="100%" height="300px" />

// Loading state pattern
{loading ? (
  <SkeletonLoader type="card" count={3} />
) : (
  posts.map(post => <PostCard post={post} />)
)}
```

---

### Toast

**File**: `src/components/Toast.tsx`

**Purpose**: Individual toast notification with auto-dismiss

**Full Code**:
```typescript
import { useEffect } from 'react';
import '../styles/toast.css';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  message: string;
  type: ToastType;
  onDismiss: () => void;
}

export default function Toast({ message, type, onDismiss }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onDismiss]);

  const getIcon = () => {
    switch (type) {
      case 'success': return '✓';
      case 'error': return '✕';
      case 'warning': return '⚠';
      case 'info': return 'ℹ';
    }
  };

  return (
    <div className={`toast toast--${type}`}>
      <span className="toast__icon">{getIcon()}</span>
      <span className="toast__message">{message}</span>
      <button className="toast__close" onClick={onDismiss}>
        ✕
      </button>
    </div>
  );
}
```

**Code Breakdown**:

**Auto-Dismiss Timer**:
```typescript
useEffect(() => {
  const timer = setTimeout(() => {
    onDismiss();
  }, 5000);

  return () => clearTimeout(timer);
}, [onDismiss]);
```
- Sets 5-second timer to auto-dismiss
- Cleans up timer on unmount
- Prevents memory leaks

**Icon Selection**:
```typescript
const getIcon = () => {
  switch (type) {
    case 'success': return '✓';
    case 'error': return '✕';
    case 'warning': return '⚠';
    case 'info': return 'ℹ';
  }
};
```
- Maps toast type to appropriate icon
- Visual indicator of notification type

**Styling** (`toast.css`):
```css
.toast {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: slideIn 0.3s ease-out;
}

.toast--success { background: #10b981; color: white; }
.toast--error { background: #ef4444; color: white; }
.toast--warning { background: #f59e0b; color: white; }
.toast--info { background: #3b82f6; color: white; }

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
```

**Usage**:
```typescript
// Managed by ToastContext
// Don't use directly, use useToast() hook

import { useToast } from '@/contexts/ToastContext';

const { showToast } = useToast();

showToast('Profile updated!', 'success');
showToast('Failed to save', 'error');
showToast('Check your email', 'info');
showToast('Low disk space', 'warning');
```

---

## Related Documentation

- [Core Files](./core-files.md) - Main entry points and libraries
- [Contexts Reference](./contexts.md) - AuthContext and ToastContext
- [Pages Reference](./pages.md) - All page components
- [Contributor Guide](../contributing/contributor-guide.md) - Development workflow
