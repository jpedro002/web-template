import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'
import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query'
import { toast } from './toast'

// ==========================================
// Tratamento Global de Erros
// ==========================================
const handleAuthError = (error) => {
	const status = error?.response?.status
	const message = error?.response?.data?.message

	// Token expirado ou inválido
	if (status === 401) {
		localStorage.removeItem('token')
		localStorage.removeItem('permissions')
		localStorage.removeItem('session')
		sessionStorage.removeItem('token')

		if (!window.location.pathname.includes('/auth')) {
			window.location.href = '/auth'
		}
		return
	}

	// Acesso negado (sem permissão)
	if (status === 403) {
		toast.error(message || 'Acesso negado. Você não tem permissão.')
		return
	}

	// Validação
	if (status === 400) {
		toast.error(message || 'Dados inválidos.')
		return
	}

	// Conflito
	if (status === 409) {
		toast.error(message || 'Conflito nos dados.')
		return
	}

	// Erro no servidor
	if (status >= 500) {
		toast.error('Erro no servidor. Tente novamente.')
		return
	}

	// Erro de rede
	if (!status) {
		toast.error('Erro de conexão. Verifique sua internet.')
		return
	}

	// Erro genérico
	if (message) {
		toast.error(message)
	}
}

export const queryClient = new QueryClient({
	queryCache: new QueryCache({
		onError: (error) => {
			handleAuthError(error)
		},
	}),
	mutationCache: new MutationCache({
		onError: (error) => {
			handleAuthError(error)
		},
	}),
	defaultOptions: {
		queries: {
			gcTime: 1000 * 60 * 60 * 24, // 24 horas
			staleTime: 1000 * 60 * 5, // 5 minutos
			retry: false, // Desabilitar retry automático (será controlado manualmente)
			refetchOnWindowFocus: false, // Não refetch ao voltar para tab
		},
		mutations: {
			retry: false,
		},
	},
})

export const persister = createAsyncStoragePersister({
	storage: window.localStorage,
})
