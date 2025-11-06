# Contributing to Juno Labs Documentation

This guide will help you add and manage documentation pages for the Juno Labs projects.

## Documentation Structure

This documentation site uses **VitePress**, a static site generator designed for technical documentation.

### Current Projects
- **Eventive** (`/eventive/`) - Frontend React application (previously `tsa-repository`)
- **EventiveAPI** (`/eventive-api/`) - Backend Node.js API

## Quick Start

### Running Locally

```bash
# Install dependencies
npm install

# Start development server
npm run docs:dev

# Build for production
npm run docs:build

# Preview production build
npm run docs:preview
```

The dev server runs at `http://localhost:5173` by default.

## Adding New Pages

### Step 1: Create the Markdown File

Create a new `.md` file in the appropriate directory:

```
docs/
├── eventive/              # Frontend documentation
│   ├── index.md          # Landing page
│   ├── docker/
│   ├── git/
│   ├── tsa-project/
│   └── typescript/
├── eventive-api/          # Backend documentation
│   ├── index.md          # Landing page
│   ├── quickstart.md
│   └── architecture.md
```

**Example**: To add a new "Testing Guide" for Eventive:

1. Create `docs/eventive/testing/testing-guide.md`
2. Add frontmatter and content:

```markdown
# Testing Guide

Learn how to write and run tests for Eventive.

## Unit Tests

...content here...

## Integration Tests

...content here...
```

### Step 2: Update the Sidebar Configuration

Edit `.vitepress/config.mts` to add your page to the sidebar:

```typescript
sidebar: {
  '/eventive/': [
    // ... existing sections ...
    {
      text: 'Testing',  // Section name
      items: [
        { text: 'Testing Guide', link: '/eventive/testing/testing-guide' }
      ]
    }
  ]
}
```

### Step 3: (Optional) Add to Navigation

If you want the page in the top navigation bar:

```typescript
nav: [
  { text: 'Home', link: '/' },
  { text: 'Eventive', link: '/eventive/' },
  { text: 'EventiveAPI', link: '/eventive-api/' },
  { text: 'Testing', link: '/eventive/testing/testing-guide' }  // New item
]
```

## Markdown Features

VitePress supports enhanced Markdown features:

### Code Blocks with Syntax Highlighting

```typescript
export function hello(name: string): string {
  return `Hello, ${name}!`;
}
```

### Info Boxes

```markdown
::: tip
This is a tip
:::

::: warning
This is a warning
:::

::: danger
This is a dangerous warning
:::

::: info
This is an info box
:::
```

### Code Groups (Tabs)

```markdown
::: code-group

```bash [npm]
npm install vitepress
```

```bash [pnpm]
pnpm add vitepress
```

```bash [yarn]
yarn add vitepress
```

:::
```

### Custom Containers

```markdown
::: details Click to see more
Hidden content goes here
:::
```

## Recommended Page Structure

### For Frontend (Eventive) Documentation

```
eventive/
├── index.md                          # Overview
├── getting-started/
│   ├── installation.md               # Setup instructions
│   ├── development.md                # Running locally
│   └── configuration.md              # Environment variables
├── architecture/
│   ├── overview.md                   # High-level architecture
│   ├── components.md                 # Component structure
│   ├── pages.md                      # Page routing
│   └── state-management.md           # Contexts & state
├── features/
│   ├── authentication.md             # Auth implementation
│   ├── user-settings.md              # Settings page
│   └── file-upload.md                # Upload functionality
├── styling/
│   ├── styling-guide.md              # CSS conventions
│   ├── variables.md                  # CSS variables
│   └── components.md                 # Component styling
├── deployment/
│   ├── docker.md                     # Docker deployment
│   ├── nginx.md                      # Nginx configuration
│   └── production.md                 # Production checklist
├── development/
│   ├── typescript.md                 # TypeScript guidelines
│   ├── eslint-rules.md               # Linting rules
│   ├── git-workflow.md               # Git conventions
│   └── testing.md                    # Testing guide
└── api-reference/
    ├── supabase-client.md            # Supabase integration
    ├── api-client.md                 # API wrapper
    └── utilities.md                  # Helper functions
```

### For Backend (EventiveAPI) Documentation

```
eventive-api/
├── index.md                          # Overview
├── getting-started/
│   ├── quickstart.md                 # Quick setup
│   ├── installation.md               # Detailed setup
│   └── configuration.md              # Environment config
├── architecture/
│   ├── overview.md                   # System architecture
│   ├── folder-structure.md           # Project structure
│   └── design-patterns.md            # Patterns used
├── api/
│   ├── authentication.md             # Auth endpoints
│   ├── users.md                      # User endpoints
│   ├── settings.md                   # Settings endpoints
│   └── uploads.md                    # Upload endpoints
├── database/
│   ├── schema.md                     # Database schema
│   ├── migrations.md                 # Running migrations
│   └── supabase.md                   # Supabase integration
├── middleware/
│   ├── authentication.md             # Auth middleware
│   ├── rate-limiting.md              # Rate limiter
│   └── error-handling.md             # Error middleware
├── deployment/
│   ├── docker.md                     # Docker deployment
│   ├── environment.md                # Environment setup
│   └── production.md                 # Production guide
└── development/
    ├── testing.md                    # Testing guide
    ├── contributing.md               # How to contribute
    └── troubleshooting.md            # Common issues
```

## Migrating Documentation from Repositories

When moving docs from `tsa-repository` or `EventiveAPI` repos:

### 1. Copy the Files

```bash
# For frontend docs
cp -r tsa-repository/docs/* docs/eventive/

# For backend docs
cp -r EventiveAPI/docs/* docs/eventive-api/
```

### 2. Update Internal Links

Change relative links to absolute VitePress links:

**Before** (in repository):
```markdown
See [Architecture](./ARCHITECTURE.md)
```

**After** (in VitePress):
```markdown
See [Architecture](/eventive-api/architecture)
```

### 3. Update the Sidebar

Add all new pages to `.vitepress/config.mts`

### 4. Test Locally

```bash
npm run docs:dev
```

### 5. Commit and Deploy

```bash
git add .
git commit -m "docs: migrate documentation from repositories"
git push
```

Netlify will automatically build and deploy your changes.

## Best Practices

### 1. **Keep URLs Stable**
Once a page is published, avoid changing its path. If you must, add a redirect.

### 2. **Use Descriptive Filenames**
- ✅ `authentication-setup.md`
- ❌ `auth.md`

### 3. **Include Frontmatter**
While not required, frontmatter can be useful:

```markdown
---
title: Custom Page Title
description: Page description for SEO
---
```

### 4. **Link Between Pages**
Help users navigate by linking related pages:

```markdown
For more details, see the [Architecture Guide](/eventive-api/architecture).
```

### 5. **Use Relative Links for Assets**
Place images in a `public/` folder and reference them:

```markdown
![Diagram](./images/architecture.png)
```

### 6. **Keep Code Examples Updated**
Regularly review and update code examples to match the current codebase.

### 7. **Add a Table of Contents for Long Pages**
VitePress automatically generates a TOC from headers.

## Deployment

### Netlify (Current Setup)

Deployment is automatic:
- **Push to `main` branch** → Netlify builds and deploys
- **Build command**: `npm run docs:build`
- **Publish directory**: `.vitepress/dist`

### Manual Deployment

If needed, you can manually build:

```bash
npm run docs:build
# Upload the .vitepress/dist folder to your hosting provider
```

## Checklist for New Documentation

- [ ] Create markdown file in appropriate directory
- [ ] Add content with clear headers and examples
- [ ] Update `.vitepress/config.mts` sidebar
- [ ] Add cross-references to related pages
- [ ] Test locally with `npm run docs:dev`
- [ ] Check all links work
- [ ] Review on mobile/tablet viewports
- [ ] Commit with descriptive message
- [ ] Push and verify on production

## Troubleshooting

### Page Not Showing in Sidebar
- Check sidebar configuration in `.vitepress/config.mts`
- Ensure the path matches exactly (including `/` prefixes)
- Restart dev server

### Broken Links
- Links should not include `.md` extension
- Use absolute paths starting with `/`
- Check capitalization (paths are case-sensitive)

### Build Failures
- Check for syntax errors in markdown
- Ensure all linked pages exist
- Review the Netlify build logs

## Additional Resources

- [VitePress Documentation](https://vitepress.dev/)
- [Markdown Guide](https://www.markdownguide.org/)
- [Netlify Docs](https://docs.netlify.com/)

## Need Help?

If you have questions or need assistance:
1. Check existing documentation structure for examples
2. Review VitePress documentation
3. Ask the team for guidance

---

**Happy documenting!**
