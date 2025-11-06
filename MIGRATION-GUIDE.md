---
title: Migration Guide
description: Move documentation from repositories to the hosted docs site
---

# Documentation Migration Guide

This guide helps you migrate documentation from individual repositories (`tsa-repository` and `EventiveAPI`) to the centralized docs site.

## 🎯 Migration Goals

- **Centralize** all documentation in one place
- **Simplify** maintenance and updates
- **Improve** discoverability with better structure
- **Enable** cross-project documentation
- **Reduce** duplication between repositories

## 📋 Pre-Migration Checklist

- [ ] Clone the docs repository
- [ ] Install dependencies (`npm install`)
- [ ] Run dev server to test (`npm run docs:dev`)
- [ ] Identify what docs exist in each repository
- [ ] Plan the new documentation structure
- [ ] Create backup of existing docs

## 🔄 Migration Process

### Step 1: Audit Existing Documentation

#### For tsa-repository (Eventive Frontend)

Current docs location: `tsa-repository/docs/`

```
tsa-repository/docs/
├── docker/
│   └── DOCKER.md
├── git/
│   ├── changelog.md
│   ├── namescheme.md
│   └── safety/
│       └── authentication.md
├── tsa-proj-/
│   ├── src/
│   │   ├── components.md
│   │   └── pages.md
│   └── styling/
│       └── styling-guide.md
└── typescript/
    └── eslintrules.txt
```

**Additional docs to migrate:**
- `README.md` - Project overview
- `CONTRIBUTING.md` - Contribution guidelines
- `SECURITY.md` - Security policies
- `TODO.md` - Roadmap items

#### For EventiveAPI (Backend)

Current docs location: `EventiveAPI/docs/`

```
EventiveAPI/docs/
├── ARCHITECTURE.md
├── MIGRATION.md
├── QUICKSTART.md
└── SETUP_SUMMARY.md
```

**Additional docs to migrate:**
- `README.md` - Project overview
- `CONTRIBUTING.md` - Contribution guidelines

### Step 2: Plan New Structure

#### Proposed Eventive (Frontend) Structure

```
docs/eventive/
├── index.md                          # Overview (from README)
├── getting-started/
│   ├── installation.md               # NEW - Setup guide
│   ├── development.md                # NEW - Dev environment
│   └── configuration.md              # NEW - Env variables
├── architecture/
│   ├── overview.md                   # NEW - High-level view
│   ├── components.md                 # FROM tsa-proj-/src/components.md
│   ├── pages.md                      # FROM tsa-proj-/src/pages.md
│   └── folder-structure.md           # NEW
├── features/
│   ├── authentication.md             # FROM git/safety/authentication.md
│   ├── user-account.md               # NEW
│   └── settings.md                   # NEW
├── styling/
│   ├── guide.md                      # FROM tsa-proj-/styling/styling-guide.md
│   ├── css-variables.md              # NEW
│   └── best-practices.md             # NEW
├── deployment/
│   ├── docker.md                     # FROM docker/DOCKER.md
│   ├── nginx.md                      # NEW
│   └── production-checklist.md       # NEW
├── development/
│   ├── git-workflow.md               # FROM git/namescheme.md
│   ├── changelog.md                  # FROM git/changelog.md
│   ├── typescript.md                 # FROM typescript/eslintrules.txt
│   ├── testing.md                    # NEW
│   └── contributing.md               # FROM CONTRIBUTING.md
└── reference/
    ├── api-client.md                 # NEW
    ├── supabase.md                   # NEW
    └── utilities.md                  # NEW
```

#### Proposed EventiveAPI (Backend) Structure

```
docs/eventive-api/
├── index.md                          # Overview (from README)
├── getting-started/
│   ├── quickstart.md                 # FROM QUICKSTART.md
│   ├── installation.md               # FROM SETUP_SUMMARY.md
│   └── configuration.md              # NEW - Detailed config
├── architecture/
│   ├── overview.md                   # FROM ARCHITECTURE.md
│   ├── folder-structure.md           # NEW
│   ├── middleware.md                 # NEW
│   └── error-handling.md             # NEW
├── api-endpoints/
│   ├── authentication.md             # NEW
│   ├── users.md                      # NEW
│   ├── settings.md                   # NEW
│   └── uploads.md                    # NEW
├── database/
│   ├── schema.md                     # NEW
│   ├── migrations.md                 # FROM MIGRATION.md
│   └── supabase-setup.md             # NEW
├── deployment/
│   ├── docker.md                     # NEW
│   ├── environment-variables.md      # NEW
│   └── production.md                 # NEW
└── development/
    ├── testing.md                    # NEW
    ├── contributing.md               # FROM CONTRIBUTING.md
    └── troubleshooting.md            # NEW
```

### Step 3: Migrate Content

#### Copy Files from Repositories

::: code-group

```powershell [PowerShell]
# Navigate to docs repo
cd docs

# Copy frontend docs
Copy-Item -Recurse ..\tsa-repository\docs\* .\temp\frontend\

# Copy backend docs
Copy-Item -Recurse ..\EventiveAPI\docs\* .\temp\backend\

# Copy READMEs
Copy-Item ..\tsa-repository\README.md .\temp\frontend\
Copy-Item ..\EventiveAPI\README.md .\temp\backend\
```

```bash [Bash]
# Navigate to docs repo
cd docs

# Copy frontend docs
cp -r ../tsa-repository/docs/* ./temp/frontend/

# Copy backend docs
cp -r ../EventiveAPI/docs/* ./temp/backend/

# Copy READMEs
cp ../tsa-repository/README.md ./temp/frontend/
cp ../EventiveAPI/README.md ./temp/backend/
```

:::

#### Transform Content

For each file:

1. **Update Links**

```markdown
<!-- OLD (repository-style) -->
See [Architecture](./ARCHITECTURE.md)
See [Components](../src/components.md)

<!-- NEW (VitePress-style) -->
See [Architecture](/eventive-api/architecture/overview)
See [Components](/eventive/architecture/components)
```

2. **Add Frontmatter**

```markdown
---
title: Page Title
description: Brief description for search and SEO
---

# Page Title

Content starts here...
```

3. **Update Code Blocks**

Ensure code blocks have language identifiers:

````markdown
```typescript
// TypeScript code here
```

```bash
# Shell commands here
```
````

4. **Update Image Paths**

```markdown
<!-- OLD -->
![Diagram](./images/diagram.png)

<!-- NEW - if in public/ -->
![Diagram](/images/diagram.png)

<!-- NEW - if relative to page -->
![Diagram](./images/diagram.png)
```

5. **Improve Formatting**

Add VitePress enhancements:

```markdown
::: tip Best Practice
Always use TypeScript strict mode for better type safety.
:::

::: warning
This feature is still in beta.
:::
```

### Step 4: Update Sidebar Configuration

Edit `.vitepress/config.mts`:

```typescript
export default defineConfig({
  // ... other config
  
  themeConfig: {
    sidebar: {
      '/eventive/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Installation', link: '/eventive/getting-started/installation' },
            { text: 'Development', link: '/eventive/getting-started/development' },
            { text: 'Configuration', link: '/eventive/getting-started/configuration' }
          ]
        },
        {
          text: 'Architecture',
          items: [
            { text: 'Overview', link: '/eventive/architecture/overview' },
            { text: 'Components', link: '/eventive/architecture/components' },
            { text: 'Pages', link: '/eventive/architecture/pages' }
          ]
        },
        // ... more sections
      ],
      
      '/eventive-api/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Quickstart', link: '/eventive-api/getting-started/quickstart' },
            { text: 'Installation', link: '/eventive-api/getting-started/installation' }
          ]
        },
        {
          text: 'Architecture',
          items: [
            { text: 'Overview', link: '/eventive-api/architecture/overview' },
            { text: 'Folder Structure', link: '/eventive-api/architecture/folder-structure' }
          ]
        },
        // ... more sections
      ]
    }
  }
})
```

### Step 5: Test Locally

```bash
# Start dev server
npm run docs:dev

# Test checklist:
# - All pages load without 404 errors
# - Sidebar navigation works
# - Internal links work
# - External links work
# - Code blocks render correctly
# - Images display properly
# - Search finds pages
# - Mobile view looks good
```

### Step 6: Deploy

```bash
# Stage all changes
git add .

# Commit with descriptive message
git commit -m "docs: migrate documentation from tsa-repository and EventiveAPI

- Migrate frontend docs from tsa-repository
- Migrate backend docs from EventiveAPI
- Reorganize into clearer structure
- Update all internal links
- Add VitePress enhancements"

# Push to main branch
git push origin main
```

Netlify will automatically build and deploy! 🚀

### Step 7: Update Repository READMEs

After migration, update the README files in both repositories to point to the docs site:

#### tsa-repository/README.md

```markdown
# Eventive

Modern web application built with React, Vite, and Supabase.

## 📚 Documentation

**Full documentation is now hosted at [your-docs-url.com](https://your-docs-url.com)**

Quick links:
- [Getting Started](https://your-docs-url.com/eventive/getting-started/installation)
- [Architecture](https://your-docs-url.com/eventive/architecture/overview)
- [Deployment](https://your-docs-url.com/eventive/deployment/docker)
- [Contributing](https://your-docs-url.com/eventive/development/contributing)

## Quick Start

```bash
npm install
npm run dev
```

Visit [the full documentation](https://your-docs-url.com/eventive/) for detailed setup instructions.
```

#### EventiveAPI/README.md

```markdown
# EventiveAPI

Backend API powering the Eventive platform.

## 📚 Documentation

**Full documentation is now hosted at [your-docs-url.com](https://your-docs-url.com)**

Quick links:
- [Quickstart](https://your-docs-url.com/eventive-api/getting-started/quickstart)
- [Architecture](https://your-docs-url.com/eventive-api/architecture/overview)
- [API Endpoints](https://your-docs-url.com/eventive-api/api-endpoints/)
- [Database Setup](https://your-docs-url.com/eventive-api/database/schema)

## Quick Start

```bash
npm install
npm run dev
```

Visit [the full documentation](https://your-docs-url.com/eventive-api/) for detailed setup instructions.
```

### Step 8: Clean Up Repository Docs

After confirming the migration is successful:

1. **Option A: Remove old docs** (if fully migrated)

```bash
# In tsa-repository
git rm -r docs/
git commit -m "docs: remove documentation (now hosted at docs site)"
git push

# In EventiveAPI
git rm -r docs/
git commit -m "docs: remove documentation (now hosted at docs site)"
git push
```

2. **Option B: Add deprecation notice** (keep for transition period)

Create `docs/README.md` in each repository:

```markdown
# Documentation Moved

This documentation has been migrated to our centralized docs site.

**Visit: [your-docs-url.com](https://your-docs-url.com)**

The documentation in this folder is no longer maintained and will be removed in a future release.
```

## ✅ Post-Migration Checklist

- [ ] All pages migrated and accessible
- [ ] All links working (no 404s)
- [ ] Images displaying correctly
- [ ] Code examples tested
- [ ] Search functionality working
- [ ] Mobile view looks good
- [ ] Repository READMEs updated
- [ ] Old docs marked as deprecated or removed
- [ ] Team notified of new docs location
- [ ] Bookmarks/links updated

## 🎯 Best Practices for Ongoing Maintenance

### 1. Single Source of Truth

- Keep **all** documentation in the docs repo
- Update docs repo, not individual repositories
- Point repository READMEs to docs site

### 2. Keep It Updated

- Update docs when making code changes
- Review docs quarterly for accuracy
- Remove outdated information

### 3. Make It Discoverable

- Use clear, descriptive page titles
- Add comprehensive search terms
- Link related pages together
- Include examples and use cases

### 4. Maintain Quality

- Proofread before committing
- Test all code examples
- Verify links regularly
- Keep formatting consistent

## 🔍 Finding Content to Migrate

### Search Repository for Documentation

::: code-group

```powershell [PowerShell]
# Find all markdown files
Get-ChildItem -Path . -Recurse -Filter "*.md"

# Search for specific content
Select-String -Path .\*.md -Pattern "TODO" -Recurse
```

```bash [Bash]
# Find all markdown files
find . -name "*.md"

# Search for specific content
grep -r "TODO" --include="*.md"
```

:::

### Common Locations

- `docs/` folder
- `README.md`
- `CONTRIBUTING.md`
- `ARCHITECTURE.md`
- `CHANGELOG.md`
- `SECURITY.md`
- Comments in code (consider extracting to docs)

## 🆘 Troubleshooting

### Links Not Working

**Problem**: Old repository links still in content

**Solution**: Use find/replace:

```powershell
# Replace .md extensions in links
(Get-Content .\eventive\architecture\overview.md) -replace '\.md\)', ')' | Set-Content .\eventive\architecture\overview.md
```

### Images Missing

**Problem**: Image paths incorrect after migration

**Solution**:
1. Move images to `docs/public/images/`
2. Update paths to `/images/filename.png`

### Sidebar Not Showing

**Problem**: Pages not appearing in sidebar

**Solution**: Check `.vitepress/config.mts`:
- Paths must start with `/`
- Don't include `.md` extension
- Check spelling and case

## 📚 Additional Resources

- [VitePress Documentation](https://vitepress.dev/)
- [Contributing Guide](/CONTRIBUTING)
- [Quick Start](/QUICK-START)

---

Happy migrating! If you need help, ask the team or refer to the [Contributing Guide](/CONTRIBUTING).
