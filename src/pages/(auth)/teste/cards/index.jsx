import { Edit, Loader2, Plus, Trash2 } from 'lucide-react'
import { useMemo } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link, useNavigate, useSearchParams } from 'react-router'
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
import { useTableStateFromUrl } from 'src/hooks/use-table-state-from-url'
import { toast } from 'src/lib/toast'
import { useCardsDelete, useCardsList } from 'src/services/cards'

const CardsPage = () => {
	const navigate = useNavigate()
	const [searchParams] = useSearchParams()
	const query = searchParams.get('q') || ''

	// 🚀 Hook para sincronizar paginação com a URL (usado para a query da API)
	const { page, pageSize } = useTableStateFromUrl({ defaultPageSize: 20 })

	const {
		data: cardsData,
		isLoading,
		isFetching,
	} = useCardsList({
		page,
		pageSize,
		term: query,
		fields: ['title', 'description'],
	})

	const deleteMutation = useCardsDelete()

	const deleteConfirmation = useDeleteWithConfirmation(deleteMutation, {
		title: 'Excluir Card',
		getDescription: (card) =>
			`Tem certeza que deseja excluir o card "${card.title}"? Esta ação não pode ser desfeita.`,
		confirmText: 'Sim, excluir',
		cancelText: 'Cancelar',
		onSuccess: () => {
			toast.success('Card excluído com sucesso!')
		},
		onError: (error) => {
			toast.error(`Erro ao excluir: ${error.message}`)
		},
	})

	useHeaderConfig({
		breadcrumbs: [{ label: 'Teste' }, { label: 'Cards' }],
		showSearch: true,
		createPermission: 'cards:create',
		newButtonLabel: 'Novo Card',
		onNewClick: () => navigate('/teste/cards/novo'),
	})

	// Configuração dos headers da tabela
	const headers = useMemo(
		() => [
			{
				label: 'Título',
				field: 'title',
			},
			{
				label: 'Descrição',
				field: 'description',
				type: 'custom',
				render: (value) => {
					if (!value) return <span className="text-muted-foreground">-</span>
					return <div className="max-w-lg whitespace-normal">{value}</div>
				},
			},
			{
				label: 'Criado em',
				field: 'createdAt',
				type: 'date',
			},
		],
		[],
	)

	const actions = useMemo(
		() => [
			{
				label: 'Editar',
				icon: Edit,
				permission: 'cards:update',
				to: (row) => `/teste/cards/${row.id}`,
			},
			{
				label: 'Excluir',
				icon: Trash2,
				permission: 'cards:delete',
				variant: 'destructive',
				onClick: (row) => deleteConfirmation.confirmDelete(row),
			},
		],
		[deleteConfirmation],
	)

	const cards = cardsData?.data || []
	const rowCount = cardsData?.pagination?.rowCount || 0

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-96">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		)
	}

	return (
		<PermissionRoute permission="cards:read">
			<Helmet>
				<title>Cards</title>
			</Helmet>

			<div className="space-y-6 gap-4 p-4">
				{/* Header da Página */}
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold tracking-tight">Cards</h1>
						<p className="text-muted-foreground">
							Gerencie os cards do sistema
						</p>
					</div>
				</div>

				{/* Tabela */}
				<Card>
					<CardHeader>
						<CardTitle>
							Lista de Cards
							{isFetching && (
								<Loader2 className="ml-2 h-4 w-4 animate-spin inline" />
							)}
						</CardTitle>
						<CardDescription>{rowCount} cards cadastrados</CardDescription>
					</CardHeader>
					<CardContent className="overflow-x-auto">
						<GenericTable
							data={cards}
							headers={headers}
							rowActions={actions}
							selectableRows={false}
							pagination={{
								...cardsData?.pagination,
								manageUrlState: true,
							}}
						/>
					</CardContent>
				</Card>
			</div>

			{/* Dialog de confirmação de exclusão */}
			<DeleteConfirmDialog {...deleteConfirmation} />
		</PermissionRoute>
	)
}

export default CardsPage
