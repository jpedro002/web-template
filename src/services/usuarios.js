import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from 'src/lib/axios'

// ==========================================
// 1. CONFIG & QUERY KEYS
// ==========================================
const BASE_URL = '/seguranca/usuarios'

export const usuariosKeys = {
	all: ['usuarios'],
	list: (filters = {}) => [...usuariosKeys.all, 'list', filters],
	detail: (id) => [...usuariosKeys.all, 'detail', id],
	get: (id) => [...usuariosKeys.all, 'get', id],
}

// ==========================================
// 2. API METHODS (Service Layer)
// ==========================================
const usuariosService = {
	/**
	 * Listar usuários com filtros
	 * @param {Object} filters - Filtros: term, fields, order, page, pageSize
	 */
	list: async (filters = {}) => {
		const { term, fields, order, page = 1, pageSize = 20 } = filters
		const params = {
			term,
			fields: Array.isArray(fields) ? fields : undefined,
			order,
			page,
			pageSize,
		}
		const response = await api.get(BASE_URL, { params })
		return response.data
	},

	/**
	 * Obter usuário por ID
	 * @param {string} id - ID do usuário
	 */
	get: async (id) => {
		const response = await api.get(`${BASE_URL}/${id}`)
		return response.data
	},

	/**
	 * Criar novo usuário
	 * @param {Object} data - Dados do usuário: email, password, name, etc
	 */
	create: async (data) => {
		const response = await api.post(BASE_URL, data)
		return response.data
	},

	/**
	 * Atualizar usuário
	 * @param {string} id - ID do usuário
	 * @param {Object} data - Dados a atualizar
	 */
	update: async (id, data) => {
		const response = await api.put(`${BASE_URL}/${id}`, data)
		return response.data
	},

	/**
	 * Deletar usuário
	 * @param {string} id - ID do usuário
	 */
	delete: async (id) => {
		await api.delete(`${BASE_URL}/${id}`)
	},

	/**
	 * Alterar senha do usuário
	 * @param {string} userId - ID do usuário
	 * @param {Object} data - { senhaAtual, novaSenha }
	 */
	updatePassword: async (userId, data) => {
		const response = await api.post(`${BASE_URL}/${userId}/alterar-senha`, data)
		return response.data
	},

	/**
	 * Atribuir role a usuário
	 * @param {string} userId - ID do usuário
	 * @param {string} roleId - ID da role
	 * @param {Object} options - { assignedBy, expiresAt }
	 */
	assignRole: async (userId, roleId, options = {}) => {
		const response = await api.post(
			`${BASE_URL}/${userId}/roles/${roleId}`,
			options,
		)
		return response.data
	},

	/**
	 * Remover role de usuário
	 * @param {string} userId - ID do usuário
	 * @param {string} roleId - ID da role
	 */
	removeRole: async (userId, roleId) => {
		await api.delete(`${BASE_URL}/${userId}/roles/${roleId}`)
	},

	/**
	 * Atribuir permissão a usuário
	 * @param {string} userId - ID do usuário
	 * @param {string} permissionId - ID da permissão
	 * @param {Object} options - { grantedBy, expiresAt }
	 */
	grantPermission: async (userId, permissionId, options = {}) => {
		const response = await api.post(
			`${BASE_URL}/${userId}/permissions/${permissionId}`,
			options,
		)
		return response.data
	},

	/**
	 * Remover permissão de usuário
	 * @param {string} userId - ID do usuário
	 * @param {string} permissionId - ID da permissão
	 */
	revokePermission: async (userId, permissionId) => {
		await api.delete(`${BASE_URL}/${userId}/permissions/${permissionId}`)
	},
}

// ==========================================
// 3. HOOKS (React Query Layer)
// ==========================================

/**
 * Hook para listar usuários com paginação
 * @param {Object} filters - Filtros aplicados
 */
export function useUsuariosList(filters = {}) {
	return useQuery({
		queryKey: usuariosKeys.list(filters),
		queryFn: () => usuariosService.list(filters),
		staleTime: 1000 * 60 * 5, // 5 minutos
	})
}

/**
 * Hook para obter usuário por ID
 * @param {string} id - ID do usuário
 * @param {boolean} enabled - Se deve fazer fetch automático
 */
export function useUsuario(id, enabled = true) {
	return useQuery({
		queryKey: usuariosKeys.get(id),
		queryFn: () => usuariosService.get(id),
		enabled: enabled && !!id,
		staleTime: 1000 * 60 * 5,
	})
}

/**
 * Hook para criar usuário
 */
export function useUsuarioCreate() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: usuariosService.create,
		onSuccess: () => {
			// Invalidar lista de usuários
			queryClient.invalidateQueries({ queryKey: usuariosKeys.all })
		},
	})
}

/**
 * Hook para atualizar usuário
 */
export function useUsuarioUpdate() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: ({ id, data }) => usuariosService.update(id, data),
		onSuccess: (data) => {
			// Invalidar cache do usuário específico
			queryClient.invalidateQueries({ queryKey: usuariosKeys.detail(data.id) })
			// Invalidar lista
			queryClient.invalidateQueries({ queryKey: usuariosKeys.all })
		},
	})
}

/**
 * Hook para deletar usuário
 */
export function useUsuarioDelete() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: usuariosService.delete,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: usuariosKeys.all })
		},
	})
}

/**
 * Hook para alterar senha
 */
export function useUsuarioUpdatePassword() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: ({ userId, data }) =>
			usuariosService.updatePassword(userId, data),
		onSuccess: () => {
			// Não invalida lista, apenas dados de sessão
			queryClient.invalidateQueries({ queryKey: ['session'] })
		},
	})
}

/**
 * Hook para atribuir role
 */
export function useUsuarioAssignRole() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: ({ userId, roleId, options }) =>
			usuariosService.assignRole(userId, roleId, options),
		onSuccess: (data, { userId }) => {
			queryClient.invalidateQueries({ queryKey: usuariosKeys.detail(userId) })
		},
	})
}

/**
 * Hook para remover role
 */
export function useUsuarioRemoveRole() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: ({ userId, roleId }) =>
			usuariosService.removeRole(userId, roleId),
		onSuccess: (data, { userId }) => {
			queryClient.invalidateQueries({ queryKey: usuariosKeys.detail(userId) })
		},
	})
}

/**
 * Hook para atribuir permissão
 */
export function useUsuarioGrantPermission() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: ({ userId, permissionId, options }) =>
			usuariosService.grantPermission(userId, permissionId, options),
		onSuccess: (data, { userId }) => {
			queryClient.invalidateQueries({ queryKey: usuariosKeys.detail(userId) })
		},
	})
}

/**
 * Hook para remover permissão
 */
export function useUsuarioRevokePermission() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: ({ userId, permissionId }) =>
			usuariosService.revokePermission(userId, permissionId),
		onSuccess: (data, { userId }) => {
			queryClient.invalidateQueries({ queryKey: usuariosKeys.detail(userId) })
		},
	})
}

// Exportar service para uso direto se necessário (raro)
export { usuariosService }
