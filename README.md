# Juno Labs Documentation

Comprehensive documentation for all Juno Labs projects, hosted at [your-site-url].

## 📚 Projects

- **Eventive** - Frontend React application (formerly tsa-repository)
- **EventiveAPI** - Backend Node.js API

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ (check `.nvmrc` for specific version)
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/Juno-Labs-Team/docs.git
cd docs

# Install dependencies
npm install

# Start development server
npm run docs:dev
```

Visit `http://localhost:5173` to see the documentation.

## 📝 Available Scripts

- `npm run docs:dev` - Start development server with hot reload
- `npm run docs:build` - Build for production
- `npm run docs:preview` - Preview production build locally

## 🏗️ Built With

- **[VitePress](https://vitepress.dev/)** - Static site generator
- **[Netlify](https://www.netlify.com/)** - Hosting and deployment

## 📖 Adding Documentation

See [CONTRIBUTING.md](./CONTRIBUTING.md) for a comprehensive guide on:
- Adding new pages
- Updating the sidebar
- Markdown features
- Best practices
- Migration guide

### Quick Example

1. Create a new `.md` file in the appropriate directory:
   ```
   docs/eventive/new-feature.md
   ```

2. Add content:
   ```markdown
   # New Feature
   
   Documentation for the new feature...
   ```

3. Update `.vitepress/config.mts` to add to sidebar:
   ```typescript
   sidebar: {
     '/eventive/': [
       {
         text: 'Features',
         items: [
           { text: 'New Feature', link: '/eventive/new-feature' }
         ]
       }
     ]
   }
   ```

4. Test and deploy:
   ```bash
   npm run docs:dev  # Test locally
   git add .
   git commit -m "docs: add new feature documentation"
   git push          # Auto-deploys via Netlify
   ```

## 🚢 Deployment

Deployment is automatic through Netlify:
- Push to `main` branch triggers a build
- Build command: `npm run docs:build`
- Publish directory: `.vitepress/dist`

## 📂 Repository Structure

```
docs/
├── .vitepress/
│   ├── config.mts          # VitePress configuration
│   └── dist/               # Built output (generated)
├── eventive/               # Frontend documentation
│   ├── index.md           # Landing page
│   ├── docker/
│   ├── git/
│   ├── tsa-project/
│   └── typescript/
├── eventive-api/          # Backend documentation
│   ├── index.md          # Landing page
│   ├── quickstart.md
│   ├── architecture.md
│   └── ...
├── index.md              # Homepage
├── CONTRIBUTING.md       # Documentation guide
└── package.json
```

## 🎯 Migration Status

This documentation site is centralizing docs from individual repositories:

- ✅ EventiveAPI - Basic docs migrated
- ✅ Eventive (tsa-repository) - Basic docs migrated
- 🔄 Ongoing - Expanding and improving documentation

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines.

## 📄 License

See [LICENSE](./LICENSE) file for details.

## 🔗 Links

- 🌐 [Live Documentation](your-site-url)
- 🐙 [GitHub Repository](https://github.com/Juno-Labs-Team/docs)
- 🏢 [Juno Labs Team](https://github.com/Juno-Labs-Team)
