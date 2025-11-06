---
title: EventiveAPI Backend
description: RESTful API server powering the Eventive platform with Express, TypeScript, and Supabase
---

# EventiveAPI Backend

A production-ready RESTful API server built with Express.js, TypeScript, and Supabase. Handles authentication, user management, file uploads, and event operations for the Eventive platform.

## 🚀 Quick Start

```bash
# Clone and install
git clone https://github.com/Juno-Labs-Team/EventiveAPI.git
cd EventiveAPI
npm install

# Configure environment
cp .env.example .env
# Add your Supabase credentials

# Start development server
npm run dev
```

API runs at `http://localhost:3001` 🎉

## ✨ Key Features

- **🔐 JWT Authentication** - Token-based auth with Supabase
- **👥 User Management** - Profile CRUD operations
- **📁 File Uploads** - Avatar and media uploads with validation
- **⚙️ Settings API** - User preferences management
- **🛡️ Security First** - Helmet, CORS, rate limiting
- **🔄 Real-time Ready** - Supabase integration
- **📊 Structured Logging** - Morgan HTTP logging
- **🧪 Fully Tested** - Vitest unit & integration tests
- **🐳 Docker Ready** - Production containerization
- **⚡ TypeScript** - Full type safety throughout

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Runtime** | Node.js 20+ |
| **Framework** | Express.js 4.21 |
| **Language** | TypeScript 5.9 |
| **Database** | PostgreSQL (Supabase) |
| **Auth** | Supabase Auth (JWT) |
| **Storage** | Supabase Storage |
| **Validation** | Zod 3.24 |
| **File Upload** | Multer 1.4 |
| **Security** | Helmet, CORS, Rate Limiting |
| **Testing** | Vitest 4.0 |
| **ORM** | Prisma 6.2 (optional) |

## 🎯 API Endpoints

### Health Check
```http
GET /health
```
Returns server status and uptime.

### Authentication
```http
POST /api/auth/callback/google      # Google OAuth callback
POST /api/auth/callback/discord     # Discord OAuth callback
POST /api/auth/refresh              # Refresh access token
POST /api/auth/logout               # Sign out user
```

### Users
```http
GET  /api/users/me                  # Get current user profile
PUT  /api/users/me                  # Update current user profile
GET  /api/users/:id                 # Get user by ID (public)
```

### Settings
```http
GET  /api/settings                  # Get user settings
PUT  /api/settings                  # Update user settings
```

### Uploads
```http
POST /api/uploads/avatar            # Upload user avatar
DELETE /api/uploads/avatar          # Delete user avatar
```

## 📚 Documentation Sections

### Getting Started
Set up your local development environment.

- [Quickstart](/eventive-api/quickstart) - Get running in 5 minutes
- [Installation Guide](/eventive-api/setup-summary) - Detailed setup
- [Configuration](/eventive-api/configuration) - Environment variables
- [Database Setup](/eventive-api/database/setup) - PostgreSQL & Supabase

### Architecture
Understand the codebase structure.

- [System Architecture](/eventive-api/architecture) - Design overview
- [Folder Structure](/eventive-api/architecture/folder-structure) - Code organization
- [Middleware](/eventive-api/architecture/middleware) - Request processing
- [Error Handling](/eventive-api/architecture/error-handling) - Error strategy
- [Design Patterns](/eventive-api/architecture/patterns) - Code patterns

### API Reference
Complete endpoint documentation.

- [Authentication Endpoints](/eventive-api/api/authentication) - Auth API
- [User Endpoints](/eventive-api/api/users) - User management
- [Settings Endpoints](/eventive-api/api/settings) - User settings
- [Upload Endpoints](/eventive-api/api/uploads) - File uploads
- [Request/Response Format](/eventive-api/api/format) - API conventions

### Database
Database schema and migrations.

- [Schema Overview](/eventive-api/database/schema) - Table structure
- [Migration Guide](/eventive-api/migration) - Running migrations
- [Supabase Setup](/eventive-api/database/supabase) - Supabase config
- [RLS Policies](/eventive-api/database/rls) - Row Level Security

### Security
Security best practices and implementation.

- [Authentication Flow](/eventive-api/security/authentication) - JWT auth
- [Rate Limiting](/eventive-api/security/rate-limiting) - Prevent abuse
- [CORS Configuration](/eventive-api/security/cors) - Cross-origin setup
- [Input Validation](/eventive-api/security/validation) - Zod schemas
- [Best Practices](/eventive-api/security/best-practices) - Security tips

### Deployment
Deploy to production environments.

- [Docker Deployment](/eventive-api/deployment/docker) - Containerization
- [Environment Variables](/eventive-api/deployment/environment) - Production config
- [Production Checklist](/eventive-api/deployment/production) - Pre-deploy steps
- [Monitoring](/eventive-api/deployment/monitoring) - Health checks

### Development
Development workflows and testing.

- [Testing Guide](/eventive-api/development/testing) - Unit & integration tests
- [API Testing](/eventive-api/development/api-testing) - Testing endpoints
- [Contributing](/eventive-api/development/contributing) - How to contribute
- [Troubleshooting](/eventive-api/development/troubleshooting) - Common issues

## 📊 Database Schema

### profiles table
```sql
id              UUID PRIMARY KEY (references auth.users)
username        TEXT UNIQUE
display_name    TEXT
avatar_url      TEXT
bio             TEXT
role            TEXT DEFAULT 'user'
settings        JSONB DEFAULT '{}'
created_at      TIMESTAMPTZ DEFAULT NOW()
updated_at      TIMESTAMPTZ DEFAULT NOW()
```

### events table (Coming Soon)
```sql
id              UUID PRIMARY KEY
title           TEXT NOT NULL
description     TEXT
start_date      TIMESTAMPTZ NOT NULL
end_date        TIMESTAMPTZ NOT NULL
location        TEXT
creator_id      UUID REFERENCES profiles(id)
created_at      TIMESTAMPTZ DEFAULT NOW()
updated_at      TIMESTAMPTZ DEFAULT NOW()
```

## 🔒 Security Features

- ✅ JWT token authentication
- ✅ Row Level Security (RLS) policies
- ✅ Request rate limiting
- ✅ CORS protection
- ✅ Helmet security headers
- ✅ Input validation with Zod
- ✅ File type validation
- ✅ File size limits
- ✅ SQL injection prevention
- ✅ XSS protection

## 🧪 Testing

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests
npm run test:integration

# Run with coverage report
npm run test:coverage
```

## 🐳 Docker Deployment

```bash
# Build image
docker build -t eventive-api .

# Run container
docker run -p 3001:3001 --env-file .env eventive-api

# Or use docker-compose
docker-compose up -d
```

## 🔗 Quick Links

- [GitHub Repository](https://github.com/Juno-Labs-Team/EventiveAPI)
- [Eventive Frontend](/eventive/)
- [API Documentation](http://localhost:3001/docs)
- [Contributing Guide](/CONTRIBUTING)

## 📊 Project Status

- ✅ Express Server Setup
- ✅ JWT Authentication
- ✅ User Management API
- ✅ Settings API
- ✅ File Upload System
- ✅ Error Handling
- ✅ Security Middleware
- ✅ Docker Configuration
- 🚧 Event Management API (Coming Soon)
- 🚧 Real-time Features (Planned)
- 🚧 API Documentation UI (Planned)

---

**Ready to build?** Start with the [Quickstart Guide](/eventive-api/quickstart) to get the API running locally!
