/**
 * Sistema de Toast para notificações
 * Se usar biblioteca como Sonner, adapte aqui
 */

export const toast = {
	success: (message) => {
		console.log('[SUCCESS]', message)
		// Adapte para sua biblioteca de toast favorita:
		// sonner: toast.success(message)
		// react-toastify: Toast.success(message)
		// radix-ui: showToast({ title: message })
	},

	error: (message) => {
		console.error('[ERROR]', message)
		// sonner: toast.error(message)
		// react-toastify: Toast.error(message)
	},

	warning: (message) => {
		console.warn('[WARNING]', message)
		// sonner: toast.warning(message)
	},

	info: (message) => {
		console.info('[INFO]', message)
		// sonner: toast.info(message)
	},
}
