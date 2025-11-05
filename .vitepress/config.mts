import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Juno Labs Docs",
  description: "Docs site containing information about all Juno products",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Eventive', link: '/eventive/' },
      { text: 'EventiveAPI', link: '/eventive-api/' }
    ],

    sidebar: {
      '/eventive/': [
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
          text: 'Documentation',
          items: [
            { text: 'Architecture', link: '/eventive-api/architecture' },
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
