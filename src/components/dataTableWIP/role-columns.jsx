import { Edit, Eye, MoreHorizontal, Shield, Trash } from 'lucide-react'
import { Link } from 'react-router'
import { Badge } from 'src/components/ui/badge'
import { Button } from 'src/components/ui/button'
import { Checkbox } from 'src/components/ui/checkbox'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from 'src/components/ui/dropdown-menu'
import { useHasPermission } from 'src/services/auth'

// Componente isolado para Ações da Linha (permite usar hooks)
const RowActions = ({ row, onAction }) => {
	const canEdit = useHasPermission('roles:update')
	const canDelete = useHasPermission('roles:delete')
	const canView = useHasPermission('roles:read')
	const canManagePermissions = useHasPermission('roles:permissions')

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" className="h-8 w-8 p-0">
					<span className="sr-only">Abrir menu</span>
					<MoreHorizontal className="h-4 w-4" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuLabel>Ações</DropdownMenuLabel>
				<DropdownMenuSeparator />

				{canView && (
					<DropdownMenuItem asChild>
						<Link
							to={`/roles/${row.original.id}`}
							className="flex items-center cursor-pointer"
						>
							<Eye className="mr-2 h-4 w-4" /> Detalhes
						</Link>
					</DropdownMenuItem>
				)}

				{canEdit && (
					<DropdownMenuItem onClick={() => onAction('edit', row.original)}>
						<Edit className="mr-2 h-4 w-4" /> Editar
					</DropdownMenuItem>
				)}

				{canManagePermissions && (
					<DropdownMenuItem
						onClick={() => onAction('permissions', row.original)}
					>
						<Shield className="mr-2 h-4 w-4" /> Permissões
					</DropdownMenuItem>
				)}

				{canDelete && (
					<>
						<DropdownMenuSeparator />
						<DropdownMenuItem
							className="text-red-600 focus:text-red-600"
							onClick={() => onAction('delete', row.original)}
						>
							<Trash className="mr-2 h-4 w-4" /> Excluir
						</DropdownMenuItem>
					</>
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	)
}

export const createRoleColumns = (onAction) => [
	{
		id: 'select',
		header: ({ table }) => (
			<Checkbox
				checked={table.getIsAllPageRowsSelected()}
				onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
				aria-label="Selecionar todos"
			/>
		),
		cell: ({ row }) => (
			<Checkbox
				checked={row.getIsSelected()}
				onCheckedChange={(value) => row.toggleSelected(!!value)}
				aria-label="Selecionar linha"
			/>
		),
		enableSorting: false,
		enableHiding: false,
	},
	{
		accessorKey: 'nome',
		header: 'Nome',
		cell: ({ row }) => (
			<div className="font-medium">{row.getValue('nome')}</div>
		),
	},
	{
		accessorKey: 'descricao',
		header: 'Descrição',
		cell: ({ row }) => (
			<div className="text-sm text-muted-foreground max-w-[300px] truncate">
				{row.getValue('descricao')}
			</div>
		),
	},
	{
		accessorKey: 'permissoes',
		header: 'Permissões',
		cell: ({ row }) => {
			const permissoes = row.getValue('permissoes') || []
			return (
				<div className="flex items-center gap-1">
					<Badge variant="secondary">{permissoes.length}</Badge>
					<span className="text-xs text-muted-foreground">
						permiss{permissoes.length !== 1 ? 'ões' : 'ão'}
					</span>
				</div>
			)
		},
	},
	{
		accessorKey: 'ativo',
		header: 'Status',
		cell: ({ row }) => {
			const isActive = row.getValue('ativo')
			return (
				<Badge
					variant={isActive ? 'default' : 'secondary'}
					className={
						isActive ? 'bg-[#2f7d23] hover:bg-[#2f7d23]/90' : 'bg-gray-400'
					}
				>
					{isActive ? 'Ativo' : 'Inativo'}
				</Badge>
			)
		},
	},
	{
		id: 'actions',
		cell: ({ row }) => <RowActions row={row} onAction={onAction} />,
	},
]
