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
	build: {
		// Otimizações de build
		target: 'esnext',
		minify: 'esbuild',
		cssMinify: true,
		rollupOptions: {
			output: {
				// Separar chunks por vendor - usando função para Rolldown
				manualChunks: (id) => {
					if (id.includes('node_modules')) {
						// React e React DOM
						if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
							return 'react-vendor'
						}
						// TanStack Query
						if (id.includes('@tanstack/react-query')) {
							return 'query-vendor'
						}
						// Radix UI (componentes)
						if (id.includes('@radix-ui')) {
							return 'ui-vendor'
						}
						// Outras dependências
						return 'vendor'
					}
				},
			},
		},
		// Aumentar limite de warning de chunk
		chunkSizeWarningLimit: 1000,
	},
	// Otimizações de servidor dev
	server: {
		hmr: {
			overlay: true,
		},
	},
	// Pre-bundling de dependências
	optimizeDeps: {
		include: ['react', 'react-dom', 'react-router-dom', '@tanstack/react-query'],
		exclude: [],
	},
})
