import { Badge } from 'src/components/ui/badge'
import { Checkbox } from 'src/components/ui/checkbox'
import { DataTableRowActions } from './data-table-row-actions'

export const generateColumns = (
	headers,
	rowActions = [],
	selectableRows = false,
) => {
	// 1. Coluna de Seleção (Checkbox) - Opcional
	const columns = []

	if (selectableRows) {
		columns.push({
			id: 'select',
			header: ({ table }) => (
				<Checkbox
					checked={
						table.getIsAllPageRowsSelected() ||
						(table.getIsSomePageRowsSelected() && 'indeterminate')
					}
					onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
					aria-label="Selecionar todos"
				/>
			),
			cell: ({ row }) => (
				<Checkbox
					checked={row.getIsSelected()}
					onCheckedChange={(value) => row.toggleSelected(!!value)}
					aria-label="Selecionar linha"
					disabled={row.original.situacao === 'ABERTA'} // Mantendo sua lógica legado
				/>
			),
			enableSorting: false,
			enableHiding: false,
		})
	}

	// 2. Mapeamento dos Headers Genéricos
	headers.forEach((h) => {
		columns.push({
			accessorKey: h.field, // 'nome', 'usuario.email', etc
			header: h.label,
			cell: ({ row }) => {
				const value = h.complex
					? row.original[h.field]?.[h.complex]
					: row.original[h.field]

				// Renderização customizada baseada no type
				if (h.type === 'boolean') {
					return (
						<Badge
							variant={value ? 'default' : 'secondary'}
							className={value ? 'bg-[#2f7d23]' : ''}
						>
							{value ? 'Sim' : 'Não'}
						</Badge>
					)
				}

				if (h.type === 'date') {
					return new Date(value).toLocaleDateString('pt-BR')
				}

				return <div className={h.className}>{value}</div>
			},
		})
	})

	// 3. Coluna de Ações (Dropdown)
	if (rowActions.length > 0) {
		columns.push({
			id: 'actions',
			enableHiding: false,
			cell: ({ row }) => (
				<DataTableRowActions row={row.original} actions={rowActions} />
			),
		})
	}

	return columns
}
