# Context Providers Reference

This document provides detailed code documentation for React Context providers in the Eventive application.

## AuthContext

**File**: `src/contexts/AuthContext.tsx`

**Purpose**: Global authentication state management with session caching

### Full Code

```typescript
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_CACHE_KEY = 'auth_session_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface SessionCache {
  session: Session | null;
  timestamp: number;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Get cached session if valid
  const getCachedSession = (): Session | null => {
    try {
      const cached = localStorage.getItem(SESSION_CACHE_KEY);
      if (!cached) return null;

      const { session, timestamp }: SessionCache = JSON.parse(cached);
      const now = Date.now();

      // Return cached session if less than 5 minutes old
      if (now - timestamp < CACHE_DURATION) {
        return session;
      }

      // Clear expired cache
      localStorage.removeItem(SESSION_CACHE_KEY);
      return null;
    } catch {
      return null;
    }
  };

  // Cache session
  const cacheSession = (session: Session | null) => {
    if (session) {
      const cache: SessionCache = {
        session,
        timestamp: Date.now(),
      };
      localStorage.setItem(SESSION_CACHE_KEY, JSON.stringify(cache));
    } else {
      localStorage.removeItem(SESSION_CACHE_KEY);
    }
  };

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Try cached session first
        const cached = getCachedSession();
        if (cached?.user) {
          setUser(cached.user);
          setLoading(false);
          return;
        }

        // Fetch from Supabase
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
        cacheSession(session);
      } catch (error) {
        console.error('Error fetching session:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        cacheSession(session);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Sign in
  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    setUser(data.user);
    cacheSession(data.session);
  };

  // Sign out
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    setUser(null);
    cacheSession(null);
  };

  // Refresh session
  const refreshSession = async () => {
    const { data: { session }, error } = await supabase.auth.refreshSession();
    
    if (error) throw error;

    setUser(session?.user ?? null);
    cacheSession(session);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut, refreshSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

### Code Breakdown

#### Context Definition

```typescript
interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
```

**What it does**:
- Defines the shape of the authentication context
- Creates React Context with TypeScript types
- Initial value is `undefined` (enforces usage within provider)

---

#### Session Caching

```typescript
const SESSION_CACHE_KEY = 'auth_session_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface SessionCache {
  session: Session | null;
  timestamp: number;
}

const getCachedSession = (): Session | null => {
  try {
    const cached = localStorage.getItem(SESSION_CACHE_KEY);
    if (!cached) return null;

    const { session, timestamp }: SessionCache = JSON.parse(cached);
    const now = Date.now();

    if (now - timestamp < CACHE_DURATION) {
      return session;
    }

    localStorage.removeItem(SESSION_CACHE_KEY);
    return null;
  } catch {
    return null;
  }
};

const cacheSession = (session: Session | null) => {
  if (session) {
    const cache: SessionCache = {
      session,
      timestamp: Date.now(),
    };
    localStorage.setItem(SESSION_CACHE_KEY, JSON.stringify(cache));
  } else {
    localStorage.removeItem(SESSION_CACHE_KEY);
  }
};
```

**What it does**:
- **`getCachedSession()`**: Retrieves session from localStorage if < 5 minutes old
- **`cacheSession()`**: Stores session with timestamp in localStorage
- **Benefits**: Reduces Supabase API calls, improves performance

**Cache Flow**:
```
Check localStorage → Valid? → Return cached session → Set user immediately
                   ↓
                  Invalid/Missing → Fetch from Supabase → Cache → Set user
```

---

#### Initialization

```typescript
useEffect(() => {
  const initAuth = async () => {
    try {
      // Try cached session first
      const cached = getCachedSession();
      if (cached?.user) {
        setUser(cached.user);
        setLoading(false);
        return;
      }

      // Fetch from Supabase
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      cacheSession(session);
    } catch (error) {
      console.error('Error fetching session:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  initAuth();

  // Listen for auth changes
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (_event, session) => {
      setUser(session?.user ?? null);
      cacheSession(session);
    }
  );

  return () => subscription.unsubscribe();
}, []);
```

**What it does**:
1. **Check cache first**: Instantly sets user if valid cache exists
2. **Fallback to Supabase**: Fetches session if no cache
3. **Listen for changes**: Subscribes to auth state changes (login, logout, token refresh)
4. **Cleanup**: Unsubscribes on unmount

**Auth Events**:
- `SIGNED_IN`: User logged in
- `SIGNED_OUT`: User logged out
- `TOKEN_REFRESHED`: Token was automatically refreshed
- `USER_UPDATED`: User metadata changed

---

#### Authentication Methods

**Sign In**:
```typescript
const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;

  setUser(data.user);
  cacheSession(data.session);
};
```

**Sign Out**:
```typescript
const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;

  setUser(null);
  cacheSession(null);
};
```

**Refresh Session**:
```typescript
const refreshSession = async () => {
  const { data: { session }, error } = await supabase.auth.refreshSession();
  
  if (error) throw error;

  setUser(session?.user ?? null);
  cacheSession(session);
};
```

---

#### Custom Hook

```typescript
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

**What it does**:
- Provides type-safe access to auth context
- Throws error if used outside provider (helpful for debugging)
- Returns all auth values and methods

---

### Usage Examples

**In a Component**:
```typescript
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, loading, signIn, signOut } = useAuth();

  if (loading) {
    return <Spinner />;
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div>
      <p>Welcome, {user.email}!</p>
      <button onClick={signOut}>Logout</button>
    </div>
  );
}
```

**Login Form**:
```typescript
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const { signIn } = useAuth();

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  try {
    await signIn(email, password);
    // Redirect handled by AuthProvider
  } catch (error) {
    console.error('Login failed:', error);
  }
};
```

---

## ToastContext

**File**: `src/contexts/ToastContext.tsx`

**Purpose**: Global toast notification system

### Full Code

```typescript
import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import Toast from '../components/Toast';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 5000);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-container">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onDismiss={() => dismissToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
```

### Code Breakdown

#### Toast State

```typescript
type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

const [toasts, setToasts] = useState<ToastMessage[]>([]);
```

**What it does**:
- Defines 4 toast types with different colors
- Each toast has unique ID (timestamp), message, and type
- State array holds all active toasts

---

#### Show Toast

```typescript
const showToast = useCallback((message: string, type: ToastType = 'info') => {
  const id = Date.now();
  setToasts((prev) => [...prev, { id, message, type }]);

  // Auto-dismiss after 5 seconds
  setTimeout(() => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, 5000);
}, []);
```

**What it does**:
1. Generates unique ID using timestamp
2. Adds new toast to array
3. Sets 5-second timer to auto-dismiss
4. Uses `useCallback` to memoize function (performance)

**Flow**:
```
showToast() → Add to array → Display toast → Wait 5s → Remove from array
                                           ↑
                            User clicks dismiss → Remove immediately
```

---

#### Dismiss Toast

```typescript
const dismissToast = useCallback((id: number) => {
  setToasts((prev) => prev.filter((toast) => toast.id !== id));
}, []);
```

**What it does**:
- Removes toast by ID
- Called by auto-dismiss timer or user click

---

#### Rendering

```typescript
return (
  <ToastContext.Provider value={{ showToast }}>
    {children}
    <div className="toast-container">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onDismiss={() => dismissToast(toast.id)}
        />
      ))}
    </div>
  </ToastContext.Provider>
);
```

**What it does**:
- Provides `showToast` to all children
- Renders toast container at root level
- Maps over toasts array to render each toast
- Passes dismiss handler to each toast

---

### Usage Examples

**Basic Usage**:
```typescript
import { useToast } from '@/contexts/ToastContext';

function MyComponent() {
  const { showToast } = useToast();

  const handleSuccess = () => {
    showToast('Changes saved successfully!', 'success');
  };

  const handleError = () => {
    showToast('Failed to save changes', 'error');
  };

  const handleInfo = () => {
    showToast('New feature available', 'info');
  };

  const handleWarning = () => {
    showToast('Your session will expire soon', 'warning');
  };

  return (
    <div>
      <button onClick={handleSuccess}>Save</button>
      <button onClick={handleError}>Delete</button>
    </div>
  );
}
```

**With API Calls**:
```typescript
const { showToast } = useToast();

const updateProfile = async (data) => {
  try {
    await apiClient.put('/users/me', data);
    showToast('Profile updated!', 'success');
  } catch (error) {
    showToast(error.message || 'Update failed', 'error');
  }
};
```

**Multiple Toasts**:
```typescript
// Toasts stack automatically
showToast('Loading...', 'info');
showToast('Processing...', 'info');
showToast('Complete!', 'success');

// All three appear and auto-dismiss independently
```

---

## Context Best Practices

### When to Use Context

✅ **Good Use Cases**:
- Authentication state (user, session)
- Global UI state (theme, notifications)
- Configuration values
- Localization/i18n

❌ **Bad Use Cases**:
- Frequently changing data (use local state)
- Form state (use local state)
- Server cache (use React Query/SWR)

### Performance Considerations

**Problem**: Context updates re-render all consumers

**Solution**: Split contexts by update frequency
```typescript
// ❌ Bad: Everything in one context
<UserContext.Provider value={{ user, notifications, settings }}>

// ✅ Good: Split by concern
<UserContext.Provider value={{ user }}>
  <NotificationsContext.Provider value={{ notifications }}>
    <SettingsContext.Provider value={{ settings }}>
```

### Error Handling

Always validate context usage:
```typescript
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

This prevents runtime errors and makes debugging easier.

---

## Related Documentation

- [Core Files](./core-files.md) - Main entry points and libraries
- [Components Reference](./components.md) - All components
- [Contributor Guide](../contributing/contributor-guide.md) - Development workflow
