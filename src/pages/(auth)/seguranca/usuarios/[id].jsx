import { useParams, useNavigate } from 'react-router'
import { useState, useEffect, useMemo } from 'react'
import { Save, User, Shield, ChevronLeft, Key, X } from 'lucide-react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
	useUsuario, 
	useUsuarioCreate, 
	useUsuarioUpdate,
	useUsuarioAssignRole,
	useUsuarioRemoveRole
} from 'src/services/usuarios'
import { useRolesListAll } from 'src/services/roles'
import { Button } from 'src/components/ui/button'
import { Input } from 'src/components/ui/input'
import { Label } from 'src/components/ui/label'
import { Switch } from 'src/components/ui/switch'
import { Checkbox } from 'src/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from 'src/components/ui/card'
import { Badge } from 'src/components/ui/badge'
import { toast } from 'src/lib/toast'
import { cn } from 'src/lib/utils'
import { useHeaderConfig } from 'src/hooks/use-header-config'

// =========================
// SCHEMA ZOD
// =========================
const usuarioFormSchema = z.object({
	name: z.string()
		.min(1, 'Nome é obrigatório')
		.min(3, 'Nome deve ter no mínimo 3 caracteres')
		.max(90, 'Nome não pode ter mais de 90 caracteres'),
	login: z.string()
		.min(1, 'Login é obrigatório')
		.min(3, 'Login deve ter no mínimo 3 caracteres')
		.max(90, 'Login não pode ter mais de 90 caracteres')
		.regex(/^[a-zA-Z0-9._-]+$/, 'Login deve conter apenas letras, números, ponto, hífen ou underline'),
	email: z.string()
		.min(1, 'Email é obrigatório')
		.email('Email inválido')
		.max(200, 'Email não pode ter mais de 200 caracteres'),
	password_hash: z.string()
		.min(6, 'Senha deve ter no mínimo 6 caracteres')
		.optional()
		.or(z.literal('')),
	active: z.boolean().default(true),
	roleIds: z.array(z.string())
		.optional()
		.default([])
}).refine((data) => {
	// Senha é obrigatória apenas na criação
	// Se já tem um ID (edição), a senha é opcional
	return true
}, {
	message: 'Senha é obrigatória',
	path: ['password_hash']
})

const UsuarioDetailsPage = () => {
	const { id } = useParams()
	const navigate = useNavigate()
	const isEditing = id !== 'novo'

	useHeaderConfig({
		breadcrumbs: [
			{ label: 'Segurança', href: '/' },
			{ label: 'Usuários', href: '/seguranca/usuarios' },
			{ label: isEditing ? 'Editar Usuário' : 'Novo Usuário' }
		],
		showSearch: false,
	})

	// Setup React Hook Form
	const {
		register,
		control,
		handleSubmit,
		formState: { errors, isSubmitting },
		watch,
		setValue,
		reset,
	} = useForm({
		resolver: zodResolver(usuarioFormSchema),
		defaultValues: {
			name: '',
			login: '',
			email: '',
			password_hash: '',
			active: true,
			roleIds: [],
		}
	})

	const selectedRoles = watch('roleIds')

	// Buscar dados do usuário (se estiver editando)
	const { data: usuarioData, isLoading: isLoadingUsuario } = useUsuario(
		id,
		{ enabled: isEditing }
	)

	// Buscar todas as roles
	const { data: rolesData, isLoading: isLoadingRoles } = useRolesListAll()

	// Mutations
	const createMutation = useUsuarioCreate()
	const updateMutation = useUsuarioUpdate()
	const assignRoleMutation = useUsuarioAssignRole()
	const removeRoleMutation = useUsuarioRemoveRole()

	// State para rastrear roles originais e mudanças
	const [originalRoleIds, setOriginalRoleIds] = useState([])
	const [rolesToAdd, setRolesToAdd] = useState([])
	const [rolesToRemove, setRolesToRemove] = useState([])

	// Preencher formulário ao carregar o usuário
	useEffect(() => {
		if (usuarioData) {
			const roleIds = usuarioData.userRoles?.map(ur => ur.role.id) || []
			setOriginalRoleIds(roleIds)
			
			reset({
				name: usuarioData.name || '',
				login: usuarioData.login || '',
				email: usuarioData.email || '',
				password_hash: '', // Senha sempre vazia na edição
				active: usuarioData.active ?? true,
				roleIds: roleIds
			})
		}
	}, [usuarioData, reset])

	// Toggle de uma role específica
	const handleToggleRole = (roleId) => {
		const newSelected = [...selectedRoles]
		
		const idx = newSelected.indexOf(roleId)
		if (idx > -1) {
			newSelected.splice(idx, 1)
		} else {
			newSelected.push(roleId)
		}
		
		setValue('roleIds', newSelected)
		
		// Rastrear mudanças para salvar depois
		if (isEditing) {
			const added = newSelected.filter(id => !originalRoleIds.includes(id))
			const removed = originalRoleIds.filter(id => !newSelected.includes(id))
			setRolesToAdd(added)
			setRolesToRemove(removed)
		}
	}

	// Remover role
	const handleRemoveRole = (roleId) => {
		const newSelected = selectedRoles.filter(id => id !== roleId)
		setValue('roleIds', newSelected)
		
		// Rastrear mudanças para salvar depois
		if (isEditing) {
			const added = newSelected.filter(id => !originalRoleIds.includes(id))
			const removed = originalRoleIds.filter(id => !newSelected.includes(id))
			setRolesToAdd(added)
			setRolesToRemove(removed)
		}
	}

	// Submeter formulário
	const onSubmit = async (data) => {
		try {
			// Preparar dados
			const payload = {
				name: data.name,
				login: data.login,
				email: data.email,
				active: data.active,
			}

			// Adicionar senha apenas se preenchida
			if (data.password_hash && data.password_hash.trim() !== '') {
				payload.password_hash = data.password_hash
			} else if (!isEditing) {
				// Se for criação e não tem senha, exigir
				toast.error('Senha é obrigatória para criar um novo usuário')
				return
			}

			if (isEditing) {
				// Atualizar usuário
				await updateMutation.mutateAsync({ id, data: payload })
				
				// Atualizar roles - adicionar novas
				for (const roleId of rolesToAdd) {
					await assignRoleMutation.mutateAsync({ userId: id, roleId })
				}
				
				// Atualizar roles - remover antigas
				for (const roleId of rolesToRemove) {
					await removeRoleMutation.mutateAsync({ userId: id, roleId })
				}
				
				toast.success('Usuário atualizado com sucesso!')
				navigate('/seguranca/usuarios')
			} else {
				// Criar usuário
				const newUser = await createMutation.mutateAsync(payload)
				
				// Atribuir roles ao novo usuário
				if (data.roleIds.length > 0) {
					for (const roleId of data.roleIds) {
						await assignRoleMutation.mutateAsync({ userId: newUser.id, roleId })
					}
				}
				
				toast.success('Usuário criado com sucesso!')
				navigate('/seguranca/usuarios')
			}
		} catch (error) {
			toast.error(error.response?.data?.error || 'Erro ao salvar usuário')
		}
	}

	const isLoading = isLoadingUsuario || isLoadingRoles

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-96">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
			</div>
		)
	}

	// Roles disponíveis para seleção
	const availableRoles = rolesData?.data?.filter(role => !selectedRoles.includes(role.id)) || []
	const assignedRolesData = rolesData?.data?.filter(role => selectedRoles.includes(role.id)) || []

	return (
		<div className="min-h-screen gap-4 p-4 py-8">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				{/* Breadcrumb/Voltar */}
				<Button
					variant="ghost"
					className="mb-6 -ml-2"
					onClick={() => navigate('/seguranca/usuarios')}
				>
					<ChevronLeft className="h-4 w-4 mr-2" />
					Voltar para Usuários
				</Button>

				<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
					
					{/* Card de Informações Básicas */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<User className="h-5 w-5 text-primary" />
								{isEditing ? 'Alterar usuário' : 'Criar novo usuário'}
							</CardTitle>
							<CardDescription>
								Informações básicas do usuário
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-6">
							{/* Nome */}
							<div className="space-y-2">
								<Label htmlFor="name">Nome Completo *</Label>
								<Input
									id="name"
									{...register('name')}
									placeholder="Ex: João da Silva"
									className={cn(
										errors.name && 'border-destructive focus-visible:ring-destructive'
									)}
								/>
								{errors.name && (
									<p className="text-xs text-destructive mt-1">{errors.name.message}</p>
								)}
							</div>

							{/* Login e Email em Grid */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								{/* Login */}
								<div className="space-y-2">
									<Label htmlFor="login">Login *</Label>
									<Input
										id="login"
										{...register('login')}
										placeholder="Ex: joao.silva"
										className={cn(
											errors.login && 'border-destructive focus-visible:ring-destructive'
										)}
									/>
									{errors.login && (
										<p className="text-xs text-destructive mt-1">{errors.login.message}</p>
									)}
								</div>

								{/* Email */}
								<div className="space-y-2">
									<Label htmlFor="email">Email *</Label>
									<Input
										id="email"
										type="email"
										{...register('email')}
										placeholder="Ex: joao@empresa.com"
										className={cn(
											errors.email && 'border-destructive focus-visible:ring-destructive'
										)}
									/>
									{errors.email && (
										<p className="text-xs text-destructive mt-1">{errors.email.message}</p>
									)}
								</div>
							</div>

							{/* Senha */}
							<div className="space-y-2">
								<Label htmlFor="password_hash">
									{isEditing ? 'Nova Senha (opcional)' : 'Senha *'}
								</Label>
								<Input
									id="password_hash"
									type="password"
									{...register('password_hash')}
									placeholder={isEditing ? 'Deixe em branco para manter a senha atual' : 'Digite a senha'}
									className={cn(
										errors.password_hash && 'border-destructive focus-visible:ring-destructive'
									)}
								/>
								{errors.password_hash && (
									<p className="text-xs text-destructive mt-1">{errors.password_hash.message}</p>
								)}
								{!errors.password_hash && (
									<p className="text-xs text-muted-foreground">
										{isEditing 
											? 'Preencha apenas se deseja alterar a senha' 
											: 'Mínimo de 6 caracteres'}
									</p>
								)}
							</div>

							{/* Status Toggle */}
							<div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border">
								<div className="flex-1">
									<Label htmlFor="active-toggle" className="text-base font-medium">
										Status
									</Label>
									<p className="text-sm text-muted-foreground mt-1">
										{watch('active') ? '✓ Usuário ativo e disponível' : '⊘ Usuário inativo'}
									</p>
								</div>
								<Controller
									name="active"
									control={control}
									render={({ field }) => (
										<Switch
											id="active-toggle"
											checked={field.value}
											onCheckedChange={field.onChange}
											className="ml-4"
										/>
									)}
								/>
							</div>
						</CardContent>
					</Card>

					{/* Card de Perfis (Roles) */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Shield className="h-5 w-5 text-primary" />
								Perfis de Acesso
							</CardTitle>
							<CardDescription>
								Atribua perfis (roles) para definir as permissões do usuário
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-6">
							{/* Perfis Atribuídos */}
							{assignedRolesData.length > 0 && (
								<div className="space-y-2">
									<Label>Perfis Atribuídos ({assignedRolesData.length})</Label>
									<div className="flex flex-wrap gap-2">
										{assignedRolesData.map(role => (
											<Badge 
												key={role.id} 
												variant="secondary"
												className="pl-3 pr-1 py-1.5 gap-2"
											>
												<span>{role.name}</span>
												<button
													type="button"
													onClick={() => handleRemoveRole(role.id)}
													className="hover:bg-muted rounded-full p-0.5 transition-colors"
												>
													<X className="h-3 w-3" />
												</button>
											</Badge>
										))}
									</div>
								</div>
							)}

							{/* Lista de Perfis Disponíveis */}
							{availableRoles.length > 0 && (
								<div className="space-y-2">
									<Label>Perfis Disponíveis</Label>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
										{availableRoles.map(role => (
											<div
												key={role.id}
												className={cn(
													"flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors",
													"hover:bg-muted/50 hover:border-primary/50"
												)}
												onClick={() => handleToggleRole(role.id)}
											>
												<Checkbox
													id={`role-${role.id}`}
													checked={selectedRoles.includes(role.id)}
													onCheckedChange={() => handleToggleRole(role.id)}
													onClick={(e) => e.stopPropagation()}
												/>
												<label
													htmlFor={`role-${role.id}`}
													className="flex-1 cursor-pointer"
												>
													<p className="font-medium text-sm">{role.name}</p>
													<p className="text-xs text-muted-foreground">
														{role.rolePermissions?.length || 0} permissões
													</p>
												</label>
											</div>
										))}
									</div>
								</div>
							)}

							{/* Mensagem quando não há roles */}
							{availableRoles.length === 0 && assignedRolesData.length === 0 && (
								<div className="text-center py-8 text-muted-foreground">
									<Shield className="h-12 w-12 mx-auto mb-3 opacity-20" />
									<p>Nenhum perfil disponível</p>
									<p className="text-sm">Cadastre perfis primeiro para atribuir aos usuários</p>
								</div>
							)}

							{/* Info sobre permissões */}
							{assignedRolesData.length > 0 && (
								<div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
									<p className="text-xs text-blue-800">
										💡 As permissões do usuário serão definidas pelos perfis atribuídos
									</p>
								</div>
							)}
						</CardContent>
					</Card>

					{/* Botões de Ação */}
					<div className="flex flex-col sm:flex-row gap-3 pt-4">
						<Button
							type="button"
							variant="outline"
							onClick={() => navigate('/seguranca/usuarios')}
							className="w-full sm:w-auto"
						>
							Cancelar
						</Button>
						<Button
							type="submit"
							disabled={isSubmitting}
							className="w-full sm:w-auto"
						>
							<Save className="h-4 w-4 mr-2" />
							{isSubmitting ? 'Salvando...' : 'Salvar Usuário'}
						</Button>
					</div>
				</form>
			</div>
		</div>
	)
}

export default UsuarioDetailsPage
