---
title: Quick Start Guide
description: Get started with Juno Labs documentation in 5 minutes
---

# Quick Start Guide

Get your documentation site running in 5 minutes.

## 🚀 Setup

```bash
# Clone the repository
git clone https://github.com/Juno-Labs-Team/docs.git
cd docs

# Install dependencies
npm install

# Start development server
npm run docs:dev
```

Visit `http://localhost:5173` 🎉

## ➕ Add Your First Page

### 1. Create a Markdown File

For **Eventive (Frontend)** docs:
```bash
# Create file
New-Item docs/eventive/my-page.md -ItemType File -Force
```

For **EventiveAPI (Backend)** docs:
```bash
# Create file
New-Item docs/eventive-api/my-page.md -ItemType File -Force
```

### 2. Add Content

```markdown
---
title: My New Page
description: A description of my page
---

# My New Page

Your content here...

## Section 1

More content...
```

### 3. Add to Sidebar

Edit `.vitepress/config.mts`:

```typescript
sidebar: {
  '/eventive/': [
    {
      text: 'My Section',
      items: [
        { text: 'My Page', link: '/eventive/my-page' }
      ]
    }
  ]
}
```

### 4. Test It

```bash
npm run docs:dev
```

Navigate to your page and verify it works!

### 5. Deploy

```bash
git add .
git commit -m "docs: add my new page"
git push
```

✅ Netlify will automatically deploy your changes!

## 📚 Common Tasks

### Add Code Example

````markdown
```typescript
export function hello(): string {
  return "Hello, world!";
}
```
````

### Add Tip/Warning

```markdown
::: tip
This is a helpful tip!
:::

::: warning
Watch out for this!
:::
```

### Add Image

1. Place image in `docs/public/images/`
2. Reference it:

```markdown
![My Diagram](/images/diagram.png)
```

### Link to Another Page

```markdown
See [Architecture Guide](/eventive-api/architecture) for more details.
```

## 🔗 Next Steps

- Read the full [Contributing Guide](/CONTRIBUTING) for detailed information
- Explore existing pages to see examples
- Check out [VitePress docs](https://vitepress.dev/) for advanced features

## 🆘 Help

**Page not showing?** Check sidebar config in `.vitepress/config.mts`

**Links broken?** Don't include `.md` extension, use absolute paths like `/eventive/page`

**Build failing?** Run `npm run docs:build` locally to test

---

Need more help? See the [Contributing Guide](/CONTRIBUTING) or ask the team!
