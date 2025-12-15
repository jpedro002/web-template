import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { HelmetProvider } from 'react-helmet-async'
import { RouterProvider } from 'react-router'
import { Toaster } from 'sonner'
// @ts-expect-error
import { routes } from 'src/generated/routes'
import { persister, queryClient } from './lib/react-query'

const App = () => {
	return (
		<HelmetProvider>
			<PersistQueryClientProvider
				client={queryClient}
				persistOptions={{ persister }}
			>
				<RouterProvider router={routes} />
				<ReactQueryDevtools initialIsOpen={false} />
				{/* Toaster global para toasts personalizados (sonner) */}
				<Toaster position="top-right" />
			</PersistQueryClientProvider>
		</HelmetProvider>
	)
}

export default App
