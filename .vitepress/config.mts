import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Juno Labs Docs",
  description: "Docs site containing information about all Juno products",
  ignoreDeadLinks: true, // Temporarily ignore dead links while building out docs
  vite: {
    logLevel: 'error', // Suppress warning messages
  },
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Eventive', link: '/eventive/' },
      { text: 'EventiveAPI', link: '/eventive-api/' },
      { text: 'Contributing', link: '/CONTRIBUTING' }
    ],

    sidebar: {
      '/eventive/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Installation', link: '/eventive/getting-started/installation' }
          ]
        },
        {
          text: 'Contributing',
          items: [
            { text: 'Contributor Guide', link: '/eventive/contributing/contributor-guide' }
          ]
        },
        {
          text: 'Architecture',
          items: [
            { text: 'Folder Structure', link: '/eventive/architecture/folder-structure' }
          ]
        },
        {
          text: 'Reference',
          items: [
            { text: 'File Reference', link: '/eventive/reference/file-reference' }
          ]
        },
        {
          text: 'Code Reference',
          items: [
            { text: 'Core Files', link: '/eventive/code-reference/core-files' },
            { text: 'Context Providers', link: '/eventive/code-reference/contexts' },
            { text: 'Components', link: '/eventive/code-reference/components' }
          ]
        },
        {
          text: 'Docker & Deployment',
          items: [
            { text: 'Docker Guide', link: '/eventive/docker/docker' }
          ]
        },
        {
          text: 'Git & Version Control',
          items: [
            { text: 'Changelog', link: '/eventive/git/changelog' },
            { text: 'Naming Scheme', link: '/eventive/git/namescheme' },
            { text: 'Authentication', link: '/eventive/git/safety/authentication' }
          ]
        },
        {
          text: 'TSA Project',
          items: [
            { text: 'Components', link: '/eventive/tsa-project/src/components' },
            { text: 'Pages', link: '/eventive/tsa-project/src/pages' },
            { text: 'Styling Guide', link: '/eventive/tsa-project/styling/styling-guide' }
          ]
        },
        {
          text: 'TypeScript',
          items: [
            { text: 'ESLint Rules', link: '/eventive/typescript/eslint-rules' }
          ]
        }
      ],
      '/eventive-api/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Quickstart', link: '/eventive-api/quickstart' },
            { text: 'Setup Summary', link: '/eventive-api/setup-summary' }
          ]
        },
        {
          text: 'Architecture',
          items: [
            { text: 'Overview', link: '/eventive-api/architecture' }
          ]
        },
        {
          text: 'Reference',
          items: [
            { text: 'File Reference', link: '/eventive-api/reference/file-reference' }
          ]
        },
        {
          text: 'API Reference',
          items: [
            { text: 'Authentication', link: '/eventive-api/api/authentication' },
            { text: 'Users', link: '/eventive-api/api/users' },
            { text: 'Settings', link: '/eventive-api/api/settings' },
            { text: 'Uploads', link: '/eventive-api/api/uploads' }
          ]
        },
        {
          text: 'Database',
          items: [
            { text: 'Migration Guide', link: '/eventive-api/migration' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/Juno-Labs-Team/docs' }
    ],

    search: {
      provider: 'local'
    }
  }
})
