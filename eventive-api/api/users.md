---
title: API Endpoints - Users
description: User management endpoints for EventiveAPI
---

# User Endpoints

Manage user profiles, including retrieval and updates.

## Endpoints

### Get Current User Profile

Get the authenticated user's complete profile information.

```http
GET /api/users/me
Authorization: Bearer {access_token}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "johndoe",
    "display_name": "John Doe",
    "avatar_url": "https://project.supabase.co/storage/v1/object/public/avatars/user-id/avatar.jpg",
    "bio": "Software developer and tech enthusiast",
    "role": "user",
    "settings": {
      "theme": "dark",
      "notifications": true
    },
    "created_at": "2025-01-15T10:30:00Z",
    "updated_at": "2025-01-20T14:22:00Z"
  }
}
```

**Error Responses:**

`401 Unauthorized` - Missing or invalid token

```json
{
  "success": false,
  "error": {
    "message": "User not authenticated"
  }
}
```

`404 Not Found` - Profile doesn't exist

```json
{
  "success": false,
  "error": {
    "message": "Profile not found"
  }
}
```

---

### Update Current User Profile

Update the authenticated user's profile information.

```http
PUT /api/users/me
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Request Body:**

```json
{
  "display_name": "Jane Doe",
  "username": "janedoe",
  "bio": "Full-stack developer | Open source enthusiast"
}
```

**Validation Rules:**
- `display_name`: 1-50 characters
- `username`: 3-30 characters, alphanumeric + underscore only, must be unique
- `bio`: 0-500 characters

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "janedoe",
    "display_name": "Jane Doe",
    "avatar_url": "https://...",
    "bio": "Full-stack developer | Open source enthusiast",
    "role": "user",
    "settings": {...},
    "created_at": "2025-01-15T10:30:00Z",
    "updated_at": "2025-01-22T09:15:00Z"
  }
}
```

**Error Responses:**

`400 Bad Request` - Validation error

```json
{
  "success": false,
  "error": {
    "message": "Username must be between 3 and 30 characters"
  }
}
```

`409 Conflict` - Username already taken

```json
{
  "success": false,
  "error": {
    "message": "Username already exists"
  }
}
```

---

### Get User Profile by ID

Get a public user profile by their ID.

```http
GET /api/users/:id
```

**Parameters:**
- `id` (path) - User UUID

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "johndoe",
    "display_name": "John Doe",
    "avatar_url": "https://...",
    "bio": "Software developer",
    "created_at": "2025-01-15T10:30:00Z"
  }
}
```

::: warning Privacy
This endpoint only returns public profile information. Email, role, and settings are excluded for privacy.
:::

**Error Responses:**

`404 Not Found` - Profile doesn't exist

```json
{
  "success": false,
  "error": {
    "message": "Profile not found"
  }
}
```

`403 Forbidden` - Profile is private

```json
{
  "success": false,
  "error": {
    "message": "This profile is private"
  }
}
```

---

### Delete User Account

Delete the authenticated user's account (coming soon).

```http
DELETE /api/users/me
Authorization: Bearer {access_token}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Account deleted successfully"
}
```

::: danger Data Loss
This action permanently deletes the user's profile, uploaded files, and all associated data. This cannot be undone.
:::

## Data Model

### Profile Schema

```typescript
interface Profile {
  id: string;                    // UUID, references auth.users
  username?: string;             // Unique username
  display_name?: string;         // Display name
  avatar_url?: string;           // Avatar image URL
  bio?: string;                  // User biography
  role: 'user' | 'admin';       // User role
  settings?: Record<string, any>; // User preferences (JSONB)
  created_at: string;            // ISO 8601 timestamp
  updated_at: string;            // ISO 8601 timestamp
}
```

### Database Table

```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Profile Creation

Profiles are automatically created on first login through the `AuthContext`:

```typescript
// On successful OAuth login
const { data: newProfile } = await supabase
  .from('profiles')
  .insert({
    id: user.id,
    display_name: user.user_metadata?.full_name || 
                  user.user_metadata?.name ||
                  user.email?.split('@')[0],
    avatar_url: user.user_metadata?.avatar_url
  })
```

## Profile Caching

The frontend implements a caching strategy for better performance:

- **Memory Cache**: 5-minute TTL
- **LocalStorage Cache**: 5-minute TTL fallback
- **Force Refresh**: After profile updates

```typescript
// Get cached profile
const cached = getCachedProfile(userId)

// Force refresh after update
await refreshProfile()
```

## Examples

### Get My Profile

```javascript
// Get access token
const { data: { session } } = await supabase.auth.getSession()

// Fetch profile
const response = await fetch('http://localhost:3001/api/users/me', {
  headers: {
    'Authorization': `Bearer ${session.access_token}`
  }
})

const data = await response.json()
console.log(data.data.display_name)
```

### Update My Profile

```javascript
const response = await fetch('http://localhost:3001/api/users/me', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${session.access_token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    display_name: 'New Name',
    bio: 'Updated bio'
  })
})

const data = await response.json()
```

### Get Public Profile

```javascript
const userId = '550e8400-e29b-41d4-a716-446655440000'

const response = await fetch(`http://localhost:3001/api/users/${userId}`)
const data = await response.json()
```

## Rate Limiting

User endpoints have the following rate limits:

| Endpoint | Limit | Window |
|----------|-------|--------|
| `GET /api/users/me` | 60 requests | 1 minute |
| `PUT /api/users/me` | 20 requests | 1 minute |
| `GET /api/users/:id` | 100 requests | 1 minute |

## Security

### Row Level Security (RLS)

Profiles are protected by Supabase RLS policies:

```sql
-- Users can view all profiles
CREATE POLICY "Profiles are viewable by everyone" 
  ON profiles FOR SELECT 
  USING (true);

-- Users can only update their own profile
CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);
```

### Input Validation

All user input is validated using Zod schemas:

```typescript
const updateProfileSchema = z.object({
  display_name: z.string().min(1).max(50).optional(),
  username: z.string()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/)
    .optional(),
  bio: z.string().max(500).optional()
})
```

## Testing

### cURL Examples

```bash
# Get my profile
curl -X GET http://localhost:3001/api/users/me \
  -H "Authorization: Bearer YOUR_TOKEN"

# Update profile
curl -X PUT http://localhost:3001/api/users/me \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "display_name": "New Name",
    "bio": "Updated bio"
  }'

# Get public profile
curl -X GET http://localhost:3001/api/users/USER_ID
```

### Automated Tests

```typescript
import { describe, it, expect } from 'vitest'

describe('GET /api/users/me', () => {
  it('should return user profile when authenticated', async () => {
    const response = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${validToken}`)
    
    expect(response.status).toBe(200)
    expect(response.body.success).toBe(true)
    expect(response.body.data).toHaveProperty('id')
    expect(response.body.data).toHaveProperty('display_name')
  })
  
  it('should return 401 when not authenticated', async () => {
    const response = await request(app)
      .get('/api/users/me')
    
    expect(response.status).toBe(401)
    expect(response.body.success).toBe(false)
  })
})
```

## Related Documentation

- [Authentication](/eventive-api/api/authentication) - Auth flow
- [Settings API](/eventive-api/api/settings) - User settings
- [Upload API](/eventive-api/api/uploads) - Avatar uploads
- [Security](/eventive-api/security/authentication) - Security practices

---

**Questions?** Check the [API Format Guide](/eventive-api/api/format) or [open an issue](https://github.com/Juno-Labs-Team/EventiveAPI/issues).
