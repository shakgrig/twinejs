import react from '@vitejs/plugin-react-swc';
import browserslistToEsbuild from 'browserslist-to-esbuild';
import {defineConfig} from 'vite';
import checker from 'vite-plugin-checker';
import {VitePWA} from 'vite-plugin-pwa';
import packageJson from './package.json';

export default defineConfig({
	base: './',
	build: {
		outDir: 'dist/web',
		target: browserslistToEsbuild(['>0.2%', 'not dead', 'not op_mini all'])
	},
	// Fix for Vite 7.x compatibility with packages missing root exports
	optimizeDeps: {
		include: ['react-i18next', 'i18next']
	},
	define: {
		// Make app name and version available to code.
		// https://stackoverflow.com/a/74860417/7569568
		'process.env.VITE_APP_NAME': JSON.stringify(packageJson.name),
		'process.env.VITE_APP_VERSION': JSON.stringify(packageJson.version)
	},
	plugins: [
		checker({
			eslint: {
				lintCommand: 'eslint src',
				useFlatConfig: true
			},
			overlay: {
				initialIsOpen: false
			},
			typescript: true
		}),
		react(),
		VitePWA({
			manifest: {
				icons: [
					{
						src: './icons/pwa.png',
						sizes: '1024x1024',
						type: 'image/png'
					},
					{
						src: './icons/pwa-maskable.png',
						purpose: 'maskable',
						sizes: '1024x1024',
						type: 'image/png'
					}
				]
			},
			registerType: 'autoUpdate',
			includeAssets: ['locales/**', 'pwa/**', 'story-formats/**'],
			workbox: {
				globPatterns: ['**/*.{js,css,html,svg,woff,woff2}']
			}
		})
	],
	server: {
		open: true
	}
});
