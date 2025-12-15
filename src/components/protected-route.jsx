import { Navigate } from 'react-router'
import { useAuth } from 'src/contexts/auth-context'

/**
 * Componente para proteger rotas
 * Redireciona para login se não autenticado
 *
 * @example
 * <ProtectedRoute>
 *   <Dashboard />
 * </ProtectedRoute>
 */
export function ProtectedRoute({ children }) {
	const { isAuthenticated, isReady } = useAuth()

	if (!isReady) {
		// Pode mostrar um loading aqui
		return null
	}

	if (!isAuthenticated) {
		return <Navigate to="/auth" replace />
	}

	return children
}

/**
 * Componente para proteger rotas por permissão
 * Redireciona para 404 se não tiver permissão
 *
 * @example
 * <PermissionRoute permission="users:create">
 *   <CreateUser />
 * </PermissionRoute>
 */
export function PermissionRoute({ children, permission, fallback = null }) {
	const { isAuthenticated, isReady, session } = useAuth()

	if (!isReady) {
		return null
	}

	if (!isAuthenticated) {
		return <Navigate to="/auth" replace />
	}

	const permissions = session?.user?.permissions || []
	const hasPermission = checkPermission(permission, permissions)

	if (!hasPermission) {
		return fallback || <Navigate to="/404" replace />
	}

	return children
}

/**
 * Componente para proteger rotas por role
 * Redireciona para 404 se não tiver role
 *
 * @example
 * <RoleRoute role="ADMIN">
 *   <AdminPanel />
 * </RoleRoute>
 */
export function RoleRoute({ children, role, fallback = null }) {
	const { isAuthenticated, isReady, session } = useAuth()

	if (!isReady) {
		return null
	}

	if (!isAuthenticated) {
		return <Navigate to="/auth" replace />
	}

	const roles = session?.user?.roles || []
	const hasRole = Array.isArray(role)
		? role.some((r) => roles.includes(r))
		: roles.includes(role)

	if (!hasRole) {
		return fallback || <Navigate to="/404" replace />
	}

	return children
}

/**
 * Função auxiliar para checar permissão com wildcard
 */
function checkPermission(required, userPermissions) {
	const requiredArray = Array.isArray(required) ? required : [required]

	return requiredArray.some((perm) => {
		return userPermissions.some((userPerm) => {
			// Wildcard total
			if (userPerm === '*') return true
			// Wildcard de recurso: "users:*"
			if (userPerm.endsWith('*')) {
				const prefix = userPerm.slice(0, -1)
				return perm.startsWith(prefix)
			}
			// Wildcard de ação: "*:read"
			if (userPerm.startsWith('*:')) {
				const suffix = userPerm.slice(1)
				return perm.endsWith(suffix)
			}
			// Match exato
			return userPerm === perm
		})
	})
}
