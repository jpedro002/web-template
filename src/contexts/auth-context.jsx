import { createContext, useContext, useEffect, useState } from 'react'
import { useIsAuthenticated, useLogout, useSession } from 'src/services/auth'

/**
 * Contexto de Autenticação
 * Fornece estado global de autenticação
 */
const AuthContext = createContext()

export function AuthProvider({ children }) {
	const [isReady, setIsReady] = useState(false)
	const isAuthenticated = useIsAuthenticated()
	const { data: session, isLoading: sessionLoading } =
		useSession(isAuthenticated)
	const { mutate: logout } = useLogout()

	useEffect(() => {
		// Marcar como pronto após carregar a sessão
		if (!sessionLoading) {
			setIsReady(true)
		}
	}, [sessionLoading])

	const value = {
		isAuthenticated,
		session,
		sessionLoading,
		isReady,
		logout,
	}

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/**
 * Hook para usar contexto de autenticação
 */
export function useAuth() {
	const context = useContext(AuthContext)

	if (!context) {
		throw new Error('useAuth deve ser usado dentro de <AuthProvider>')
	}

	return context
}

/**
 * Hook para obter dados do usuário autenticado
 */
export function useAuthUser() {
	const { session } = useAuth()
	return session?.user || null
}

/**
 * Hook para obter permissões do usuário autenticado
 */
export function useAuthPermissions() {
	const { session } = useAuth()
	return session?.user?.permissions || []
}

/**
 * Hook para obter roles do usuário autenticado
 */
export function useAuthRoles() {
	const { session } = useAuth()
	return session?.user?.roles || []
}
