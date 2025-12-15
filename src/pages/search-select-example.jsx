import { useState } from 'react'
import { SearchSelect } from 'src/components/ui/search-select'

const SearchSelectExample = () => {
	const [selectedRole, setSelectedRole] = useState(null)
	const [selectedRoles, setSelectedRoles] = useState([])
	const [selectedCountry, setSelectedCountry] = useState(null)

	// Opções de exemplo
	const roleOptions = [
		{ value: 'admin', label: 'Administrador' },
		{ value: 'manager', label: 'Gerente' },
		{ value: 'user', label: 'Usuário' },
		{ value: 'guest', label: 'Visitante' },
	]

	const countryOptions = [
		{ value: 'br', label: 'Brasil' },
		{ value: 'us', label: 'Estados Unidos' },
		{ value: 'mx', label: 'México' },
		{ value: 'ar', label: 'Argentina' },
		{ value: 'cl', label: 'Chile' },
		{ value: 'co', label: 'Colômbia' },
	]

	return (
		<div className="container mx-auto space-y-8 py-10">
			<div>
				<h1 className="text-3xl font-bold mb-2">Exemplos de SearchSelect</h1>
				<p className="text-muted-foreground">
					Componente com busca, seleção simples e múltipla
				</p>
			</div>

			{/* Exemplo 1: Seleção Simples */}
			<div className="space-y-4 rounded-lg border p-6">
				<div>
					<h2 className="text-xl font-semibold">Seleção Simples</h2>
					<p className="text-sm text-muted-foreground">
						Selecione apenas uma opção
					</p>
				</div>

				<div className="max-w-sm">
					<label className="block text-sm font-medium mb-2">
						Selecione uma Role
					</label>
					<SearchSelect
						options={roleOptions}
						value={selectedRole}
						onChange={setSelectedRole}
						placeholder="Escolha uma role..."
						searchPlaceholder="Digite para buscar..."
					/>
				</div>

				{selectedRole && (
					<div className="mt-4 p-3 rounded bg-muted">
						<p className="text-sm">
							<strong>Selecionado:</strong>{' '}
							{roleOptions.find((r) => r.value === selectedRole)?.label}
						</p>
					</div>
				)}
			</div>

			{/* Exemplo 2: Seleção Múltipla */}
			<div className="space-y-4 rounded-lg border p-6">
				<div>
					<h2 className="text-xl font-semibold">Seleção Múltipla</h2>
					<p className="text-sm text-muted-foreground">
						Selecione várias opções (clique para remover)
					</p>
				</div>

				<div className="max-w-sm">
					<label className="block text-sm font-medium mb-2">
						Selecione múltiplas Roles
					</label>
					<SearchSelect
						options={roleOptions}
						value={selectedRoles}
						onChange={setSelectedRoles}
						multiple={true}
						placeholder="Selecione roles..."
						searchPlaceholder="Buscar roles..."
					/>
				</div>

				{selectedRoles.length > 0 && (
					<div className="mt-4 p-3 rounded bg-muted">
						<p className="text-sm font-medium mb-2">Selecionados:</p>
						<ul className="text-sm space-y-1">
							{selectedRoles.map((role) => (
								<li key={role}>
									• {roleOptions.find((r) => r.value === role)?.label}
								</li>
							))}
						</ul>
					</div>
				)}
			</div>

			{/* Exemplo 3: Com mais opções */}
			<div className="space-y-4 rounded-lg border p-6">
				<div>
					<h2 className="text-xl font-semibold">Com Mais Opções</h2>
					<p className="text-sm text-muted-foreground">
						Busque entre vários países
					</p>
				</div>

				<div className="max-w-sm">
					<label className="block text-sm font-medium mb-2">
						Selecione um País
					</label>
					<SearchSelect
						options={countryOptions}
						value={selectedCountry}
						onChange={setSelectedCountry}
						placeholder="Escolha um país..."
						searchPlaceholder="Buscar país..."
					/>
				</div>

				{selectedCountry && (
					<div className="mt-4 p-3 rounded bg-muted">
						<p className="text-sm">
							<strong>País Selecionado:</strong>{' '}
							{countryOptions.find((c) => c.value === selectedCountry)?.label}
						</p>
					</div>
				)}
			</div>

			{/* Documentação */}
			<div className="rounded-lg border p-6 bg-muted/50">
				<h3 className="font-semibold mb-4">Props Disponíveis</h3>
				<div className="space-y-2 text-sm">
					<p>
						<code className="bg-black/10 px-2 py-1 rounded">options</code> -
						Array de objetos com value e label
					</p>
					<p>
						<code className="bg-black/10 px-2 py-1 rounded">value</code> - Valor
						selecionado (string ou array)
					</p>
					<p>
						<code className="bg-black/10 px-2 py-1 rounded">onChange</code> -
						Callback quando valor muda
					</p>
					<p>
						<code className="bg-black/10 px-2 py-1 rounded">multiple</code> - Se
						true, permite múltipla seleção
					</p>
					<p>
						<code className="bg-black/10 px-2 py-1 rounded">placeholder</code> -
						Texto do botão vazio
					</p>
					<p>
						<code className="bg-black/10 px-2 py-1 rounded">
							searchPlaceholder
						</code>{' '}
						- Texto de busca
					</p>
					<p>
						<code className="bg-black/10 px-2 py-1 rounded">disabled</code> -
						Desabilita o componente
					</p>
					<p>
						<code className="bg-black/10 px-2 py-1 rounded">isLoading</code> -
						Mostra estado de carregamento
					</p>
					<p>
						<code className="bg-black/10 px-2 py-1 rounded">onSearch</code> -
						Callback para busca assíncrona
					</p>
				</div>
			</div>
		</div>
	)
}

export default SearchSelectExample
