import { MetadataRoute } from 'next';

const manifest = (): MetadataRoute.Manifest => {
	return {
		name: 'Gynora',
		short_name: 'Gynora',
		description: '✨ Your personal health pal, powered by AI',
		start_url: '/',
		display: 'standalone',
		background_color: '#5e17eb',
		theme_color: '#5e17eb',
		icons: [
			{
				src: '/favicon.ico',
				sizes: 'any',
				type: 'image/x-icon'
			},
			{
        src: '/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png'
      },
      {
        src: '/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png'
      }
		]
	};
};

export default manifest;
