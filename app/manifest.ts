import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'EverM♥re',
    short_name: 'EverM♥re',
    description: 'Meet new people. Make real connections.',

    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',

    background_color: '#f2f3f4',
    theme_color: '#0d2033',

    icons: [
      {
        src: '/images/favicon192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/images/favicon512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/images/favicon512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],

    categories: ['social', 'lifestyle'],

    lang: 'en',
    dir: 'ltr',
  }
}