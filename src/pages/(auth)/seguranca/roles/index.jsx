import { Edit, Loader2, Plus, Trash2 } from 'lucide-react'
import { useMemo } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link, useNavigate } from 'react-router'
import { DeleteConfirmDialog } from 'src/components/delete-confirm-dialog'
import { PermissionRoute } from 'src/components/protected-route'
import { GenericTable } from 'src/components/table/table'
import { Button } from 'src/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from 'src/components/ui/card'
import { useDeleteWithConfirmation } from 'src/hooks/use-delete-with-confirmation'
import { useHeaderConfig } from 'src/hooks/use-header-config'
import { toast } from 'src/lib/toast'
import { useHasPermission } from 'src/services/auth'
import { useRolesDelete, useRolesList } from 'src/services/roles'

const RolesPage = () => {
	const navigate = useNavigate()

	const hasPermissionToCreateRole = useHasPermission('roles:create')

	// Buscar dados da API
	const { data: rolesData, isLoading, isFetching } = useRolesList()

	// Configurar delete com confirmação
	const deleteMutation = useRolesDelete()

	const deleteConfirmation = useDeleteWithConfirmation(deleteMutation, {
		title: 'Excluir Role',
		getDescription: (role) =>
			`Tem certeza que deseja excluir a role "${role.name}"? Esta ação não pode ser desfeita.`,
		confirmText: 'Sim, excluir',
		cancelText: 'Cancelar',
		onSuccess: () => {
			toast.success('Role excluída com sucesso!')
		},
		onError: (error) => {
			toast.error(`Erro ao excluir: ${error.message}`)
		},
	})

	useHeaderConfig({
		breadcrumbs: [{ label: 'Segurança', href: '/' }, { label: 'Roles' }],
		showSearch: false,
	})

	// Configuração dos headers da tabela
	const headers = useMemo(
		() => [
			{ label: 'Nome', field: 'name' },
			{
				label: 'Permissões',
				field: 'permissionsCount',
				className: 'text-center',
			},
			{ label: 'Ativo', field: 'active', type: 'boolean' },
		],
		[],
	)

	const actions = useMemo(
		() => [
			{
				label: 'Editar',
				icon: Edit,
				permission: 'roles:update',
				to: (row) => `/seguranca/roles/${row.id}`,
			},
			{
				label: 'Excluir',
				icon: Trash2,
				permission: 'roles:delete',
				variant: 'destructive',
				onClick: (row) => deleteConfirmation.confirmDelete(row),
			},
		],
		[deleteConfirmation],
	)

	// Processar dados para a tabela
	const roles =
		rolesData?.data?.map((role) => ({
			...role,
			permissionsCount: role.rolePermissions?.length || 0,
		})) || []

	const rowCount = rolesData?.pagination?.rowCount || 0

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-96">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		)
	}

	return (
		<PermissionRoute permission="roles:read">
			<Helmet>
				<title>Roles</title>
			</Helmet>

			<div className="space-y-6 gap-4 p-4">
				{/* Header da Página */}
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold tracking-tight">Roles</h1>
						<p className="text-muted-foreground">
							Gerencie as funções e permissões do sistema
						</p>
					</div>
					{hasPermissionToCreateRole && (
						<Button asChild>
							<Link to="/seguranca/roles/novo">
								<Plus className="mr-2 h-4 w-4" />
								Nova Role
							</Link>
						</Button>
					)}
				</div>

				{/* Tabela */}
				<Card>
					<CardHeader>
						<CardTitle>
							Lista de Roles
							{isFetching && (
								<Loader2 className="ml-2 h-4 w-4 animate-spin inline" />
							)}
						</CardTitle>
						<CardDescription>{rowCount} roles cadastradas</CardDescription>
					</CardHeader>
					<CardContent>
						<GenericTable
							data={roles}
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

export default RolesPage
