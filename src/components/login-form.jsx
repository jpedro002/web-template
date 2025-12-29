import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle2, Key, User } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router'
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
import { useAuth } from 'src/contexts/auth-context'
import { cn } from 'src/lib/utils'
import { useLogin } from 'src/services/auth'
import { z } from 'zod'

const loginSchema = z.object({
	email: z.string().min(1, 'O email é obrigatório'),
	password: z
		.string()
		.min(1, 'A senha é obrigatória')
		.min(6, 'A senha deve ter no mínimo 6 caracteres'),
})

export function LoginForm({ className, ...props }) {
	const navigate = useNavigate()
	const { isAuthenticated } = useAuth()
	const loginMutation = useLogin()

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm({ resolver: zodResolver(loginSchema) })

	// Redirecionar para home após login bem-sucedido
	useEffect(() => {
		if (isAuthenticated) {
			navigate('/')
		}
	}, [isAuthenticated, navigate])

	const onSubmit = async (data) => {
		try {
			await loginMutation.mutateAsync(data)
			// Não navegar aqui, deixar o useEffect fazer
		} catch (error) {
			// Erro já é tratado pelo interceptador, mas podemos adicionar lógica customizada aqui
			console.error('Login error:', error)
		}
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
								<FieldLabel htmlFor="email">Email</FieldLabel>
								<Input
									id="email"
									type="email"
									placeholder="seu@exemplo.com"
									{...register('email')}
									disabled={isSubmitting || loginMutation.isPending}
								/>
								{errors.email && (
									<p className="text-sm text-red-600 mt-1">
										{errors.email.message}
									</p>
								)}
							</Field>
							<Field>
								<FieldLabel htmlFor="password">Senha</FieldLabel>
								<Input
									id="password"
									type="password"
									{...register('password')}
									disabled={isSubmitting || loginMutation.isPending}
								/>
								{errors.password && (
									<p className="text-sm text-red-600 mt-1">
										{errors.password.message}
									</p>
								)}
							</Field>
							<Field>
								<Button
									type="submit"
									disabled={isSubmitting || loginMutation.isPending}
									className="w-full"
								>
									{loginMutation.isPending ? 'Autenticando...' : 'Entrar'}
								</Button>
							</Field>

							{/* Exibir erro se houver */}
							{loginMutation.isError && (
								<div className="p-3 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
									<p className="text-sm text-red-600 dark:text-red-400">
										{loginMutation.error?.response?.data?.message ||
											'Erro ao fazer login. Verifique suas credenciais.'}
									</p>
								</div>
							)}
						</FieldGroup>
					</form>

					{/* Credenciais de teste */}
					<div className="mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-800">
						<p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">
							<strong>Credenciais de teste:</strong>
						</p>
						<div className="grid gap-1 text-xs text-zinc-600 dark:text-zinc-400">
							<p>
								Email:{' '}
								<code className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
									admin@admin.com
								</code>
							</p>
							<p>
								Senha:{' '}
								<code className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
									123456
								</code>
							</p>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
