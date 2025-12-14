import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from 'src/lib/axios'

// ==========================================
// 1. CONFIG & QUERY KEYS
// ==========================================
const BASE_URL = '/seguranca/auth'

export const sessionKeys = {
	all: ['session'],
	get: () => [...sessionKeys.all, 'get'],
	login: () => [...sessionKeys.all, 'login'],
	logout: () => [...sessionKeys.all, 'logout'],
}

// ==========================================
// 2. API METHODS (Service Layer)
// ==========================================
const authService = {
	/**
	 * Login com email e senha
	 * Retorna: { token, user: { id, email, name, roles, permissions } }
	 */
	login: async (credentials) => {
		// 1. Fazer login e receber token
		const loginResponse = await api.post(`${BASE_URL}/session`, credentials)
		const { token } = loginResponse.data

		// 2. Armazenar token (necessário para próxima requisição)
		localStorage.setItem('token', token)

		// 3. Buscar dados do usuário com o novo token
		const sessionResponse = await api.get(`${BASE_URL}/session`)
		const { usuario } = sessionResponse.data // API retorna "usuario" em português

		// 4. Armazenar dados do usuário
		localStorage.setItem(
			'permissions',
			JSON.stringify(usuario.permissions || []),
		)
		localStorage.setItem('roles', JSON.stringify(usuario.roles || []))
		localStorage.setItem('session', JSON.stringify(usuario))

		return { token, user: usuario } // Retorna como "user" para manter padrão
	},

	/**
	 * Obter sessão atual do usuário
	 * Retorna dados do usuário autenticado
	 */
	getSession: async () => {
		const response = await api.get(`${BASE_URL}/session`)
		// API retorna { usuario }, normalizamos para { user }
		return { user: response.data.usuario }
	},

	/**
	 * Logout - Limpar dados locais
	 */
	logout: async () => {
		try {
			// Opcional: notificar backend (se ele manter blacklist de tokens)
			await api.post(`${BASE_URL}/logout`)
		} catch (error) {
			// Continuar mesmo se falhar, limpar dados locais de qualquer forma
			console.error('Erro ao fazer logout no servidor:', error)
		} finally {
			// Sempre limpar dados locais
			localStorage.removeItem('token')
			localStorage.removeItem('permissions')
			localStorage.removeItem('roles')
			localStorage.removeItem('session')
			sessionStorage.removeItem('token')
		}
	},

	/**
	 * Refresh token (se API tiver suporte)
	 */
	refreshToken: async () => {
		const response = await api.post(`${BASE_URL}/refresh`)
		const { token } = response.data

		if (token) {
			localStorage.setItem('token', token)
		}

		return response.data
	},

	/**
	 * Verificar permissão localmente (offline)
	 */
	hasPermission: (permission) => {
		const permissions = JSON.parse(localStorage.getItem('permissions') || '[]')

		// Verificar match com wildcards
		return permissions.some((perm) => {
			// Wildcard total
			if (perm === '*') return true
			// Wildcard de recurso: "users:*"
			if (perm.endsWith('*')) {
				const prefix = perm.slice(0, -1) // Remove o *
				return permission.startsWith(prefix)
			}
			// Wildcard de ação: "*:read"
			if (perm.startsWith('*:')) {
				const suffix = perm.slice(1) // Remove o *
				return permission.endsWith(suffix)
			}
			// Match exato
			return perm === permission
		})
	},

	/**
	 * Verificar se usuário tem uma role
	 */
	hasRole: (role) => {
		const roles = JSON.parse(localStorage.getItem('roles') || '[]')
		return roles.includes(role)
	},

	/**
	 * Obter usuário atual (dados cacheados localmente)
	 */
	getCurrentUser: () => {
		const session = localStorage.getItem('session')
		return session ? JSON.parse(session) : null
	},

	/**
	 * Obter token do localStorage
	 */
	getToken: () => {
		return localStorage.getItem('token')
	},

	/**
	 * Verificar se usuário está autenticado
	 */
	isAuthenticated: () => {
		return !!localStorage.getItem('token')
	},
}

// ==========================================
// 3. HOOKS (React Query Layer)
// ==========================================

/**
 * Hook para fazer login
 * @returns { mutate, mutateAsync, isPending, isError, error }
 */
export function useLogin() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: authService.login,
		onSuccess: (data) => {
			// Invalidar queries de sessão para atualizar
			queryClient.invalidateQueries({ queryKey: sessionKeys.all })
		},
		onError: (error) => {
			// Erro já tratado pelo interceptador
			console.error('Login error:', error)
		},
	})
}

/**
 * Hook para obter sessão do usuário
 * @param {boolean} enabled - Se deve fazer fetch automaticamente
 * @returns { data, isLoading, isError, error }
 */
export function useSession(enabled = true) {
	return useQuery({
		queryKey: sessionKeys.get(),
		queryFn: authService.getSession,
		enabled: enabled && authService.isAuthenticated(),
		staleTime: 1000 * 60 * 5, // 5 minutos
		retry: 1, // Tentar 1 vez em caso de erro
	})
}

/**
 * Hook para fazer logout
 * @returns { mutate, mutateAsync, isPending, isError }
 */
export function useLogout() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: authService.logout,
		onSuccess: () => {
			// Limpar cache
			queryClient.clear()

			// Redirecionar para login
			if (!window.location.pathname.includes('/auth')) {
				window.location.href = '/auth/login'
			}
		},
	})
}

/**
 * Hook para refresh token (se necessário)
 */
export function useRefreshToken() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: authService.refreshToken,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: sessionKeys.all })
		},
	})
}

/**
 * Hook customizado para proteger rotas baseado em permissão
 * @param {string|string[]} requiredPermissions - Permissão(ões) necessária(s)
 * @param {boolean} requireAll - Se true, precisa de TODAS as perms; se false, qualquer uma
 * @returns {boolean} Tem permissão?
 */
export function useHasPermission(requiredPermissions, requireAll = false) {
	const permissions = JSON.parse(localStorage.getItem('permissions') || '[]')

	const permArray = Array.isArray(requiredPermissions)
		? requiredPermissions
		: [requiredPermissions]

	const checkPermission = (permission) => {
		return permissions.some((perm) => {
			if (perm === '*') return true
			if (perm.endsWith('*')) return permission.startsWith(perm.slice(0, -1))
			if (perm.startsWith('*:')) return permission.endsWith(perm.slice(1))
			return perm === permission
		})
	}

	if (requireAll) {
		return permArray.every(checkPermission)
	}

	return permArray.some(checkPermission)
}

/**
 * Hook customizado para verificar role
 * @param {string|string[]} requiredRoles - Role(s) necessária(s)
 * @param {boolean} requireAll - Se true, precisa de TODAS as roles
 * @returns {boolean} Tem role?
 */
export function useHasRole(requiredRoles, requireAll = false) {
	const roles = JSON.parse(localStorage.getItem('roles') || '[]')

	const roleArray = Array.isArray(requiredRoles)
		? requiredRoles
		: [requiredRoles]

	if (requireAll) {
		return roleArray.every((role) => roles.includes(role))
	}

	return roleArray.some((role) => roles.includes(role))
}

/**
 * Hook para obter usuário atual
 * @returns {object|null} Dados do usuário ou null
 */
export function useCurrentUser() {
	return authService.getCurrentUser()
}

/**
 * Hook para verificar se está autenticado
 * @returns {boolean}
 */
export function useIsAuthenticated() {
	const token = localStorage.getItem('token')
	return !!token
}

// Exportar service para uso direto se necessário
export { authService }
