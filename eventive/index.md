---
title: Eventive Frontend
description: Modern event management platform built with React, TypeScript, and Supabase
---

# Eventive Frontend

A modern, responsive event management platform built with React, TypeScript, Vite, and Supabase. Features OAuth authentication, user profiles, and role-based access control.

## 🚀 Quick Start

```bash
# Clone and install
git clone <repository-url>
cd tsa-repository
npm install

# Configure environment
cp .env.example .env
# Add your Supabase credentials

# Start development server
npm run dev
```

Visit `http://localhost:5173` to see your app! 🎉

## ✨ Key Features

- **🔐 OAuth Authentication** - Secure login with Google and Discord
- **👤 User Profiles** - Customizable profiles with avatar uploads
- **⚙️ Settings Management** - Comprehensive user preferences
- **🔒 Protected Routes** - Route-level access control
- **👑 Role-Based Access** - Admin and user roles with RLS
- **🎨 Modern UI** - Clean, responsive design with custom CSS
- **⚡ Fast Development** - Vite + React 19 with hot reload
- **🔄 Real-time Updates** - Supabase realtime subscriptions
- **📱 Mobile Ready** - Fully responsive across all devices

## �️ Tech Stack

| Category | Technology |
|----------|------------|
| **Frontend Framework** | React 19.1 |
| **Language** | TypeScript 5.9 |
| **Build Tool** | Vite (Rolldown) |
| **Routing** | React Router 7.9 |
| **Authentication** | Supabase Auth (OAuth) |
| **Database** | PostgreSQL via Supabase |
| **Storage** | Supabase Storage |
| **Styling** | CSS (Custom) |
| **Linting** | ESLint 9 + TypeScript ESLint |

## 📚 Documentation Sections

### Getting Started
Learn how to set up and run Eventive locally.

- [Installation Guide](/eventive/getting-started/installation) - Complete setup instructions
- [Environment Configuration](/eventive/getting-started/configuration) - Configure your environment
- [First Steps](/eventive/getting-started/first-steps) - Your first login and profile

### Architecture
Understand the application structure and patterns.

- [Project Overview](/eventive/architecture/overview) - High-level architecture
- [Folder Structure](/eventive/architecture/folder-structure) - How files are organized
- [Component Architecture](/eventive/tsa-project/src/components) - Component patterns
- [Routing & Pages](/eventive/tsa-project/src/pages) - Page structure and routing
- [State Management](/eventive/architecture/state-management) - Context API usage

### Features
Deep dives into specific features.

- [Authentication System](/eventive/git/safety/authentication) - OAuth implementation
- [User Profiles](/eventive/features/profiles) - Profile management
- [Avatar Uploads](/eventive/features/avatars) - Image upload system
- [Settings](/eventive/features/settings) - User preferences
- [Protected Routes](/eventive/features/protected-routes) - Route guards

### Styling
Learn about the styling system and conventions.

- [Styling Guide](/eventive/tsa-project/styling/styling-guide) - CSS conventions
- [CSS Variables](/eventive/styling/variables) - Design tokens
- [Component Styling](/eventive/styling/components) - Component patterns
- [Responsive Design](/eventive/styling/responsive) - Mobile-first approach

### Deployment
Deploy Eventive to production.

- [Docker Guide](/eventive/docker/docker) - Containerization
- [Production Build](/eventive/deployment/production) - Build optimization
- [Environment Variables](/eventive/deployment/environment) - Production config
- [Nginx Configuration](/eventive/deployment/nginx) - Reverse proxy setup

### Development
Development workflows and best practices.

- [Git Workflow](/eventive/git/namescheme) - Branch naming and commits
- [Changelog](/eventive/git/changelog) - Version management
- [TypeScript Guide](/eventive/typescript/eslint-rules) - TS best practices
- [Testing](/eventive/development/testing) - Testing strategy
- [Contributing](/eventive/development/contributing) - How to contribute

### API Integration
Connect with the EventiveAPI backend.

- [API Client](/eventive/api/client) - API wrapper usage
- [Supabase Client](/eventive/api/supabase) - Database queries
- [Authentication Flow](/eventive/api/auth-flow) - Auth implementation
- [Error Handling](/eventive/api/error-handling) - Handle API errors

## 🎯 Use Cases

**For Users:**
- Create and manage event profiles
- Upload custom avatars
- Customize settings and preferences
- Secure OAuth authentication

**For Developers:**
- Modern React application template
- Authentication boilerplate with Supabase
- File upload implementation
- Role-based access control example
- Production-ready Docker setup

## 🔗 Quick Links

- [GitHub Repository](https://github.com/127msafran/tsa-repository)
- [EventiveAPI Backend](/eventive-api/)
- [Contributing Guide](/CONTRIBUTING)
- [Report Issues](https://github.com/127msafran/tsa-repository/issues)

## 📊 Project Status

- ✅ OAuth Authentication (Google, Discord)
- ✅ User Profile Management
- ✅ Avatar Upload System
- ✅ Settings Management
- ✅ Protected Routes
- ✅ Role-Based Access Control
- 🚧 Event Management (Coming Soon)
- 🚧 Event Discovery (Coming Soon)
- 🚧 Social Features (Planned)

---

**Ready to get started?** Head to the [Installation Guide](/eventive/getting-started/installation) to set up your development environment!
