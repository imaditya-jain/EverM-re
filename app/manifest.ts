import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'StorePilot AI',
    short_name: 'StorePilot AI',
    description: 'AI-powered Shopify SEO, product sync, and growth workflows.',

    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',

    background_color: '#FBFAFC',
    theme_color: '#6D28D9',

    icons: [
      {
        src: '/images/favicon192.png?v=storepilot-ai',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/images/favicon512.png?v=storepilot-ai',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/images/favicon512.png?v=storepilot-ai',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],

    categories: ['business', 'productivity'],

    lang: 'en',
    dir: 'ltr',
  }
}
