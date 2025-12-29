import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from 'src/lib/axios'
import { createBaseService } from './base/createBaseService'

const BASE_URL = '/seguranca/permissoes'

// ==========================================
// 1. GERA A BASE DO SERVICE (CRUD Padrão)
// ==========================================
const baseService = createBaseService(BASE_URL, 'permissoes')

// Extrai o que foi gerado automaticamente
const {
	keys: permissoesKeys,
	api: baseApi,
	useList: usePermissoesList,
	useListAll: usePermissoesListAll,
	useGet: usePermissoes,
	useCreate: usePermissoesCreate,
	useUpdate: usePermissoesUpdate,
	useDelete: usePermissoesDelete,
} = baseService

// ==========================================
// 2. MÉTODOS CUSTOMIZADOS (Se necessário)
// ==========================================

// ==========================================
// 3. EXPORTS
// ==========================================

// API Methods (caso precise usar diretamente)
export const permissoesService = {
	...baseApi,
}

// Query Keys (útil para invalidações manuais)
export { permissoesKeys }

// Hooks Base (CRUD)
export {
	usePermissoesList,
	usePermissoesListAll,
	usePermissoes,
	usePermissoesCreate,
	usePermissoesUpdate,
	usePermissoesDelete,
}
