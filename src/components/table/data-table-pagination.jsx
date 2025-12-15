import {
	ChevronLeft,
	ChevronRight,
	ChevronsLeft,
	ChevronsRight,
} from 'lucide-react'

import { Button } from 'src/components/ui/button'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from 'src/components/ui/select'

export function DataTablePagination({ 
	pageIndex = 0,
	pageSize = 10,
	pageCount = 0,
	canPreviousPage = false,
	canNextPage = false,
	onPageChange,
	onPageSizeChange,
}) {
	return (
		<div className="flex items-center justify-end px-2">
			
			<div className="flex items-center space-x-6 lg:space-x-8">
				<div className="flex items-center space-x-2">
					<p className="text-sm font-medium">Linhas por página</p>
					<Select
						value={`${pageSize}`}
						onValueChange={(value) => {
							onPageSizeChange?.(Number(value))
						}}
					>
						<SelectTrigger className="h-8 w-[70px]">
							<SelectValue placeholder={pageSize} />
						</SelectTrigger>
						<SelectContent side="top">
							{[5, 10, 20, 30, 40, 50].map((size) => (
								<SelectItem key={size} value={`${size}`}>
									{size}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
				<div className="flex w-[100px] items-center justify-center text-sm font-medium">
					Página {pageIndex + 1} de {pageCount}
				</div>
				<div className="flex items-center space-x-2">
					<Button
						variant="outline"
						className="hidden h-8 w-8 p-0 lg:flex"
						onClick={() => onPageChange?.(0)}
						disabled={!canPreviousPage}
					>
						<span className="sr-only">Ir para primeira página</span>
						<ChevronsLeft className="h-4 w-4" />
					</Button>
					<Button
						variant="outline"
						className="h-8 w-8 p-0"
						onClick={() => onPageChange?.(pageIndex - 1)}
						disabled={!canPreviousPage}
					>
						<span className="sr-only">Ir para página anterior</span>
						<ChevronLeft className="h-4 w-4" />
					</Button>
					<Button
						variant="outline"
						className="h-8 w-8 p-0"
						onClick={() => onPageChange?.(pageIndex + 1)}
						disabled={!canNextPage}
					>
						<span className="sr-only">Ir para próxima página</span>
						<ChevronRight className="h-4 w-4" />
					</Button>
					<Button
						variant="outline"
						className="hidden h-8 w-8 p-0 lg:flex"
						onClick={() => onPageChange?.(pageCount - 1)}
						disabled={!canNextPage}
					>
						<span className="sr-only">Ir para última página</span>
						<ChevronsRight className="h-4 w-4" />
					</Button>
				</div>
			</div>
		</div>
	)
}

