import { ArrowLeft, Home, SearchX } from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router'
import { settings } from 'src/config'

const NotFound = () => {
	// Assumindo que settings.APP_NAME está disponível
	const { APP_NAME } = settings
	const navigate = useNavigate()

	const handleGoHome = () => {
		// Ajuste o caminho conforme a rota principal do seu app
		navigate('/')
	}

	const handleGoBack = () => {
		navigate(-1)
	}

	return (
		// Fundo neutro com gradiente suave
		<main className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 flex items-center justify-center p-4">
			<Helmet>
				<title>{APP_NAME} :: Página Não Encontrada</title>
			</Helmet>

			{/* Container principal */}
			<div className="max-w-2xl mx-auto text-center">
				{/* Card principal */}
				<div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-100">
					{/* Ícone e número 404 */}
					<div className="mb-8">
						<div className="relative inline-block">
							{/* Círculo decorativo de fundo (usando a cor principal sutilmente) */}
							<div className="absolute inset-0 bg-blue-600 rounded-full blur-3xl opacity-10 scale-150"></div>

							{/* Número 404 */}
							<div className="relative">
								<h1 className="text-8xl md:text-9xl font-black bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 bg-clip-text text-transparent leading-none">
									404
								</h1>
							</div>
						</div>
					</div>

					{/* Título */}
					<h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
						Página Não Encontrada
					</h2>

					{/* Descrição */}
					<p className="text-gray-600 text-lg mb-8 leading-relaxed">
						A página que você está procurando não existe ou foi movida.
						<br className="hidden md:block" />
						Por favor, use os botões abaixo para navegar.
					</p>

					{/* Ícone ilustrativo */}
					<div className="mb-8">
						{/* Fundo do ícone em um tom cinza/azul muito claro */}
						<div className="inline-flex items-center justify-center w-24 h-24 bg-blue-50 rounded-full mb-4">
							<SearchX className="w-12 h-12 text-blue-600" />
						</div>
					</div>

					{/* Botões de ação */}
					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						{/* Botão principal - Ir para home (cor principal: azul) */}
						<button
							type="button"
							onClick={handleGoHome}
							className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 active:bg-blue-800 transform hover:scale-[1.02] transition-all duration-200 shadow-lg shadow-blue-500/30"
						>
							<Home className="w-5 h-5 mr-2" />
							Ir para Início
						</button>

						{/* Botão secundário - Voltar (neutro com borda azul) */}
						<button
							type="button"
							onClick={handleGoBack}
							className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl border-2 border-blue-600 hover:bg-blue-600 hover:text-white transform hover:scale-[1.02] transition-all duration-200 shadow-md"
						>
							<ArrowLeft className="w-5 h-5 mr-2" />
							Voltar
						</button>
					</div>

					{/* Elementos decorativos (dots) */}
					<div className="mt-12 flex justify-center space-x-2">
						<div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
						<div
							className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"
							style={{ animationDelay: '0.2s' }}
						></div>
						<div
							className="w-2 h-2 bg-blue-200 rounded-full animate-pulse"
							style={{ animationDelay: '0.4s' }}
						></div>
					</div>
				</div>

				{/* Elementos decorativos de fundo removidos ou simplificados para evitar poluição visual */}
			</div>
		</main>
	)
}

export default NotFound
export { NotFound }
