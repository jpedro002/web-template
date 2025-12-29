import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { useHeaderConfig } from 'src/hooks/use-header-config'

/**
 * Dashboard - Tela de Boas-vindas em Construção
 * Com gráficos usando Recharts (Tema Light)
 */
export default function Page() {
	// Ocultar o header da aplicação
	useHeaderConfig({
		breadcrumbs: [],
		showSearch: false,
		showHeader: true,
	})
	// Dados para os gráficos
	const chartData = [
		{ month: 'Jan', usuarios: 400, projetos: 240 },
		{ month: 'Fev', usuarios: 600, projetos: 320 },
		{ month: 'Mar', usuarios: 800, projetos: 480 },
		{ month: 'Abr', usuarios: 1200, projetos: 620 },
		{ month: 'Mai', usuarios: 1400, projetos: 800 },
		{ month: 'Jun', usuarios: 1800, projetos: 950 },
	]

	const pieData = [
		{ name: 'Desenvolvimento', value: 45 },
		{ name: 'Planejamento', value: 25 },
		{ name: 'Testes', value: 20 },
		{ name: 'Documentação', value: 10 },
	]

	const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444']

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50">
			{/* Main Content */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{/* Hero Section */}
				<div className="mb-12">
					<div className="relative bg-gradient-to-r from-blue-500 to-blue-400 rounded-2xl overflow-hidden shadow-xl">
						<div className="absolute inset-0 opacity-10">
							<div className="absolute top-0 right-0 w-96 h-96 bg-slate-900 rounded-full blur-3xl"></div>
						</div>
						<div className="relative px-6 sm:px-8 py-12 sm:py-16 text-center">
							<div className="inline-flex items-center justify-center w-16 h-16 bg-white/30 backdrop-blur rounded-full mb-6 mx-auto">
								<span className="text-4xl">👋</span>
							</div>
							<h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">
								Bem-vindo ao Dashboard
							</h2>
							<p className="text-blue-50 text-lg max-w-2xl mx-auto mb-8">
								Sua plataforma está em construção. Acompanhe o progresso e explore
								as funcionalidades em desenvolvimento.
							</p>
							<div className="flex gap-3 justify-center flex-wrap">
								<button className="px-6 py-2 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition">
									Ver Documentação
								</button>
								<button className="px-6 py-2 bg-blue-400 text-white rounded-lg font-semibold hover:bg-blue-500 transition">
									Explorar
								</button>
							</div>
						</div>
					</div>
				</div>

				{/* Stats Cards */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
					{[
						{ label: 'Usuários Ativos', value: '1,200', icon: '👥', change: '+12%' },
						{ label: 'Projetos', value: '42', icon: '📦', change: '+8%' },
						{ label: 'Tasks Concluídas', value: '891', icon: '✅', change: '+24%' },
						{ label: 'Performance', value: '98%', icon: '⚡', change: '+5%' },
					].map((stat, idx) => (
						<div
							key={idx}
							className="bg-white border border-slate-200 rounded-xl p-6 hover:border-blue-300 hover:shadow-lg transition shadow-sm"
						>
							<div className="flex items-start justify-between mb-4">
								<span className="text-4xl">{stat.icon}</span>
								<span className="text-green-600 text-sm font-semibold">
									{stat.change}
								</span>
							</div>
							<p className="text-slate-600 text-sm mb-1">{stat.label}</p>
							<p className="text-2xl font-bold text-slate-900">{stat.value}</p>
						</div>
					))}
				</div>

				{/* Charts Section */}
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
					{/* Line Chart */}
					<div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
						<h3 className="text-slate-900 font-semibold text-lg mb-6">
							Crescimento de Usuários e Projetos
						</h3>
						<ResponsiveContainer width="100%" height={300}>
							<LineChart data={chartData}>
								<CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
								<XAxis stroke="#64748b" />
								<YAxis stroke="#64748b" />
								<Tooltip
									contentStyle={{
										backgroundColor: '#ffffff',
										border: '1px solid #e2e8f0',
										borderRadius: '8px',
										color: '#000',
									}}
								/>
								<Legend />
								<Line
									type="monotone"
									dataKey="usuarios"
									stroke="#3b82f6"
									strokeWidth={2}
									dot={{ fill: '#3b82f6', r: 5 }}
									activeDot={{ r: 7 }}
									name="Usuários"
								/>
								<Line
									type="monotone"
									dataKey="projetos"
									stroke="#10b981"
									strokeWidth={2}
									dot={{ fill: '#10b981', r: 5 }}
									activeDot={{ r: 7 }}
									name="Projetos"
								/>
							</LineChart>
						</ResponsiveContainer>
					</div>

					{/* Pie Chart */}
					<div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
						<h3 className="text-slate-900 font-semibold text-lg mb-6">
							Distribuição de Tarefas
						</h3>
						<ResponsiveContainer width="100%" height={300}>
							<PieChart>
								<Pie
									data={pieData}
									cx="50%"
									cy="50%"
									labelLine={false}
									outerRadius={80}
									fill="#8884d8"
									dataKey="value"
									label={({ name, value }) => `${name}: ${value}%`}
								>
									{pieData.map((entry, index) => (
										<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
									))}
								</Pie>
								<Tooltip
									contentStyle={{
										backgroundColor: '#ffffff',
										border: '1px solid #e2e8f0',
										borderRadius: '8px',
										color: '#000',
									}}
								/>
							</PieChart>
						</ResponsiveContainer>
					</div>
				</div>

				{/* Bar Chart */}
				<div className="bg-white border border-slate-200 rounded-xl p-6 mb-8 shadow-sm">
					<h3 className="text-slate-900 font-semibold text-lg mb-6">
						Comparativo Mensal
					</h3>
					<ResponsiveContainer width="100%" height={300}>
						<BarChart data={chartData}>
							<CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
							<XAxis stroke="#64748b" />
							<YAxis stroke="#64748b" />
							<Tooltip
								contentStyle={{
									backgroundColor: '#ffffff',
									border: '1px solid #e2e8f0',
									borderRadius: '8px',
									color: '#000',
								}}
							/>
							<Legend />
							<Bar dataKey="usuarios" fill="#3b82f6" radius={[8, 8, 0, 0]} name="Usuários" />
							<Bar dataKey="projetos" fill="#10b981" radius={[8, 8, 0, 0]} name="Projetos" />
						</BarChart>
					</ResponsiveContainer>
				</div>

				{/* Features in Progress */}
				<div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
					<h3 className="text-slate-900 font-semibold text-lg mb-6">
						Funcionalidades em Construção
					</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{[
							{ title: 'Módulo de Autenticação', progress: 85 },
							{ title: 'API REST Completa', progress: 70 },
							{ title: 'Sistema de Permissões (RBAC)', progress: 90 },
							{ title: 'Painel de Análises', progress: 60 },
							{ title: 'Integração de Pagamentos', progress: 45 },
							{ title: 'Mobile App', progress: 30 },
						].map((item, idx) => (
							<div key={idx} className="space-y-2">
								<div className="flex justify-between items-center">
									<p className="text-slate-700">{item.title}</p>
									<span className="text-slate-600 text-sm">{item.progress}%</span>
								</div>
								<div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
									<div
										className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-500"
										style={{ width: `${item.progress}%` }}
									></div>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Footer CTA */}
				<div className="mt-8 bg-gradient-to-r from-slate-100 to-slate-50 border border-slate-300 rounded-xl p-8 text-center shadow-sm">
					<h4 className="text-slate-900 font-semibold text-lg mb-2">
						Quer acompanhar o desenvolvimento?
					</h4>
					<p className="text-slate-600 mb-6">
						Fique atento às atualizações e novas funcionalidades que vêm por aí.
					</p>
					<button className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition shadow-md">
						Inscrever-se para Notificações
					</button>
				</div>
			</div>
		</div>
	)
}
