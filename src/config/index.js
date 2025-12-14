import { z } from 'zod'

const envSchema = z.object({
	VITE_APP_NAME: z.string().min(1, 'A variável VITE_APP_NAME é obrigatória.'),
})

const _env = envSchema.safeParse(import.meta.env)

if (!_env.success) {
	console.error('❌ Variáveis de ambiente inválidas:', _env.error.format())
	throw new Error(
		'As variáveis de ambiente não foram validadas pelo Zod. Verifique o console.',
	)
}

const envData = _env.data

export const settings = {
	appName: envData.VITE_APP_NAME,
	APP_NAME: envData.VITE_APP_NAME,
}

export const env = envData
