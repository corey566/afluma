import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return { name: 'Afluma', short_name: 'Afluma', description: 'Intelligence in motion. People in command.', start_url: '/', display: 'browser', background_color: '#faf9f6', theme_color: '#6534d7', icons: [{ src: '/icon.png', sizes: '192x192', type: 'image/png' }] }
}
