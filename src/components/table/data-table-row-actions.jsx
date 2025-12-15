import { MoreHorizontal } from 'lucide-react'
import { Link } from 'react-router'
import { Button } from 'src/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from 'src/components/ui/dropdown-menu'
import { useHasPermission } from 'src/services/auth'

// 1. Sub-componente para validar permissão individualmente
const ActionItem = ({ action, row }) => {
	// Sempre chama o hook no topo, independente da condição
	const hasPermission = useHasPermission(action.permission || '')

	// Verifica se a ação requer permissão e se o usuário tem
	const hasRequiredPermission = !action.permission || hasPermission

	// Verifica lógica de negócio (ex: não editar itens cancelados)
	const isVisible = action.show
		? typeof action.show === 'function'
			? action.show(row)
			: action.show
		: true

	if (!hasRequiredPermission || !isVisible) return null

	// Renderização: Link ou Botão
	const content = (
		<>
			{action.icon && <action.icon className="mr-2 h-4 w-4" />}
			{action.label}
		</>
	)

	const className = action.className || '' // Para cores como text-red-600

	if (action.to) {
		return (
			<DropdownMenuItem asChild className={className}>
				<Link to={typeof action.to === 'function' ? action.to(row) : action.to}>
					{content}
				</Link>
			</DropdownMenuItem>
		)
	}

	return (
		<DropdownMenuItem
			onClick={() => action.onClick?.(row)}
			className={className}
		>
			{content}
		</DropdownMenuItem>
	)
}

// 2. Componente Principal do Dropdown
export function DataTableRowActions({ row, actions }) {
	// Se não houver ações configuradas, não renderiza nada
	if (!actions || actions.length === 0) return null

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
				>
					<MoreHorizontal className="h-4 w-4" />
					<span className="sr-only">Abrir menu</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-[160px]">
				<DropdownMenuLabel>Ações</DropdownMenuLabel>
				<DropdownMenuSeparator />

				{actions.map((action, index) => {
					if (action.separator) {
						return <DropdownMenuSeparator key={index} />
					}
					return <ActionItem key={index} action={action} row={row} />
				})}
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
