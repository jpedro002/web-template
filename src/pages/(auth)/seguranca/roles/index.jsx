import { Edit, Plus } from 'lucide-react'
import { useState } from 'react'
import { GenericTable } from 'src/components/table/table'
import { Button } from 'src/components/ui/button'

const RolesPage = () => {
	// Dados de exemplo (em produção, viria de uma API)
	const [roles] = useState([
		{
			id: 1,
			name: 'Administrador',
			description: 'Acesso total ao sistema',
			active: true,
			isSystemRole: true,
			usersCount: 5,
			createdAt: '2024-01-15',
		},
		{
			id: 2,
			name: 'Gerente',
			description: 'Gerencia equipes e projetos',
			active: true,
			isSystemRole: false,
			usersCount: 12,
			createdAt: '2024-02-20',
		},
		{
			id: 3,
			name: 'Operador',
			description: 'Operações do dia a dia',
			active: true,
			isSystemRole: false,
			usersCount: 25,
			createdAt: '2024-03-10',
		},
		{
			id: 4,
			name: 'Visitante',
			description: 'Acesso somente leitura',
			active: false,
			isSystemRole: false,
			usersCount: 3,
			createdAt: '2024-04-05',
		},
	])

	// Configuração dos headers da tabela
	const headers = [
		{ label: 'Nome', field: 'name' },
		{
			label: 'Descrição',
			field: 'description',
			className: 'text-muted-foreground',
		},
		{ label: 'Usuários', field: 'usersCount', className: 'text-center' },
		{ label: 'Criado em', field: 'createdAt', type: 'date' },
		{ label: 'Ativo', field: 'active', type: 'boolean' },
	]

	const actions = [
		{
			label: 'Editar',
			icon: Edit,
			permission: 'roles:update',
			to: (row) => `/roles/${row.id}`,
		},
	]

	return (
		<div className="space-y-6">
			{/* Header da Página */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Roles</h1>
					<p className="text-muted-foreground">
						Gerencie as funções e permissões do sistema
					</p>
				</div>
				<Button>
					<Plus className="mr-2 h-4 w-4" />
					Nova Role
				</Button>
			</div>

			{/* Tabela Genérica */}
			<GenericTable data={roles} headers={headers} rowActions={actions} />
		</div>
	)
}

export default RolesPage
