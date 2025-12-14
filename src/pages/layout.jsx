import { Outlet } from 'react-router'
import { AuthProvider } from 'src/contexts/auth-context'

const layout = () => {
	return (
		<AuthProvider>
			<Outlet />
		</AuthProvider>
	)
}
export default layout
