import { Navigate } from 'react-router'
import { LoginForm } from 'src/components/login-form'
import { useAuth } from 'src/contexts/auth-context'

const Login = () => {
	const { isAuthenticated, isReady } = useAuth()
	

	if (!isReady) {
		return null 
	}

	if (isAuthenticated) {
		return <Navigate to="/" replace />
	}

	return (
		<div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
			<div className="w-full max-w-sm">
				<LoginForm />
			</div>
		</div>
	)
}
export default Login
