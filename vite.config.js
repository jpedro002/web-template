import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import conventionRoutes from './plugins/vite-plugin-convention-routes'

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		react({
			babel: {
				plugins: [['babel-plugin-react-compiler']],
			},
		}),
		tailwindcss(),
		conventionRoutes({
			excludePatterns: ['**/components/*.jsx', ''],
			pagesDir: 'src/pages',
		}),
	],
	resolve: {
		alias: {
			src: '/src',
		},
	},
})
