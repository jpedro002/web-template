import { Edit, Plus, Loader2, Trash2 } from 'lucide-react'
import { Link, useNavigate } from 'react-router'
import { useMemo } from 'react'
import { Helmet } from 'react-helmet-async'
import { GenericTable } from 'src/components/table/table'
import { Button } from 'src/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from 'src/components/ui/card'
import { useUsuariosList, useUsuarioDelete } from 'src/services/usuarios'
import { useHeaderConfig } from 'src/hooks/use-header-config'
import { useDeleteWithConfirmation } from 'src/hooks/use-delete-with-confirmation'
import { DeleteConfirmDialog } from 'src/components/delete-confirm-dialog'
import { toast } from 'src/lib/toast'
import { useHasPermission } from 'src/services/auth'
import { PermissionRoute } from 'src/components/protected-route'
import { Badge } from 'src/components/ui/badge'

const UsuariosPage = () => {
	const navigate = useNavigate()
	const hasPermissionToCreateUser = useHasPermission('users:create')

	const { data: usuariosData, isLoading, isFetching } = useUsuariosList()

	const deleteMutation = useUsuarioDelete()

	const deleteConfirmation = useDeleteWithConfirmation(deleteMutation, {
		title: 'Excluir Usuário',
		getDescription: (usuario) => 
			`Tem certeza que deseja excluir o usuário "${usuario.name}"? Esta ação não pode ser desfeita.`,
		confirmText: 'Sim, excluir',
		cancelText: 'Cancelar',
		onSuccess: () => {
			toast.success('Usuário excluído com sucesso!')
		},
		onError: (error) => {
			toast.error(`Erro ao excluir: ${error.message}`)
		}
	})

	useHeaderConfig({
		breadcrumbs: [
			{ label: 'Segurança', href: '/' },
			{ label: 'Usuários' }
		],
		showSearch: true,
		createPermission: 'users:create',	
		newButtonLabel: 'Novo Usuário',
		onNewClick: () => navigate('/seguranca/usuarios/novo'),
	})

	// Configuração dos headers da tabela
	const headers = useMemo(() => [
		{ label: 'Nome', field: 'name' },
		{ label: 'Login', field: 'login' },
		{ label: 'Email', field: 'email' },
		{ 
			label: 'Perfis', 
			field: 'rolesCount', 
			className: 'text-center',
			type: 'custom',
			render: (value, row) => (
				<div className="flex gap-1 flex-wrap justify-center">
					{row.userRoles?.slice(0, 2).map((userRole) => (
						<Badge key={userRole.id} variant="secondary" className="text-xs">
							{userRole.role.name}
						</Badge>
					))}
					{row.userRoles?.length > 2 && (
						<Badge variant="outline" className="text-xs">
							+{row.userRoles.length - 2}
						</Badge>
					)}
				</div>
			)
		},
		{ label: 'Ativo', field: 'active', type: 'boolean' },
	], [])

	const actions = useMemo(() => [
		{
			label: 'Editar',
			icon: Edit,
			permission: 'users:update',
			to: (row) => `/seguranca/usuarios/${row.id}`,
		},
		{
			label: 'Excluir',
			icon: Trash2,
			permission: 'users:delete',
			variant: 'destructive',
			onClick: (row) => deleteConfirmation.confirmDelete(row),
		},
	], [deleteConfirmation])

	const usuarios = usuariosData?.data?.map(usuario => ({
		...usuario,
		rolesCount: usuario.userRoles?.length || 0
	})) || []

	const rowCount = usuariosData?.pagination?.rowCount || 0

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-96">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		)
	}

	return (
		<PermissionRoute permission="users:read">
			<Helmet>
				<title>Usuários</title>
			</Helmet>

			<div className="space-y-6">
				{/* Header da Página */}
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold tracking-tight">Usuários</h1>
						<p className="text-muted-foreground">
							Gerencie os usuários e suas permissões do sistema
						</p>
					</div>
					
				</div>

				{/* Tabela */}
				<Card>
					<CardHeader>
						<CardTitle>
							Lista de Usuários
							{isFetching && (
								<Loader2 className="ml-2 h-4 w-4 animate-spin inline" />
							)}
						</CardTitle>
						<CardDescription>
							{rowCount} usuários cadastrados
						</CardDescription>
					</CardHeader>
					<CardContent>
						<GenericTable 
							data={usuarios} 
							headers={headers} 
							rowActions={actions}
							selectableRows={false}
						/>
					</CardContent>
				</Card>
			</div>

			{/* Dialog de confirmação de exclusão */}
			<DeleteConfirmDialog {...deleteConfirmation} />
		</PermissionRoute>
	)
}

export default UsuariosPage
