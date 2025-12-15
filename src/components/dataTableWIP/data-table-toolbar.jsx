import { Plus, X } from 'lucide-react'
import { Link } from 'react-router'
import { Button } from 'src/components/ui/button'
import { Input } from 'src/components/ui/input'

export function DataTableToolbar({
	table,
	novoUrl,
	bulkActions,
	searchPlaceholder = 'Filtrar...',
	searchColumn,
}) {
	const selectedRows = table.getFilteredSelectedRowModel().rows
	const hasSelection = selectedRows.length > 0
	const isFiltered = table.getState().columnFilters.length > 0

	return (
		<div className="flex items-center justify-between">
			<div className="flex flex-1 items-center space-x-2">
				{/* Campo de busca/filtro */}
				{searchColumn && (
					<Input
						placeholder={searchPlaceholder}
						value={table.getColumn(searchColumn)?.getFilterValue() ?? ''}
						onChange={(event) =>
							table.getColumn(searchColumn)?.setFilterValue(event.target.value)
						}
						className="h-8 w-[150px] lg:w-[250px]"
					/>
				)}

				{/* Botão para limpar filtros */}
				{isFiltered && (
					<Button
						variant="ghost"
						onClick={() => table.resetColumnFilters()}
						className="h-8 px-2 lg:px-3"
					>
						Limpar
						<X className="ml-2 h-4 w-4" />
					</Button>
				)}

				{/* Ações em Massa (aparecem só quando tem seleção) */}
				{hasSelection && bulkActions && bulkActions.length > 0 && (
					<div className="flex items-center gap-2 border-l pl-2 ml-2">
						<span className="text-sm text-muted-foreground">
							{selectedRows.length} selecionado{selectedRows.length > 1 && 's'}
						</span>
						{bulkActions.map((action) => (
							<Button
								key={action.id ?? action.label}
								variant="outline"
								size="sm"
								onClick={() =>
									action.onClick(selectedRows.map((r) => r.original))
								}
								className="h-8"
							>
								{action.icon && <action.icon className="mr-2 h-4 w-4" />}
								{action.label}
							</Button>
						))}
					</div>
				)}
			</div>

			<div className="flex items-center space-x-2">
				{novoUrl && (
					<Button
						asChild
						size="sm"
						className="bg-[#2f7d23] hover:bg-[#5e9e4e] h-8"
					>
						<Link to={novoUrl}>
							<Plus className="mr-2 h-4 w-4" />
							Novo
						</Link>
					</Button>
				)}
			</div>
		</div>
	)
}
