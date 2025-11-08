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
      { text: 'Contributing', link: '/CONTRIBUTING' },
      { text: 'Algorithms', link: '/algs/' }
    ],

    sidebar: {
      '/algs/': [
        {
          text: 'Algorithms',
          items: [
            { text: 'Overview', link: '/algs/' }
          ]
        },
        {
          text: 'Go',
          collapsed: false,
          items: [
            {
              text: 'Sorting',
              collapsed: false,
              items: [
                { text: 'Insertion Sort', link: '/algs/go/sorting/insertion-sort' },
                { text: 'Selection Sort', link: '/algs/go/sorting/selection-sort' },
                { text: 'Bubble Sort', link: '/algs/go/sorting/bubble-sort' },
                { text: 'Merge Sort', link: '/algs/go/sorting/merge-sort' },
                { text: 'QuickSort 3-Way', link: '/algs/go/sorting/quicksort-3' }
              ]
            },
            {
              text: 'Searching',
              collapsed: false,
              items: [
                // Add searching algorithms here
              ]
            }
          ]
        },
        {
          text: 'Java',
          collapsed: false,
          items: [
            {
              text: 'Sorting',
              collapsed: false,
              items: [
                { text: 'Insertion Sort', link: '/algs/java/sorting/insertion-sort' },
                { text: 'Selection Sort', link: '/algs/java/sorting/selection-sort' },
                { text: 'Bubble Sort', link: '/algs/java/sorting/bubble-sort' },
                { text: 'Merge Sort', link: '/algs/java/sorting/merge-sort' },
                { text: 'QuickSort 3-Way', link: '/algs/java/sorting/quicksort-3' }
              ]
            },
            {
              text: 'Searching',
              collapsed: false,
              items: [
                // Add searching algorithms here
              ]
            }
          ]
        },
        {
          text: 'C++',
          collapsed: false,
          items: [
            {
              text: 'Sorting',
              collapsed: false,
              items: [
                { text: 'Insertion Sort', link: '/algs/cpp/sorting/insertion-sort' },
                { text: 'Selection Sort', link: '/algs/cpp/sorting/selection-sort' },
                { text: 'Bubble Sort', link: '/algs/cpp/sorting/bubble-sort' },
                { text: 'Merge Sort', link: '/algs/cpp/sorting/merge-sort' },
                { text: 'QuickSort 3-Way', link: '/algs/cpp/sorting/quicksort-3' }
              ]
            },
            {
              text: 'Searching',
              collapsed: false,
              items: [
                // Add searching algorithms here
              ]
            }
          ]
        },
        {
          text: 'JavaScript/TypeScript',
          collapsed: false,
          items: [
            {
              text: 'Sorting',
              collapsed: false,
              items: [
                { text: 'Insertion Sort', link: '/algs/javascript/sorting/insertion-sort' },
                { text: 'Selection Sort', link: '/algs/javascript/sorting/selection-sort' },
                { text: 'Bubble Sort', link: '/algs/javascript/sorting/bubble-sort' },
                { text: 'Merge Sort', link: '/algs/javascript/sorting/merge-sort' },
                { text: 'QuickSort 3-Way', link: '/algs/javascript/sorting/quicksort-3' }
              ]
            },
            {
              text: 'Searching',
              collapsed: false,
              items: [
                // Add searching algorithms here
              ]
            }
          ]
        }
      ],
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
