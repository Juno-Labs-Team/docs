# Settings API

The Settings API allows users to manage their application settings stored in their profile.

## Overview

User settings are stored as a JSONB field in the `profiles` table, allowing flexible storage of user preferences without schema changes. Settings are scoped to individual users and can only be accessed by the authenticated user.

## Authentication

All settings endpoints require authentication. Include the session token in the `Authorization` header:

```http
Authorization: Bearer <session_token>
```

## Endpoints

### Get User Settings

Retrieve the current user's settings.

::: code-group
```http [Request]
GET /api/settings
Authorization: Bearer <session_token>
```

```json [Response - Success]
{
  "success": true,
  "data": {
    "theme": "dark",
    "notifications": {
      "email": true,
      "push": false
    },
    "language": "en",
    "timezone": "America/New_York"
  }
}
```

```json [Response - Empty Settings]
{
  "success": true,
  "data": {}
}
```

```json [Response - Error]
{
  "success": false,
  "error": {
    "message": "Settings not found"
  }
}
```
:::

#### Response Codes

| Code | Description |
|------|-------------|
| `200` | Settings retrieved successfully |
| `401` | User not authenticated |
| `404` | Settings not found (profile doesn't exist) |
| `500` | Server error |

---

### Update User Settings

Update the current user's settings. This operation **replaces** the entire settings object.

::: code-group
```http [Request]
PUT /api/settings
Authorization: Bearer <session_token>
Content-Type: application/json

{
  "theme": "dark",
  "notifications": {
    "email": true,
    "push": false
  },
  "language": "en",
  "timezone": "America/New_York"
}
```

```json [Response - Success]
{
  "success": true,
  "data": {
    "theme": "dark",
    "notifications": {
      "email": true,
      "push": false
    },
    "language": "en",
    "timezone": "America/New_York"
  }
}
```

```json [Response - Error]
{
  "success": false,
  "error": {
    "message": "Database error message"
  }
}
```
:::

#### Request Body

The request body can contain any valid JSON object. Common settings structures:

```typescript
interface UserSettings {
  // Display preferences
  theme?: 'light' | 'dark' | 'auto';
  language?: string;
  timezone?: string;
  
  // Notification preferences
  notifications?: {
    email?: boolean;
    push?: boolean;
    digest?: boolean;
  };
  
  // Privacy settings
  privacy?: {
    profileVisible?: boolean;
    showEmail?: boolean;
  };
  
  // Feature flags
  features?: {
    betaFeatures?: boolean;
    analyticsEnabled?: boolean;
  };
}
```

::: warning Important
The PUT operation **replaces** the entire settings object. To update specific fields while preserving others, you need to:
1. GET the current settings
2. Merge your changes
3. PUT the complete updated object
:::

#### Response Codes

| Code | Description |
|------|-------------|
| `200` | Settings updated successfully |
| `400` | Invalid request or database error |
| `401` | User not authenticated |
| `500` | Server error |

## Data Model

### Database Schema

Settings are stored in the `profiles` table:

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  settings JSONB DEFAULT '{}'::jsonb,  -- Flexible settings storage
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### TypeScript Interface

```typescript
interface SettingsResponse {
  success: boolean;
  data?: Record<string, any>;  // Settings object
  error?: {
    message: string;
  };
}
```

## Rate Limiting

Settings endpoints are rate-limited to prevent abuse:

- **Window**: 15 minutes
- **Max Requests**: 100 per window

Rate limit headers are included in responses:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1699123456
```

## Security

### Row Level Security (RLS)

Settings are protected by RLS policies:

```sql
-- Users can only read their own settings
CREATE POLICY "Users can view own settings"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can only update their own settings
CREATE POLICY "Users can update own settings"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);
```

### Input Validation

- **Settings Object**: Must be valid JSON (automatically parsed by Express)
- **Size Limit**: JSONB fields have a practical limit of ~1MB
- **No Schema Validation**: Settings accept any JSON structure (be careful!)

::: tip Best Practice
While the API accepts any JSON structure, implement client-side validation to ensure settings follow your expected schema. This prevents data corruption and makes debugging easier.
:::

## Usage Examples

### React Hook for Settings

```typescript
import { useState, useEffect } from 'react';
import apiClient from '@/lib/apiClient';

interface UserSettings {
  theme?: string;
  notifications?: {
    email?: boolean;
    push?: boolean;
  };
}

export function useSettings() {
  const [settings, setSettings] = useState<UserSettings>({});
  const [loading, setLoading] = useState(true);

  // Load settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await apiClient.get('/settings');
        if (response.data.success) {
          setSettings(response.data.data);
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadSettings();
  }, []);

  // Update settings
  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    try {
      // Merge with existing settings
      const merged = { ...settings, ...newSettings };
      
      const response = await apiClient.put('/settings', merged);
      
      if (response.data.success) {
        setSettings(response.data.data);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to update settings:', error);
      return false;
    }
  };

  return { settings, updateSettings, loading };
}
```

### Update Individual Setting

```typescript
// Update theme without affecting other settings
async function updateTheme(theme: 'light' | 'dark') {
  // Get current settings
  const response = await apiClient.get('/settings');
  const currentSettings = response.data.data;
  
  // Update theme
  await apiClient.put('/settings', {
    ...currentSettings,
    theme,
  });
}
```

### Settings Migration Pattern

```typescript
// Handle settings schema changes gracefully
function migrateSettings(settings: any): UserSettings {
  return {
    theme: settings.theme || 'light',
    notifications: {
      email: settings.notifications?.email ?? true,
      push: settings.notifications?.push ?? false,
    },
    // Add new fields with defaults
    language: settings.language || 'en',
  };
}
```

## Testing

### Manual Testing with cURL

```bash
# Get settings
curl -X GET http://localhost:3000/api/settings \
  -H "Authorization: Bearer <session_token>"

# Update settings
curl -X PUT http://localhost:3000/api/settings \
  -H "Authorization: Bearer <session_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "theme": "dark",
    "notifications": {
      "email": true,
      "push": false
    }
  }'
```

### Automated Tests

```typescript
import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/index';

describe('Settings API', () => {
  let authToken: string;
  
  beforeAll(async () => {
    // Login to get auth token
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password' });
    authToken = loginRes.body.data.session.access_token;
  });

  it('should get empty settings for new user', async () => {
    const res = await request(app)
      .get('/api/settings')
      .set('Authorization', `Bearer ${authToken}`);
    
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual({});
  });

  it('should update settings', async () => {
    const newSettings = {
      theme: 'dark',
      language: 'en',
    };
    
    const res = await request(app)
      .put('/api/settings')
      .set('Authorization', `Bearer ${authToken}`)
      .send(newSettings);
    
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual(newSettings);
  });

  it('should persist settings across requests', async () => {
    // Get settings again
    const res = await request(app)
      .get('/api/settings')
      .set('Authorization', `Bearer ${authToken}`);
    
    expect(res.status).toBe(200);
    expect(res.body.data.theme).toBe('dark');
  });

  it('should reject unauthenticated requests', async () => {
    const res = await request(app).get('/api/settings');
    expect(res.status).toBe(401);
  });
});
```

## Common Patterns

### Settings Provider (React Context)

```typescript
import React, { createContext, useContext } from 'react';

interface SettingsContextType {
  settings: UserSettings;
  updateSettings: (settings: Partial<UserSettings>) => Promise<boolean>;
  loading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const { settings, updateSettings, loading } = useSettings();
  
  return (
    <SettingsContext.Provider value={{ settings, updateSettings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettingsContext() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettingsContext must be used within SettingsProvider');
  }
  return context;
}
```

### Optimistic Updates

```typescript
async function updateTheme(theme: string) {
  // Optimistically update UI
  setSettings(prev => ({ ...prev, theme }));
  
  try {
    // Save to server
    const response = await apiClient.put('/settings', {
      ...settings,
      theme,
    });
    
    if (!response.data.success) {
      // Revert on failure
      setSettings(prev => ({ ...prev, theme: settings.theme }));
    }
  } catch (error) {
    // Revert on error
    setSettings(prev => ({ ...prev, theme: settings.theme }));
  }
}
```

## Troubleshooting

### Settings Not Persisting

**Problem**: Settings appear to save but are lost on refresh

**Solutions**:
- Verify the user's profile exists in the `profiles` table
- Check that the `updated_at` trigger is working
- Ensure RLS policies allow the user to UPDATE their profile
- Check for database errors in server logs

### Settings Lost on Update

**Problem**: Updating one setting removes others

**Cause**: PUT replaces the entire settings object

**Solution**: Always merge with existing settings:
```typescript
const current = await getSettings();
await updateSettings({ ...current, newField: 'value' });
```

### Large Settings Object

**Problem**: Settings object becoming too large

**Solutions**:
- Move large data to separate tables
- Implement pagination for list-type settings
- Use separate storage buckets for files
- Consider breaking settings into categories

## Related Documentation

- [Users API](./users.md) - User profile management
- [Authentication API](./authentication.md) - Auth flow and session management
- [File Reference - settings.routes.ts](/eventive-api/reference/file-reference#settings-routes-ts) - Implementation details
