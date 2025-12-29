import { Loader2 } from 'lucide-react'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from 'src/components/ui/alert-dialog'

/**
 * Componente de diálogo de confirmação para delete com aparência destrutiva
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Estado do dialog
 * @param {Function} props.onOpenChange - Callback para mudança de estado
 * @param {Function} props.handleConfirm - Callback ao confirmar
 * @param {Function} props.handleCancel - Callback ao cancelar
 * @param {Object} props.config - Configurações do dialog
 * @param {string} props.config.title - Título do dialog
 * @param {string} props.config.description - Descrição/mensagem
 * @param {string} props.config.confirmText - Texto do botão confirmar
 * @param {string} props.config.cancelText - Texto do botão cancelar
 * @param {boolean} props.isPending - Estado de loading
 *
 * @example
 * const deleteConfirmation = useDeleteWithConfirmation(deleteMutation)
 *
 * <DeleteConfirmDialog {...deleteConfirmation} />
 */
export function DeleteConfirmDialog({
	isOpen,
	onOpenChange,
	handleConfirm,
	handleCancel,
	config,
	isPending,
}) {
	return (
		<AlertDialog open={isOpen} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>{config.title}</AlertDialogTitle>
					<AlertDialogDescription>{config.description}</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel onClick={handleCancel} disabled={isPending}>
						{config.cancelText}
					</AlertDialogCancel>
					<AlertDialogAction
						onClick={handleConfirm}
						disabled={isPending}
						className="bg-destructive text-white hover:bg-destructive/85 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
						{config.confirmText}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	)
}
