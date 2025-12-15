import { Edit, Eye, Shield, Trash } from 'lucide-react'
import { GenericTable } from 'src/components/table/table'

export default function ExemploUso() {
	// Dados de exemplo
	const data = [
		{
			id: 1,
			name: 'Admin',
			description: 'Administrador do sistema',
			active: true,
			isSystemRole: true,
		},
		{
			id: 2,
			name: 'User',
			description: 'Usuário comum',
			active: true,
			isSystemRole: false,
		},
		{
			id: 3,
			name: 'Guest',
			description: 'Convidado',
			active: false,
			isSystemRole: false,
		},
	]

	// Configuração dos headers
	const headers = [
		{ label: 'Nome', field: 'name' },
		{ label: 'Descrição', field: 'description', className: 'text-gray-500' },
		{ label: 'Ativo', field: 'active', type: 'boolean' },
	]

	// Configuração das ações via props (com permissões e ícones)
	const actions = [
		{
			label: 'Detalhes',
			icon: Eye,
			permission: 'roles:read',
			to: (row) => `/roles/${row.id}`,
		},
		{
			label: 'Editar',
			icon: Edit,
			permission: 'roles:update',
			onClick: (row) => console.log('Editando', row.id),
		},
		{
			label: 'Permissões',
			icon: Shield,
			permission: 'roles:permissions',
			onClick: (row) => console.log('Gerenciando permissões', row),
		},
		{ separator: true }, // Divisor visual
		{
			label: 'Excluir',
			icon: Trash,
			permission: 'roles:delete',
			className: 'text-red-600 focus:text-red-600', // Estilo destrutivo
			onClick: (row) => console.log('Excluindo', row),
			show: (row) => !row.isSystemRole, // Não deixar excluir roles do sistema
		},
	]

	return (
		<div className="container mx-auto py-10">
			<h1 className="text-2xl font-bold mb-6">
				Exemplo de Uso - Generic Table
			</h1>
			<GenericTable data={data} headers={headers} rowActions={actions} />
		</div>
	)
}
