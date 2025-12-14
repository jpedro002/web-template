/**
 * 📚 EXEMPLOS PRÁTICOS - Usando Autenticação e Permissões
 *
 * Este arquivo contém snippets prontos para usar no seu projeto
 */

// ==========================================
// 1. COMPONENTE COM VERIFICAÇÃO DE PERMISSÃO
// ==========================================

import { Button } from 'src/components/ui/button'
import { useHasPermission } from 'src/services/auth'

export function UsuariosActions() {
	const canCreate = useHasPermission('users:create')
	const canUpdate = useHasPermission('users:update')
	const canDelete = useHasPermission('users:delete')
	const canExport = useHasPermission('users:export')

	return (
		<div className="flex gap-2">
			{canCreate && <Button variant="default">Criar Usuário</Button>}
			{canUpdate && <Button variant="outline">Atualizar</Button>}
			{canDelete && <Button variant="destructive">Deletar</Button>}
			{canExport && <Button variant="secondary">Exportar</Button>}
		</div>
	)
}

// ==========================================
// 2. COMPONENTE COM VERIFICAÇÃO DE ROLE
// ==========================================

import { AlertCircle } from 'lucide-react'
import { useHasRole } from 'src/services/auth'

export function AdminPanel() {
	const isAdmin = useHasRole(['ADMIN', 'SUPER_ADMIN'])

	if (!isAdmin) {
		return (
			<div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
				<div className="flex items-center gap-2">
					<AlertCircle className="w-5 h-5 text-yellow-600" />
					<p className="text-yellow-800">
						Você não tem permissão para acessar painel administrativo
					</p>
				</div>
			</div>
		)
	}

	return <div>{/* Conteúdo do painel admin */}</div>
}

// ==========================================
// 3. LISTA COM AÇÕES CONTEXTUAIS
// ==========================================

import { Edit2, Eye, Trash2 } from 'lucide-react'
import { useHasPermission } from 'src/services/auth'

export function UsuariosList({ usuarios }) {
	const canRead = useHasPermission('users:read')
	const canUpdate = useHasPermission('users:update')
	const canDelete = useHasPermission('users:delete')

	if (!canRead) {
		return <p>Sem permissão para visualizar</p>
	}

	return (
		<table className="w-full">
			<thead>
				<tr>
					<th>Nome</th>
					<th>Email</th>
					<th>Ações</th>
				</tr>
			</thead>
			<tbody>
				{usuarios.map((user) => (
					<tr key={user.id}>
						<td>{user.name}</td>
						<td>{user.email}</td>
						<td className="flex gap-2">
							<button className="p-1 hover:bg-gray-100">
								<Eye className="w-4 h-4" />
							</button>
							{canUpdate && (
								<button className="p-1 hover:bg-gray-100">
									<Edit2 className="w-4 h-4" />
								</button>
							)}
							{canDelete && (
								<button className="p-1 hover:bg-red-100">
									<Trash2 className="w-4 h-4 text-red-600" />
								</button>
							)}
						</td>
					</tr>
				))}
			</tbody>
		</table>
	)
}

// ==========================================
// 4. FORMULÁRIO COM VALIDAÇÃO DE PERMISSÃO
// ==========================================

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from 'src/components/ui/button'
import { useHasPermission } from 'src/services/auth'
import { useUsuarioCreate } from 'src/services/usuarios'
import { z } from 'zod'

const createUserSchema = z.object({
	name: z.string().min(1, 'Nome é obrigatório'),
	email: z.string().email('Email inválido'),
	password: z.string().min(6, 'Senha deve ter 6+ caracteres'),
})

export function CreateUserForm() {
	const canCreate = useHasPermission('users:create')
	const { mutateAsync: create, isPending } = useUsuarioCreate()
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm({
		resolver: zodResolver(createUserSchema),
	})

	if (!canCreate) {
		return <p className="text-red-600">Sem permissão para criar usuários</p>
	}

	const onSubmit = async (data) => {
		try {
			await create(data)
		} catch (error) {
			console.error('Erro ao criar:', error)
		}
	}

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<input {...register('name')} placeholder="Nome" />
			{errors.name && <p className="text-red-600">{errors.name.message}</p>}

			<input {...register('email')} type="email" placeholder="Email" />
			{errors.email && <p className="text-red-600">{errors.email.message}</p>}

			<input {...register('password')} type="password" placeholder="Senha" />
			{errors.password && (
				<p className="text-red-600">{errors.password.message}</p>
			)}

			<Button type="submit" disabled={isPending}>
				{isPending ? 'Criando...' : 'Criar'}
			</Button>
		</form>
	)
}

// ==========================================
// 5. COMPONENTE COM MÚLTIPLAS PERMISSÕES
// ==========================================

import { useHasPermission } from 'src/services/auth'

export function DataTable({ data }) {
	// Qualquer uma das permissões
	const canViewDetails = useHasPermission(['users:read', 'users:export'])

	// Todas as permissões
	const canManageAll = useHasPermission(['users:create', 'users:delete'])

	// Wildcard
	const isSuperAdmin = useHasPermission('*')

	return (
		<div>
			{canViewDetails && <p>Pode visualizar detalhes</p>}
			{canManageAll && <p>Pode gerenciar totalmente</p>}
			{isSuperAdmin && <p>Super admin com acesso a tudo</p>}
		</div>
	)
}

// ==========================================
// 6. NAVBAR COM MENU DINÂMICO
// ==========================================

import { Link } from 'react-router'
import { useAuth } from 'src/contexts/auth-context'
import { useHasPermission, useLogout } from 'src/services/auth'

export function NavBar() {
	const { session } = useAuth()
	const { mutate: logout } = useLogout()
	const canViewUsers = useHasPermission('users:read')
	const canViewRoles = useHasPermission('roles:read')
	const canViewPerms = useHasPermission('permissions:read')

	return (
		<nav className="flex justify-between items-center p-4 bg-gray-900 text-white">
			<div className="flex gap-6">
				<Link to="/">Home</Link>

				{canViewUsers && <Link to="/usuarios">Usuários</Link>}
				{canViewRoles && <Link to="/roles">Roles</Link>}
				{canViewPerms && <Link to="/permissions">Permissões</Link>}
			</div>

			<div className="flex items-center gap-4">
				<span>{session?.user?.name}</span>
				<button
					onClick={() => logout()}
					className="px-3 py-1 bg-red-600 rounded hover:bg-red-700"
				>
					Logout
				</button>
			</div>
		</nav>
	)
}

// ==========================================
// 7. CARD COM AÇÃO CONDICIONAL
// ==========================================

import { Card, CardContent, CardHeader } from 'src/components/ui/card'
import { useHasPermission } from 'src/services/auth'

export function UsuarioCard({ usuario }) {
	const canUpdate = useHasPermission('users:update')
	const canDelete = useHasPermission('users:delete')

	return (
		<Card>
			<CardHeader>
				<h3>{usuario.name}</h3>
			</CardHeader>
			<CardContent>
				<p>{usuario.email}</p>
				<div className="mt-4 flex gap-2">
					{canUpdate && (
						<button className="px-3 py-1 bg-blue-600 text-white rounded">
							Editar
						</button>
					)}
					{canDelete && (
						<button className="px-3 py-1 bg-red-600 text-white rounded">
							Deletar
						</button>
					)}
				</div>
			</CardContent>
		</Card>
	)
}

// ==========================================
// 8. MODAL COM VALIDAÇÃO DE PERMISSÃO
// ==========================================

import { useState } from 'react'
import { useHasPermission } from 'src/services/auth'

export function DeleteConfirmModal({ user, onConfirm, isOpen, onClose }) {
	const canDelete = useHasPermission('users:delete')

	if (!isOpen) return null

	if (!canDelete) {
		return (
			<div className="fixed inset-0 bg-black/50 flex items-center justify-center">
				<div className="bg-white rounded-lg p-4">
					<p className="text-red-600">Sem permissão para deletar</p>
					<button onClick={onClose}>Fechar</button>
				</div>
			</div>
		)
	}

	return (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center">
			<div className="bg-white rounded-lg p-4">
				<p>Tem certeza que deseja deletar {user.name}?</p>
				<div className="flex gap-2 mt-4">
					<button
						onClick={() => {
							onConfirm()
							onClose()
						}}
						className="px-4 py-2 bg-red-600 text-white rounded"
					>
						Deletar
					</button>
					<button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">
						Cancelar
					</button>
				</div>
			</div>
		</div>
	)
}

// ==========================================
// 9. HOOK CUSTOMIZADO - useCanAccess
// ==========================================

import { useHasPermission, useHasRole } from 'src/services/auth'

/**
 * Hook customizado para verificar múltiplos critérios
 * @param {{ permissions?, roles?, requireAll? }} options
 * @returns {boolean}
 */
export function useCanAccess({ permissions, roles, requireAll = false }) {
	const permArray = Array.isArray(permissions)
		? permissions
		: [permissions].filter(Boolean)
	const roleArray = Array.isArray(roles) ? roles : [roles].filter(Boolean)

	const hasPerms = permArray.length === 0 || useHasPermission(permArray)
	const hasRoles = roleArray.length === 0 || useHasRole(roleArray)

	if (requireAll) {
		return hasPerms && hasRoles
	}

	return hasPerms || hasRoles
}

// Uso:
// const canAccess = useCanAccess({ permissions: 'users:create', roles: 'ADMIN' })

// ==========================================
// 10. LOADING STATE COM AUTENTICAÇÃO
// ==========================================

import { useAuth } from 'src/contexts/auth-context'
import { useSession } from 'src/services/auth'

export function ProtectedComponent() {
	const { isAuthenticated, isReady } = useAuth()
	const { data: session, isLoading } = useSession()

	if (!isReady) {
		return <p>Inicializando...</p>
	}

	if (!isAuthenticated) {
		return <p>Não autenticado</p>
	}

	if (isLoading) {
		return <p>Carregando dados do usuário...</p>
	}

	return (
		<div>
			<h1>Bem-vindo, {session?.user?.name}</h1>
		</div>
	)
}

// ==========================================
// 11. INTEGRAÇÃO COM REACT HOOK FORM
// ==========================================

import { Controller, useForm } from 'react-hook-form'
import { Button } from 'src/components/ui/button'
import { useHasPermission } from 'src/services/auth'

export function UserFormWithPermissions() {
	const { control, handleSubmit } = useForm()
	const canEditEmail = useHasPermission('users:update:email')
	const canEditRole = useHasPermission('users:update:role')

	const onSubmit = (data) => {
		console.log(data)
	}

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<Controller
				name="name"
				control={control}
				render={({ field }) => <input {...field} placeholder="Nome" />}
			/>

			{canEditEmail && (
				<Controller
					name="email"
					control={control}
					render={({ field }) => (
						<input {...field} type="email" placeholder="Email" />
					)}
				/>
			)}

			{canEditRole && (
				<Controller
					name="role"
					control={control}
					render={({ field }) => (
						<select {...field}>
							<option>USER</option>
							<option>ADMIN</option>
						</select>
					)}
				/>
			)}

			<Button type="submit">Salvar</Button>
		</form>
	)
}

// ==========================================
// 12. COMPONENTE COM FALLBACK
// ==========================================

import { useHasPermission } from 'src/services/auth'

export function FeatureWithFallback() {
	const hasAccess = useHasPermission('premium:feature')

	if (!hasAccess) {
		return (
			<div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
				<h3>Feature Premium</h3>
				<p className="text-blue-700">
					Você não tem acesso a este recurso. Atualize sua conta!
				</p>
				<button className="mt-2 px-4 py-2 bg-blue-600 text-white rounded">
					Atualizar
				</button>
			</div>
		)
	}

	return <div>{/* Conteúdo premium */}</div>
}

export default {}
