import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle2, Key, User } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Button } from 'src/components/ui/button'
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from 'src/components/ui/card'
import { Field, FieldGroup, FieldLabel } from 'src/components/ui/field'
import { Input } from 'src/components/ui/input'
import { cn } from 'src/lib/utils'
import { z } from 'zod'

const loginSchema = z.object({
	login: z.string().min(1, 'O login é obrigatório'),
	password: z.string().min(1, 'A senha é obrigatória'),
})

export function LoginForm({ className, ...props }) {
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm({ resolver: zodResolver(loginSchema) })

	const onSubmit = (data) => {
		// Console log para debug real
		console.log('Dados do formulário:', data)

		// Lógica de máscara da senha (mais robusta)
		const maskedPassword =
			data.password && data.password.length > 2
				? `${data.password.slice(0, 1)}••••••${data.password.slice(-1)}`
				: '••••••'

		toast(
			// 1. O CONTEÚDO (JSX Interno)
			// Removemos bg-white, bordas e sombras daqui.
			// Ele agora é apenas estrutural (layout).
			<div className="flex flex-col gap-3">
				{/* Cabeçalho */}
				<div className="flex items-center gap-2">
					<div className="h-6 w-6 shrink-0 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
						<CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
					</div>
					<span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
						Dados capturados!
					</span>
				</div>

				{/* Corpo dos dados */}
				{/* Como o fundo geral já é Zinc, aqui usamos um tom levemente diferente 
          ou apenas bordas para separar, ou mantemos o bg-white para dar destaque interno.
          Neste exemplo, deixei o fundo interno 'branco' para criar contraste com o fundo 'zinc' da toast */}
				<div className="grid gap-2 rounded-md bg-white dark:bg-zinc-950 p-3 border border-zinc-200 dark:border-zinc-800 shadow-sm">
					{/* Linha: Login */}
					<div className="flex items-center justify-between gap-4 text-sm">
						<div className="flex items-center gap-2 text-zinc-500">
							<User className="w-3.5 h-3.5" />
							<span>Login</span>
						</div>
						<span className="font-medium truncate max-w-[150px] text-zinc-900 dark:text-zinc-100">
							{data.login}
						</span>
					</div>

					<div className="h-px w-full bg-zinc-100 dark:bg-zinc-800" />

					{/* Linha: Senha */}
					<div className="flex items-center justify-between gap-4 text-sm">
						<div className="flex items-center gap-2 text-zinc-500">
							<Key className="w-3.5 h-3.5" />
							<span>Senha</span>
						</div>
						<span className="font-mono text-xs bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-700 dark:text-zinc-300">
							{maskedPassword}
						</span>
					</div>
				</div>
			</div>,

			// 2. AS OPÇÕES (O "Casco" da Toast)
			{
				duration: 5000,
				// AQUI ESTÁ A MÁGICA:
				// !bg-zinc-50: Pinta a toast inteira de Zinc (claro)
				// !border-zinc-200: Define a cor da borda externa
				// A classe default da biblioteca já tem padding (p-4), então não precisamos mexer nisso.
				className: `
        !bg-zinc-50 dark:!bg-zinc-900 
        !border-zinc-200 dark:!border-zinc-800 
        !text-zinc-900 dark:!text-zinc-50
      `,
			},
		)
	}

	return (
		<div className={cn('flex flex-col gap-6', className)} {...props}>
			<Card>
				<CardHeader>
					<CardTitle>Entrar na sua conta</CardTitle>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit(onSubmit)} noValidate>
						<FieldGroup>
							<Field>
								<FieldLabel htmlFor="login">Login</FieldLabel>
								<Input
									id="login"
									type="text"
									placeholder="seu@exemplo.com"
									{...register('login')}
								/>
								{errors.login && (
									<p className="text-sm text-red-600 mt-1">
										{errors.login.message}
									</p>
								)}
							</Field>
							<Field>
								<FieldLabel htmlFor="password">Senha</FieldLabel>
								<Input
									id="password"
									type="password"
									{...register('password')}
								/>
								{errors.password && (
									<p className="text-sm text-red-600 mt-1">
										{errors.password.message}
									</p>
								)}
							</Field>
							<Field>
								<Button type="submit" disabled={isSubmitting}>
									Entrar
								</Button>
							</Field>
						</FieldGroup>
					</form>
				</CardContent>
			</Card>
		</div>
	)
}
