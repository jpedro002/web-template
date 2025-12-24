import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from 'src/lib/axios'
import { createBaseService } from './base/createBaseService'

const BASE_URL = '/seguranca/usuarios'

// ==========================================
// 1. GERA A BASE DO SERVICE (CRUD Padrão)
// ==========================================
const baseService = createBaseService(BASE_URL, 'usuarios')

// Extrai o que foi gerado automaticamente
const {
	keys: usuariosKeys,
	api: baseApi,
	useList: useUsuariosList,
	useListAll: useUsuariosListAll,
	useGet: useUsuario,
	useCreate: useUsuarioCreate,
	useUpdate: useUsuarioUpdate,
	useDelete: useUsuarioDelete,
} = baseService

// ==========================================
// 2. MÉTODOS CUSTOMIZADOS
// ==========================================

/**
 * Atribuir role a usuário
 * @param {string} userId - ID do usuário
 * @param {string} roleId - ID da role
 * @param {Object} options - { assignedBy, expiresAt }
 */
const assignRole = async (userId, roleId, options = {}) => {
	const response = await api.post(
		`${BASE_URL}/${userId}/roles/${roleId}`,
		options,
	)
	return response.data
}

/**
 * Remover role de usuário
 * @param {string} userId - ID do usuário
 * @param {string} roleId - ID da role
 */
const removeRole = async (userId, roleId) => {
	await api.delete(`${BASE_URL}/${userId}/roles/${roleId}`)
}

/**
 * Atribuir permissão a usuário
 * @param {string} userId - ID do usuário
 * @param {string} permissionId - ID da permissão
 * @param {Object} options - { grantedBy, expiresAt }
 */
const grantPermission = async (userId, permissionId, options = {}) => {
	const response = await api.post(
		`${BASE_URL}/${userId}/permissions/${permissionId}`,
		options,
	)
	return response.data
}

/**
 * Remover permissão de usuário
 * @param {string} userId - ID do usuário
 * @param {string} permissionId - ID da permissão
 */
const revokePermission = async (userId, permissionId) => {
	await api.delete(`${BASE_URL}/${userId}/permissions/${permissionId}`)
}

// ==========================================
// 3. HOOKS CUSTOMIZADOS
// ==========================================

/**
 * Hook para atribuir role
 */
export function useUsuarioAssignRole() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: ({ userId, roleId, options }) =>
			assignRole(userId, roleId, options),
		onSuccess: (data, { userId }) => {
			queryClient.invalidateQueries({ queryKey: usuariosKeys.detail(userId) })
			queryClient.invalidateQueries({ queryKey: usuariosKeys.list() })
		},
	})
}

/**
 * Hook para remover role
 */
export function useUsuarioRemoveRole() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: ({ userId, roleId }) => removeRole(userId, roleId),
		onSuccess: (data, { userId }) => {
			queryClient.invalidateQueries({ queryKey: usuariosKeys.detail(userId) })
			queryClient.invalidateQueries({ queryKey: usuariosKeys.list() })
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
			grantPermission(userId, permissionId, options),
		onSuccess: (data, { userId }) => {
			queryClient.invalidateQueries({ queryKey: usuariosKeys.detail(userId) })
			queryClient.invalidateQueries({ queryKey: usuariosKeys.list() })
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
			revokePermission(userId, permissionId),
		onSuccess: (data, { userId }) => {
			queryClient.invalidateQueries({ queryKey: usuariosKeys.detail(userId) })
			queryClient.invalidateQueries({ queryKey: usuariosKeys.list() })
		},
	})
}

// ==========================================
// 4. EXPORTS
// ==========================================

// API Methods (caso precise usar diretamente)
export const usuariosService = {
	...baseApi,
	assignRole,
	removeRole,
	grantPermission,
	revokePermission,
}

// Query Keys (útil para invalidações manuais)
export { usuariosKeys }

// Hooks Base (CRUD)
export {
	useUsuariosList,
	useUsuariosListAll,
	useUsuario,
	useUsuarioCreate,
	useUsuarioUpdate,
	useUsuarioDelete,
}
