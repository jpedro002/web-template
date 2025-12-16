import { useSuspenseQuery } from '@tanstack/react-query'

const fetchUsers = async () => {
	// Simular requisição bem demorada
	await new Promise((resolve) => setTimeout(resolve, 10000))
	return { message: 'Dados carregados com sucessoa!' }
}

const UsersListContent = () => {
	const { data } = useSuspenseQuery({
		queryKey: ['usuarios', 'list'],
		queryFn: fetchUsers,
		staleTime: 1000 * 20 * 5,
	})

	return (
		<div className="p-6">
			<h1 className="text-2xl font-bold mb-4">Lista de Usuários</h1>
			<p className="text-gray-600">{data.message}</p>
		</div>
	)
}

export default UsersListContent
