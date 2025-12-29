import { lazy, Suspense } from 'react'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { HelmetProvider } from 'react-helmet-async'
import { RouterProvider } from 'react-router'
import { Toaster } from 'sonner'
// @ts-expect-error
import { routes } from 'src/generated/routes'
import { persister, queryClient } from './lib/react-query'

// Lazy load devtools apenas em desenvolvimento
const ReactQueryDevtools =
	import.meta.env.DEV
		? lazy(() =>
				import('@tanstack/react-query-devtools').then((res) => ({
					default: res.ReactQueryDevtools,
				})),
			)
		: () => null

const App = () => {
	return (
		<HelmetProvider>
			<PersistQueryClientProvider
				client={queryClient}
				persistOptions={{ persister }}
			>
				<RouterProvider router={routes} />
				{import.meta.env.DEV && (
					<Suspense fallback={null}>
						<ReactQueryDevtools initialIsOpen={false} />
					</Suspense>
				)}
				{/* Toaster global para toasts personalizados (sonner) */}
				<Toaster position="top-right" />
			</PersistQueryClientProvider>
		</HelmetProvider>
	)
}

export default App
