import { useEffect } from 'react'
import { useLocation } from 'react-router'
import { useAuth } from 'src/contexts/auth-context'

export function PathLogger() {
	const location = useLocation()
        const { isAuthenticated, isReady } = useAuth()
    

	useEffect(() => {
		const fullPath = `${location.pathname}${location.search}${location.hash}`
		console.log(`📍 Navigation: ${fullPath}`)

		// Obter histórico anterior
		const history = JSON.parse(localStorage.getItem('pathHistory') || '[]')

		// Adicionar novo path com timestamp
		history.push({
			path: fullPath,
			timestamp: new Date().toISOString(),
            isAuthenticated, isReady
		})

		// Manter apenas os últimos 50 paths
		if (history.length > 50) {
			history.shift()
		}

		// Salvar no localStorage
		localStorage.setItem('pathHistory', JSON.stringify(history))
	}, [location.pathname, location.search, location.hash])

	return null
}

