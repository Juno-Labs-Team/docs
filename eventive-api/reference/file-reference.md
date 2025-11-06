---
title: File Reference - Backend
description: Complete reference of every file in the EventiveAPI backend codebase
---

# File Reference - Backend

Detailed explanation of every file in the EventiveAPI backend project.

## Core Application Files

### `/src/index.ts`

**Purpose**: Main application entry point and server setup

**What it does**:
- Loads environment variables
- Creates Express application instance
- Configures security middleware (Helmet, CORS)
- Sets up compression and logging
- Mounts API routes
- Defines health check endpoint
- Implements error handlers
- Starts HTTP server

**Middleware Stack (in order)**:
1. `helmet()` - Security headers
2. `cors()` - Cross-origin resource sharing
3. `compression()` - Response compression
4. `morgan()` - HTTP request logging
5. `express.json()` - JSON body parsing
6. `express.urlencoded()` - URL-encoded body parsing

**Routes Mounted**:
```typescript
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/settings', settingsRoutes)
app.use('/api/uploads', uploadRoutes)
```

**Server Startup**:
```typescript
const PORT = config.port // Default: 3001
app.listen(PORT, () => {
  console.log(`🚀 EventiveAPI server running on port ${PORT}`)
  console.log(`📝 Environment: ${config.nodeEnv}`)
  console.log(`🔗 Health check: http://localhost:${PORT}/health`)
  console.log(`📚 API docs: http://localhost:${PORT}/docs`)
})
```

**Health Check Endpoint**:
```http
GET /health
Response: {
  status: 'ok',
  timestamp: '2025-11-05T10:30:00Z',
  uptime: 123.45,
  environment: 'development'
}
```

---

## Configuration Files

### `/src/config/index.ts`

**Purpose**: Centralized application configuration

**What it exports**:
```typescript
export const config = {
  // Server
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // CORS
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  
  // Supabase
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  
  // Storage
  avatarBucket: process.env.AVATAR_BUCKET || 'avatars',
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880'), // 5MB
  
  // Rate Limiting
  rateLimitWindowMs: 60000, // 1 minute
  rateLimitMaxRequests: 100
}
```

**Validation**:
- Checks required environment variables on startup
- Throws error if missing critical config
- Provides sensible defaults for optional values

**Usage**:
```typescript
import { config } from './config/index.js'

cors({ origin: config.corsOrigin })
```

---

### `/src/config/supabase.ts`

**Purpose**: Supabase client initialization

**What it does**:
- Creates Supabase client with service role key
- Exports singleton instance
- Configures for server-side use
- Bypasses RLS (Row Level Security) when needed

**Code**:
```typescript
import { createClient } from '@supabase/supabase-js'
import { config } from './index.js'

export const supabase = createClient(
  config.supabaseUrl!,
  config.supabaseServiceKey!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)
```

**When to Use Service Key**:
- ✅ Server-side operations
- ✅ Admin operations
- ✅ Bypassing RLS policies
- ❌ Never expose to frontend

**Usage**:
```typescript
import { supabase } from '../config/supabase.js'

const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId)
  .single()
```

---

## Middleware

### `/src/middleware/auth.ts`

**Purpose**: JWT authentication middleware

**What it does**:
- Extracts JWT token from Authorization header
- Validates token with Supabase
- Fetches user role from database
- Attaches user info to request object
- Returns 401 for invalid/missing tokens

**Exports**:

#### `authenticateUser` Middleware

```typescript
export async function authenticateUser(
  req: AuthRequest,
  res: Response,
  next: NextFunction
)
```

**Flow**:
1. Check for `Authorization: Bearer <token>` header
2. Extract token
3. Verify with `supabase.auth.getUser(token)`
4. Fetch user role from profiles table
5. Attach `req.user` object
6. Call `next()`

**Attached to Request**:
```typescript
req.user = {
  id: string        // User UUID
  email: string     // User email
  role: string      // 'user' or 'admin'
}
```

#### `requireAdmin` Middleware

```typescript
export function requireAdmin(
  req: AuthRequest,
  res: Response,
  next: NextFunction
)
```

**What it does**:
- Checks if `req.user.role === 'admin'`
- Returns 403 if not admin
- Must be used after `authenticateUser`

**Usage**:
```typescript
router.delete('/users/:id', 
  authenticateUser, 
  requireAdmin, 
  deleteUserHandler
)
```

---

### `/src/middleware/errorHandler.ts`

**Purpose**: Global error handling middleware

**What it does**:
- Catches all unhandled errors
- Logs error details
- Returns consistent error response
- Hides sensitive info in production
- Provides stack traces in development

**Error Response Format**:
```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "stack": "..." // Only in development
  }
}
```

**Code Structure**:
```typescript
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('Error:', err)
  
  const statusCode = err.statusCode || 500
  
  res.status(statusCode).json({
    success: false,
    error: {
      message: err.message || 'Internal server error',
      ...(config.nodeEnv === 'development' && { stack: err.stack })
    }
  })
}
```

**Must be registered last** in middleware chain:
```typescript
app.use(errorHandler) // After all routes
```

---

### `/src/middleware/notFoundHandler.ts`

**Purpose**: 404 handler for undefined routes

**What it does**:
- Catches requests to non-existent endpoints
- Returns 404 with helpful message
- Lists available endpoints

**Response**:
```json
{
  "success": false,
  "error": {
    "message": "Endpoint not found: GET /api/invalid",
    "availableEndpoints": [
      "/api/auth/*",
      "/api/users/*",
      "/api/settings/*",
      "/api/uploads/*"
    ]
  }
}
```

**Usage**:
```typescript
app.use(notFoundHandler) // After routes, before errorHandler
```

---

### `/src/middleware/rateLimiter.ts`

**Purpose**: Rate limiting to prevent abuse

**What it does**:
- Limits requests per IP address
- Configurable window and max requests
- Returns 429 when limit exceeded
- Uses in-memory store (or Redis in production)

**Configuration**:
```typescript
import rateLimit from 'express-rate-limit'

export const limiter = rateLimit({
  windowMs: 60000, // 1 minute
  max: 100, // 100 requests per window
  message: {
    success: false,
    error: { message: 'Too many requests, please try again later' }
  },
  standardHeaders: true,
  legacyHeaders: false
})
```

**Different Limits by Route**:
```typescript
// Strict limit for auth
export const authLimiter = rateLimit({
  windowMs: 60000,
  max: 10
})

// Relaxed limit for reads
export const readLimiter = rateLimit({
  windowMs: 60000,
  max: 200
})
```

**Usage**:
```typescript
app.use('/api/auth', authLimiter, authRoutes)
app.use('/api/users', limiter, userRoutes)
```

---

## Routes

### `/src/routes/auth.routes.ts`

**Purpose**: Authentication and session routes

**Endpoints Defined**:

```typescript
// POST /api/auth/refresh - Refresh access token
router.post('/refresh', refreshTokenHandler)

// POST /api/auth/logout - Sign out user
router.post('/logout', authenticateUser, logoutHandler)

// GET /api/auth/session - Get current session
router.get('/session', authenticateUser, sessionHandler)
```

**Handler Functions**:
- Import from controllers/auth.controller.ts
- Delegate business logic to services
- Return consistent JSON responses

**Example**:
```typescript
router.post('/logout', authenticateUser, async (req, res) => {
  try {
    const token = req.headers.authorization?.substring(7)
    await supabase.auth.admin.signOut(token!)
    
    res.json({
      success: true,
      message: 'Successfully signed out'
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { message: error.message }
    })
  }
})
```

---

### `/src/routes/user.routes.ts`

**Purpose**: User profile management routes

**Endpoints Defined**:

```typescript
// GET /api/users/me - Get current user profile
router.get('/me', authenticateUser, getCurrentUserHandler)

// PUT /api/users/me - Update current user profile
router.put('/me', authenticateUser, updateCurrentUserHandler)

// GET /api/users/:id - Get public user profile
router.get('/:id', getUserByIdHandler)
```

**Full Implementation**:

```typescript
router.get('/me', authenticateUser, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id
    
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) {
      return res.status(404).json({
        success: false,
        error: { message: 'Profile not found' }
      })
    }
    
    return res.json({ success: true, data: profile })
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { message: error.message }
    })
  }
})
```

---

### `/src/routes/settings.routes.ts`

**Purpose**: User settings management routes

**Endpoints Defined**:

```typescript
// GET /api/settings - Get user settings
router.get('/', authenticateUser, getSettingsHandler)

// PUT /api/settings - Update user settings
router.put('/', authenticateUser, updateSettingsHandler)
```

**Settings Structure** (stored in profiles.settings JSONB):
```typescript
interface UserSettings {
  theme?: 'light' | 'dark' | 'auto'
  notifications?: boolean
  publicProfile?: boolean
  emailNotifications?: boolean
}
```

**Update Logic**:
```typescript
router.put('/', authenticateUser, async (req: AuthRequest, res) => {
  const { theme, notifications, publicProfile } = req.body
  const userId = req.user?.id
  
  const { data, error } = await supabase
    .from('profiles')
    .update({
      settings: { theme, notifications, publicProfile }
    })
    .eq('id', userId)
    .select('settings')
    .single()
  
  res.json({ success: true, data: data.settings })
})
```

---

### `/src/routes/upload.routes.ts`

**Purpose**: File upload routes (avatars, media)

**Endpoints Defined**:

```typescript
// POST /api/uploads/avatar - Upload user avatar
router.post('/avatar', authenticateUser, multer(...), uploadAvatarHandler)

// DELETE /api/uploads/avatar - Delete user avatar
router.delete('/avatar', authenticateUser, deleteAvatarHandler)
```

**Multer Configuration**:
```typescript
import multer from 'multer'

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: config.maxFileSize // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('Only images allowed'))
    } else {
      cb(null, true)
    }
  }
})
```

**Upload Handler**:
```typescript
router.post('/avatar',
  authenticateUser,
  upload.single('avatar'),
  async (req: AuthRequest, res) => {
    const userId = req.user?.id
    const file = req.file
    
    // Generate file path
    const fileExt = file.originalname.split('.').pop()
    const filePath = `${userId}/avatar.${fileExt}`
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(config.avatarBucket)
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: true
      })
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(config.avatarBucket)
      .getPublicUrl(filePath)
    
    // Update profile
    await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', userId)
    
    res.json({
      success: true,
      data: { avatar_url: publicUrl }
    })
  }
)
```

---

## Database

### Database Schema (Supabase)

**profiles table**:
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

-- Indexes
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_profiles_role ON profiles(role);

-- RLS Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone" 
  ON profiles FOR SELECT 
  USING (true);

CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
  ON profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_profile_updated
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();
```

---

## Configuration Files

### `package.json`

**Purpose**: NPM package configuration

**Scripts**:
```json
{
  "dev": "tsx watch src/index.ts",          // Dev with hot reload
  "build": "tsc",                           // Compile TypeScript
  "start": "node dist/index.js",            // Production server
  "lint": "eslint src --ext .ts",           // Run linter
  "type-check": "tsc --noEmit",             // Type check only
  "test": "vitest",                         // Run tests
  "test:unit": "vitest run --dir tests/unit",
  "test:integration": "vitest run --dir tests/integration",
  "test:coverage": "vitest run --coverage"
}
```

**Key Dependencies**:
- `express` - Web framework
- `@supabase/supabase-js` - Supabase client
- `cors` - CORS middleware
- `helmet` - Security headers
- `morgan` - HTTP logging
- `multer` - File uploads
- `zod` - Validation
- `compression` - Response compression

**Dev Dependencies**:
- `tsx` - TypeScript execution
- `typescript` - TypeScript compiler
- `vitest` - Testing framework
- `@types/*` - Type definitions
- `eslint` - Linter

---

### `tsconfig.json`

**Purpose**: TypeScript compiler configuration

**Key Settings**:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "strict": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "skipLibCheck": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

---

### `vitest.config.ts`

**Purpose**: Vitest test framework configuration

**What it configures**:
```typescript
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: ['node_modules/', 'dist/']
    }
  }
})
```

---

### `.env.example`

**Purpose**: Environment variable template

**Variables**:
```env
# Server
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key

# JWT (if using custom JWT)
JWT_SECRET=your-jwt-secret

# Storage
AVATAR_BUCKET=avatars
MAX_FILE_SIZE=5242880
```

---

## Docker Files

### `Dockerfile`

**Purpose**: Container build instructions

**Multi-stage Build**:

```dockerfile
# Stage 1: Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Production
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./
EXPOSE 3001
CMD ["npm", "start"]
```

**Optimizations**:
- Alpine Linux (smaller image)
- Multi-stage build (removes build tools)
- Layer caching (copies package.json first)
- Production dependencies only

---

### `docker-compose.yml`

**Purpose**: Local development with Docker

**Services**:
```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=development
      - PORT=3001
    env_file:
      - .env
    volumes:
      - ./src:/app/src
    command: npm run dev
```

---

## Documentation Files

### Files in `/docs/`

- `ARCHITECTURE.md` - System architecture overview
- `QUICKSTART.md` - Quick setup guide
- `SETUP_SUMMARY.md` - Detailed setup
- `MIGRATION.md` - Database migration guide

These will be moved to the centralized docs site.

---

## Testing Files

### Test Structure

```
tests/
├── unit/                    # Unit tests
│   ├── middleware/
│   │   ├── auth.test.ts
│   │   └── errorHandler.test.ts
│   └── routes/
│       ├── user.test.ts
│       └── auth.test.ts
└── integration/            # Integration tests
    ├── api/
    │   ├── users.test.ts
    │   └── auth.test.ts
    └── setup.ts            # Test setup/teardown
```

**Example Test**:
```typescript
import { describe, it, expect } from 'vitest'
import request from 'supertest'
import app from '../src/index'

describe('GET /api/users/me', () => {
  it('returns 401 without auth', async () => {
    const res = await request(app).get('/api/users/me')
    expect(res.status).toBe(401)
  })
  
  it('returns profile with valid token', async () => {
    const res = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${validToken}`)
    
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data).toHaveProperty('id')
  })
})
```

---

## Next Steps

- [Frontend File Reference](/eventive/reference/file-reference) - Frontend files
- [API Endpoints](/eventive-api/api/authentication) - API documentation
- [Architecture](/eventive-api/architecture) - System design

---

**Questions?** Check the [Development Guide](/eventive-api/development/testing) or ask the team!
