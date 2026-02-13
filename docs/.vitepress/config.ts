import { defineConfig } from 'vitepress'

const ogDescription = 'The boring datatable that does exactly what you need. Zero dependencies, framework-agnostic, 9KB gzipped. Built for devs who are tired of fighting CSS.'
const ogTitle = 'Mundane UI'
const ogUrl = 'https://mundane-ui.vercel.app'

export default defineConfig({
  title: 'Mundane UI',
  description: ogDescription,
  lang: 'en-US',

  sitemap: {
    hostname: ogUrl,
  },

  head: [
    ['meta', { name: 'theme-color', content: '#000000' }],
    ['meta', { name: 'author', content: 'Mundane UI' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: ogTitle }],
    ['meta', { property: 'og:description', content: ogDescription }],
    ['meta', { property: 'og:url', content: ogUrl }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:title', content: ogTitle }],
    ['meta', { name: 'twitter:description', content: ogDescription }],
    ['meta', { name: 'keywords', content: 'datatable, table, ui components, framework-agnostic, zero-dependency, javascript, typescript, vanilla js, lightweight, css customizable, tailwind, react table alternative, vue table' }],
    ['link', { rel: 'icon', type: 'image/png', href: '/mundane-logo.png' }],
    ['meta', { property: 'og:image', content: ogUrl + '/mundane-logo.png' }],
    ['meta', { name: 'twitter:image', content: ogUrl + '/mundane-logo.png' }],
    ['script', { type: 'application/ld+json' }, JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'Mundane UI',
      description: ogDescription,
      url: ogUrl,
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'Any',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      license: 'https://opensource.org/licenses/MIT',
    })],
  ],

  themeConfig: {
    logo: '/mundane-logo.png',
    siteTitle: 'Mundane UI',

    nav: [
      { text: 'Why This Exists', link: '/guide/why' },
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'API', link: '/api/config' },
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Start Here',
          items: [
            { text: 'Why This Exists', link: '/guide/why' },
            { text: 'Getting Started', link: '/guide/getting-started' },
          ],
        },
        {
          text: 'Core Concepts',
          items: [
            { text: 'Frontend Mode', link: '/guide/frontend-mode' },
            { text: 'Backend Mode', link: '/guide/backend-mode' },
            { text: 'Column Types', link: '/guide/columns' },
            { text: 'Styling & Theming', link: '/guide/styling' },
          ],
        },
      ],
      '/api/': [
        {
          text: 'API Reference',
          items: [
            { text: 'Configuration', link: '/api/config' },
            { text: 'Methods', link: '/api/methods' },
            { text: 'Types', link: '/api/types' },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/waga97/Mundane-UI' },
      { icon: 'npm', link: 'https://www.npmjs.com/package/mundane-ui' },
    ],

    editLink: {
      pattern: 'https://github.com/waga97/Mundane-UI/edit/main/docs/:path',
      text: 'Suggest changes to this page',
    },

    footer: {
      message: 'MIT Licensed. Built with frustration and love.',
    },

    search: {
      provider: 'local',
    },

    outline: {
      level: [2, 3],
      label: 'On this page',
    },
  },
})
