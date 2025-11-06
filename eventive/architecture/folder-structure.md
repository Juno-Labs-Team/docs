---
title: Folder Structure
description: Understanding the Eventive frontend project organization
---

# Folder Structure

Understanding how the Eventive codebase is organized.

## Overview

```
tsa-repository/
├── public/                    # Static assets served directly
├── src/                       # Source code
│   ├── assets/               # Images, fonts, etc.
│   ├── components/           # Reusable React components
│   ├── contexts/             # React Context providers
│   ├── lib/                  # Utility libraries
│   ├── pages/                # Page components (routes)
│   ├── styles/               # CSS stylesheets
│   ├── types/                # TypeScript type definitions
│   ├── App.tsx               # Main App component
│   ├── App.css               # App-level styles
│   ├── main.tsx              # Application entry point
│   └── index.css             # Global styles
├── docs/                      # Project documentation
├── scripts/                   # Build and utility scripts
├── .env                       # Environment variables (not in git)
├── .env.example               # Environment template
├── .gitignore                 # Git ignore rules
├── docker-compose.yml         # Docker Compose configuration
├── Dockerfile                 # Docker build instructions
├── eslint.config.js           # ESLint configuration
├── index.html                 # HTML entry point
├── nginx.conf                 # Nginx configuration for production
├── package.json               # NPM dependencies and scripts
├── tsconfig.json              # TypeScript configuration
├── tsconfig.app.json          # App-specific TS config
├── tsconfig.node.json         # Node-specific TS config
├── vite.config.ts             # Vite build configuration
├── README.md                  # Project readme
├── CONTRIBUTING.md            # Contribution guidelines
├── SECURITY.md                # Security policies
└── TODO.md                    # Planned features
```

## Directory Details

### `/src/components/` - Reusable Components

Components that are used across multiple pages.

```
components/
├── navbar.tsx                 # Navigation bar component
├── OnboardingModal.tsx        # First-time user onboarding
├── ProtectedRoute.tsx         # Route authentication guard
├── SkeletonLoader.tsx         # Loading state placeholder
├── Spinner.tsx                # Loading spinner
└── Toast.tsx                  # Toast notification component
```

**Key Components:**

- **`navbar.tsx`** - Site-wide navigation with auth state
- **`ProtectedRoute.tsx`** - Wrapper for authenticated-only routes
- **`OnboardingModal.tsx`** - Shows on first login to guide users
- **`Toast.tsx`** - User feedback notifications

### `/src/contexts/` - State Management

React Context providers for global state.

```
contexts/
├── AuthContext.tsx            # Authentication state & methods
└── ToastContext.tsx           # Toast notification state
```

**AuthContext Features:**
- User authentication state
- Profile data caching (memory + localStorage)
- OAuth sign-in methods (Google, Discord)
- Sign out functionality
- Profile refresh methods

**ToastContext Features:**
- Display success/error/info messages
- Auto-dismiss timers
- Toast queue management

### `/src/lib/` - Utility Libraries

Helper functions and API clients.

```
lib/
├── supabaseClient.ts          # Supabase client initialization
├── apiClient.ts               # API request wrapper
└── avatarUpload.ts            # Avatar upload utilities
```

**Key Utilities:**

- **`supabaseClient.ts`** - Configured Supabase client instance
- **`apiClient.ts`** - Axios/fetch wrapper with auth headers
- **`avatarUpload.ts`** - File validation and upload logic

### `/src/pages/` - Route Pages

Top-level page components mapped to routes.

```
pages/
├── home.tsx                   # Public homepage (/)
├── login.tsx                  # Login page (/login)
├── account.tsx                # User profile page (/account) [Protected]
└── settings.tsx               # User settings page (/settings) [Protected]
```

**Routing:**
- `/` → `home.tsx` (Public)
- `/login` → `login.tsx` (Public)
- `/account` → `account.tsx` (Protected)
- `/settings` → `settings.tsx` (Protected)

### `/src/styles/` - Stylesheets

Component-specific and global CSS.

```
styles/
├── account.css                # Account page styles
├── login.css                  # Login page styles
├── navbar.css                 # Navbar styles
├── onboarding.css             # Onboarding modal styles
├── root.css                   # Root element styles
├── skeleton.css               # Skeleton loader styles
├── spinner.css                # Spinner styles
├── toast.css                  # Toast notification styles
└── variables.css              # CSS custom properties (design tokens)
```

**Styling Convention:**
- One CSS file per component/page
- Global variables in `variables.css`
- Mobile-first responsive design

### `/src/types/` - TypeScript Types

Shared TypeScript interfaces and types.

```
types/
└── auth.ts                    # Authentication-related types
```

**Example Types:**
```typescript
export interface Profile {
  id: string;
  username?: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  role: 'user' | 'admin';
  settings?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface AuthContextType {
  user: any | null;
  profile: Profile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithDiscord: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}
```

### `/public/` - Static Assets

Files served directly without processing.

```
public/
├── favicon.ico                # Site favicon
└── robots.txt                 # SEO crawler instructions
```

### `/docs/` - Documentation

Project documentation (will be migrated to docs site).

```
docs/
├── docker/                    # Docker guides
├── git/                       # Git workflows
├── tsa-proj-/                 # Project-specific docs
└── typescript/                # TypeScript guidelines
```

## Configuration Files

### `vite.config.ts` - Build Configuration

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
})
```

### `tsconfig.json` - TypeScript Config

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "strict": true,
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}
```

### `eslint.config.js` - Linting Rules

Configures code quality rules. See [ESLint Rules](/eventive/typescript/eslint-rules) for details.

## Import Conventions

### Absolute Imports

Currently using relative imports:

```typescript
// Component imports
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabaseClient'
```

### Import Order

1. React and external libraries
2. Internal components
3. Contexts and hooks
4. Utilities and types
5. Styles

```typescript
// 1. External
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

// 2. Components
import { Toast } from '../components/Toast'

// 3. Contexts
import { useAuth } from '../contexts/AuthContext'

// 4. Utils & Types
import { supabase } from '../lib/supabaseClient'
import type { Profile } from '../types/auth'

// 5. Styles
import './account.css'
```

## File Naming Conventions

- **Components**: PascalCase (e.g., `OnboardingModal.tsx`)
- **Pages**: lowercase (e.g., `account.tsx`)
- **Utilities**: camelCase (e.g., `avatarUpload.ts`)
- **Types**: lowercase (e.g., `auth.ts`)
- **Styles**: lowercase with hyphens (e.g., `account.css`)

## Adding New Files

### Adding a Component

```
src/components/
└── NewComponent.tsx

src/styles/
└── new-component.css
```

### Adding a Page

```
src/pages/
└── new-page.tsx

src/styles/
└── new-page.css

src/App.tsx  (add route)
```

### Adding a Context

```
src/contexts/
└── NewContext.tsx
```

Then wrap in `App.tsx`:

```typescript
<NewProvider>
  <ExistingProviders>
    {children}
  </ExistingProviders>
</NewProvider>
```

## Best Practices

1. **One component per file** - Keep files focused
2. **Colocate styles** - CSS file next to component when possible
3. **Export types** - Share TypeScript types from `/types/`
4. **Group by feature** - Consider feature folders as app grows
5. **Keep it flat** - Avoid deep nesting (max 3-4 levels)

## Next Steps

- Learn about [Component Architecture](/eventive/tsa-project/src/components)
- Understand [State Management](/eventive/architecture/state-management)
- Read [Styling Guidelines](/eventive/tsa-project/styling/styling-guide)

---

**Questions?** Check the [Contributing Guide](/eventive/development/contributing) or ask the team!
