import axios from 'axios'
import { useCallback, useEffect, useRef, useState } from 'react'
import Form from 'src/components/form/Form'
import { toast } from 'src/lib/toast'
import { z } from 'zod'

/**
 * Exemplo Completo de Uso do Form Component
 * - Consome API Rick and Morty para buscar personagem
 * - Formulário com validação completa
 * - Diferentes tipos de campos
 * - Submissão de dados
 */
export default function Page() {
	const formRef = useRef(null)
	const [isLoading, setIsLoading] = useState(false)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [formData, setFormData] = useState(null)
	const [selectedCharacterId, setSelectedCharacterId] = useState(1)

	// ===== 1. SCHEMA DE VALIDAÇÃO COM ZOD =====
	const addressSchema = z.object({
		firstName: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
		lastName: z.string().min(2, 'Sobrenome deve ter pelo menos 2 caracteres'),
		email: z.string().email('E-mail inválido'),
		phone: z.string().min(10, 'Telefone deve ter pelo menos 10 dígitos'),
		species: z.string().min(1, 'Selecione uma espécie'),
		street: z.string().min(1, 'Rua obrigatória'),
		city: z.string().min(1, 'Cidade obrigatória'),
		zipCode: z.string().min(5, 'CEP inválido'),
		country: z.string().min(1, 'Selecione o país'),
		addressType: z.enum(['residencial', 'comercial', 'outro']),
		addressTypeSpecification: z.string().optional(),
		stateBrazil: z.string().optional(),
		stateUS: z.string().optional(),
		companyName: z.string().optional(),
		cnpj: z.string().optional(),
		contactPreference: z.enum(['email', 'phone', 'sms']).optional(),
		birthDate: z
			.date({ required_error: 'Selecione uma data' })
			.optional()
			.nullable(),
		newsletter: z.boolean().default(false),
		agreeTerms: z
			.boolean()
			.refine((val) => val === true, 'Você deve concordar com os termos'),
		favoriteCharacters: z
			.array(z.string())
			.min(1, 'Selecione pelo menos um personagem favorito'),
	})

	// ===== 2. DEFINIÇÃO DOS CAMPOS DO FORM =====
	const formFields = [
		{
			name: 'firstName',
			label: 'Primeiro Nome',
			type: 'text',
			placeholder: 'Ex: Rick',
			required: true,
			cols: 6,
		},
		{
			name: 'lastName',
			label: 'Sobrenome',
			type: 'text',
			placeholder: 'Ex: Sanchez',
			required: true,
			cols: 6,
		},
		{
			name: 'email',
			label: 'E-mail',
			type: 'email',
			placeholder: 'usuario@example.com',
			required: true,
			cols: 12,
		},
		{
			name: 'phone',
			label: 'Telefone',
			type: 'tel',
			placeholder: '(11) 99999-9999',
			required: true,
			cols: 6,
		},
		{
			name: 'birthDate',
			label: 'Data de Nascimento',
			type: 'date',
			required: false,
			cols: 6,
			noFutureDate: true,
		},
		{
			name: 'species',
			label: 'Espécie',
			type: 'select',
			placeholder: 'Selecione uma espécie',
			required: true,
			cols: 6,
			options: [
				{ label: 'Human', value: 'Human' },
				{ label: 'Alien', value: 'Alien' },
				{ label: 'Robot', value: 'Robot' },
				{ label: 'Mythological', value: 'Mythological' },
				{ label: 'Unknown', value: 'Unknown' },
			],
		},
		{
			name: 'country',
			label: 'País',
			type: 'picker',
			placeholder: 'Selecione um país',
			required: true,
			cols: 6,
			options: [
				{ label: 'Brasil', value: 'BR' },
				{ label: 'Estados Unidos', value: 'US' },
				{ label: 'Canadá', value: 'CA' },
				{ label: 'México', value: 'MX' },
			],
		},
		{
			name: 'street',
			label: 'Rua',
			type: 'text',
			placeholder: 'Nome da rua',
			required: true,
			cols: 12,
		},
		{
			name: 'city',
			label: 'Cidade',
			type: 'text',
			placeholder: 'Nome da cidade',
			required: true,
			cols: 6,
		},
		{
			name: 'zipCode',
			label: 'CEP/Código Postal',
			type: 'text',
			placeholder: '12345-000',
			required: true,
			cols: 6,
		},
		{
			name: 'addressType',
			label: 'Tipo de Endereço',
			type: 'radio',
			required: true,
			cols: 12,
			options: [
				{ label: 'Residencial', value: 'residencial' },
				{ label: 'Comercial', value: 'comercial' },
				{ label: 'Outro', value: 'outro' },
			],
		},
		// CAMPO CONDICIONAL: Aparece apenas se addressType === 'outro'
		{
			name: 'addressTypeSpecification',
			label: 'Especificar tipo de endereço',
			type: 'text',
			placeholder: 'Ex: Propriedade rural, Marina, etc',
			required: false,
			cols: 12,
			condition: (values) => values.addressType === 'outro',
		},
		// CAMPO CONDICIONAL: Aparece apenas se country === 'BR'
		{
			name: 'stateBrazil',
			label: 'Estado (UF)',
			type: 'select',
			placeholder: 'Selecione o estado',
			required: false,
			cols: 6,
			condition: (values) => values.country === 'BR',
			options: [
				{ label: 'São Paulo', value: 'SP' },
				{ label: 'Rio de Janeiro', value: 'RJ' },
				{ label: 'Minas Gerais', value: 'MG' },
				{ label: 'Bahia', value: 'BA' },
				{ label: 'Outro', value: 'OTHER' },
			],
		},
		// CAMPO CONDICIONAL: Aparece apenas se country === 'US'
		{
			name: 'stateUS',
			label: 'Estado (State)',
			type: 'select',
			placeholder: 'Selecione o estado',
			required: false,
			cols: 6,
			condition: (values) => values.country === 'US',
			options: [
				{ label: 'California', value: 'CA' },
				{ label: 'Florida', value: 'FL' },
				{ label: 'New York', value: 'NY' },
				{ label: 'Texas', value: 'TX' },
				{ label: 'Outro', value: 'OTHER' },
			],
		},
		// CAMPO CONDICIONAL: Aparece se addressType === 'comercial'
		{
			name: 'companyName',
			label: 'Nome da Empresa',
			type: 'text',
			placeholder: 'Razão social da empresa',
			required: false,
			cols: 6,
			condition: (values) => values.addressType === 'comercial',
		},
		// CAMPO CONDICIONAL: Aparece se addressType === 'comercial'
		{
			name: 'cnpj',
			label: 'CNPJ',
			type: 'text',
			placeholder: '00.000.000/0000-00',
			required: false,
			cols: 6,
			condition: (values) => values.addressType === 'comercial',
		},
		// CAMPO CONDICIONAL: Aparece se agreeTerms === true
		{
			name: 'contactPreference',
			label: 'Preferência de Contato',
			type: 'radio',
			required: true,
			cols: 12,
			condition: (values) => values.agreeTerms === true,
			options: [
				{ label: 'E-mail', value: 'email' },
				{ label: 'Telefone', value: 'phone' },
				{ label: 'SMS', value: 'sms' },
			],
		},
		{
			name: 'favoriteCharacters',
			label: 'Personagens Favoritos',
			type: 'checkbox-group',
			required: true,
			cols: 12,
			options: [
				{ label: 'Rick', value: 'rick' },
				{ label: 'Morty', value: 'morty' },
				{ label: 'Summer', value: 'summer' },
				{ label: 'Jerry', value: 'jerry' },
				{ label: 'Beth', value: 'beth' },
			],
		},
		{
			name: 'newsletter',
			label: 'Receber newsletter',
			description: 'Receba atualizações por e-mail',
			type: 'switch',
			required: false,
			cols: 12,
		},
		{
			name: 'agreeTerms',
			label: 'Concordo com os termos e condições',
			description: 'Você deve concordar para continuar',
			type: 'checkbox',
			required: true,
			cols: 12,
		},
		{
			name: 'searchFavorites',
			label: 'Personagens Favoritos',
			type: 'searchSelect',
			required: false,
			cols: 6,
			multiple: true,
			placeholder: 'Selecione personagens favoritos...',
			searchPlaceholder: 'Buscar personagem...',
			options: [
				{ value: 'rick', label: 'Rick Sanchez' },
				{ value: 'morty', label: 'Morty Smith' },
				{ value: 'summer', label: 'Summer Smith' },
				{ value: 'jerry', label: 'Jerry Smith' },
				{ value: 'beth', label: 'Beth Smith' },
				{ value: 'jessica', label: 'Jessica' },
				{ value: 'birdperson', label: 'Bird Person' },
			],
		},
		{
			name: 'searchStatus',
			label: 'Status do Personagem',
			type: 'searchSelect',
			required: false,
			cols: 6,
			multiple: false,
			placeholder: 'Selecione um status...',
			searchPlaceholder: 'Buscar status...',
			options: [
				{ value: 'alive', label: 'Vivo' },
				{ value: 'dead', label: 'Morto' },
				{ value: 'unknown', label: 'Desconhecido' },
			],
		},
	]

	// ===== 3. BUSCAR DADOS DA API RICK AND MORTY =====
	const fetchCharacterData = useCallback(async (characterId) => {
		try {
			setIsLoading(true)
			const response = await axios.get(
				`https://rickandmortyapi.com/api/character/${characterId}`,
			)

			const character = response.data

			// Extrair coordenadas da URL da localização (fake address)
			const fakeAddress = {
				firstName: character.name.split(' ')[0],
				lastName: character.name.split(' ')[1] || 'Smith',
				email: `${character.name.toLowerCase().replace(' ', '.')}@rickandmorty.com`,
				phone: `(555) ${Math.floor(Math.random() * 9000)}${1000}`,
				species: character.species,
				street: `${Math.floor(Math.random() * 1000)} Main Street`,
				city: 'Dimension C-137',
				zipCode: '12345-000',
				country: 'US',
				addressType: 'residencial',
				newsletter: true,
				agreeTerms: false,
				favoriteCharacters: ['rick', 'morty'],
				birthDate: new Date('1990-01-01'),
			}

			setFormData(fakeAddress)
			toast.success(`Dados de ${character.name} carregados!`)
		} catch (error) {
			toast.error('Erro ao buscar dados da API Rick and Morty')
			console.error(error)
		} finally {
			setIsLoading(false)
		}
	}, [])

	// Carregar dados iniciais
	useEffect(() => {
		fetchCharacterData(selectedCharacterId)
	}, [selectedCharacterId, fetchCharacterData])

	// ===== 4. HANDLERS =====
	const handleFormChange = (values) => {
		console.log('Form alterado:', values)
	}

	const handleFormSubmit = async (values) => {
		try {
			setIsSubmitting(true)
			console.log('Dados do formulário:', values)

			// Simular envio para API
			await new Promise((resolve) => setTimeout(resolve, 1500))

			toast.success('Endereço salvo com sucesso!')
			console.log('Resposta da API:', { success: true, data: values })
		} catch (error) {
			toast.error('Erro ao salvar endereço')
			console.error(error)
		} finally {
			setIsSubmitting(false)
		}
	}

	// ===== 5. RENDER =====
	return (
		<div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 p-2 sm:p-4 md:p-8">
			<div className="max-w-4xl mx-auto">
				{/* Header */}
				<div className="mb-6 sm:mb-8 px-2 sm:px-0">
					<h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
						Cadastro de Endereço
					</h1>
					<p className="text-sm sm:text-base text-slate-600">
						Preencha o formulário com seus dados. Os dados são pré-preenchidos
						com informações da API Rick and Morty.
					</p>
				</div>

				{/* Character Selector */}
				<div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-white rounded-lg border border-slate-200 shadow-sm mx-2 sm:mx-0">
					<p className="block text-xs sm:text-sm font-medium text-slate-700 mb-2 sm:mb-3">
						Selecione um personagem para pré-preencher:
					</p>
					<div className="flex flex-wrap gap-2">
						{[1, 2, 3, 4, 5].map((id) => (
							<button
								type="button"
								key={id}
								onClick={() => setSelectedCharacterId(id)}
								className={`px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-md font-medium transition-all ${
									selectedCharacterId === id
										? 'bg-blue-600 text-white shadow-md'
										: 'bg-slate-100 text-slate-700 hover:bg-slate-200'
								}`}
								disabled={isLoading}
							>
								P{id}
							</button>
						))}
					</div>
				</div>

				{/* Form Container */}
				<div className="bg-white rounded-lg border border-slate-200 shadow-lg p-3 sm:p-4 md:p-6 lg:p-8 mx-2 sm:mx-0">
					{isLoading ? (
						<div className="flex items-center justify-center py-12">
							<div className="text-center">
								<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
								<p className="text-slate-600">Carregando dados...</p>
							</div>
						</div>
					) : (
						<Form
							ref={formRef}
							fields={formFields}
							schema={addressSchema}
							data={formData}
							isLoading={isSubmitting}
							submitLabel="Salvar Endereço"
							showSubmitButton={true}
							onChange={handleFormChange}
							onSubmit={handleFormSubmit}
						/>
					)}
				</div>

				{/* Info Box */}
				<div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg mx-2 sm:mx-0">
					<p className="text-xs sm:text-sm text-blue-800">
						<strong>ℹ️ Dica:</strong> Abra o console do navegador (F12) para ver
						os dados sendo logados em tempo real conforme você digita e submete
						o formulário.
					</p>
				</div>

				{/* ===== SEGUNDO FORMULÁRIO: AUTO-SCHEMA ===== */}
				<div className="mt-8 sm:mt-12">
					<div className="mb-6 sm:mb-8 px-2 sm:px-0">
						<h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
							Formulário com Campos Condicionais (Auto-Schema)
						</h2>
						<p className="text-sm sm:text-base text-slate-600">
							Este formulário demonstra como campos obrigatórios e condicionais
							funcionam. Campos marcados como <strong>required</strong> mas com
							<strong> condition</strong> são tratados como opcionais quando não
							renderizados.
						</p>
					</div>

					<div className="bg-white rounded-lg border border-slate-200 shadow-lg p-3 sm:p-4 md:p-6 lg:p-8 mx-2 sm:mx-0">
						<Form
							fields={[
								{
									name: 'productType',
									label: 'Tipo de Produto',
									type: 'select',
									required: true,
									cols: 12,
									placeholder: 'Selecione um tipo',
									options: [
										{ label: 'Físico', value: 'physical' },
										{ label: 'Digital', value: 'digital' },
										{ label: 'Serviço', value: 'service' },
									],
								},
								{
									name: 'productName',
									label: 'Nome do Produto',
									type: 'text',
									required: true,
									cols: 12,
									placeholder: 'Ex: Notebook Dell XPS 13',
								},
								{
									name: 'productDescription',
									label: 'Descrição',
									type: 'textarea',
									required: false,
									cols: 12,
									placeholder: 'Descreva o produto...',
								},
								// CAMPO CONDICIONAL + REQUIRED
								// Aparece APENAS se productType === 'physical'
								// Mas é marcado como required: true
								// O Form vai considerar como optional porque tem condition
								{
									name: 'weight',
									label: 'Peso (kg)',
									type: 'number',
									required: true,
									cols: 6,
									condition: (values) => values.productType === 'physical',
									placeholder: '0.00',
								},
								{
									name: 'dimensions',
									label: 'Dimensões (cm)',
									type: 'text',
									required: true,
									cols: 6,
									condition: (values) => values.productType === 'physical',
									placeholder: 'Ex: 30x20x10',
								},
								// CAMPO CONDICIONAL + REQUIRED para Digital
								{
									name: 'fileFormat',
									label: 'Formato do Arquivo',
									type: 'select',
									required: true,
									cols: 6,
									condition: (values) => values.productType === 'digital',
									placeholder: 'Selecione o formato',
									options: [
										{ label: 'PDF', value: 'pdf' },
										{ label: 'EPUB', value: 'epub' },
										{ label: 'ZIP', value: 'zip' },
									],
								},
								{
									name: 'downloadUrl',
									label: 'URL de Download',
									type: 'text',
									required: true,
									cols: 6,
									condition: (values) => values.productType === 'digital',
									placeholder: 'https://...',
								},
								// CAMPO CONDICIONAL + REQUIRED para Serviço
								{
									name: 'serviceDuration',
									label: 'Duração (horas)',
									type: 'number',
									required: true,
									cols: 6,
									condition: (values) => values.productType === 'service',
									placeholder: '1',
								},
								{
									name: 'serviceCategory',
									label: 'Categoria do Serviço',
									type: 'select',
									required: true,
									cols: 6,
									condition: (values) => values.productType === 'service',
									placeholder: 'Selecione a categoria',
									options: [
										{ label: 'Consultoria', value: 'consulting' },
										{ label: 'Desenvolvimento', value: 'development' },
										{ label: 'Design', value: 'design' },
									],
								},
								{
									name: 'isActive',
									label: 'Produto Ativo',
									type: 'switch',
									required: false,
									cols: 12,
								},
								{
									name: 'agreePublish',
									label: 'Concordo em publicar este produto',
									type: 'checkbox',
									required: true,
									cols: 12,
								},
							]}
							// SEM schema! O Form vai gerar automaticamente
							isLoading={false}
							submitLabel="Salvar Produto"
							showSubmitButton={true}
							onSubmit={(values) => {
								console.log('Produto salvo:', values)
								toast.success('Produto salvo com sucesso!')
							}}
							onChange={(values) => {
								console.log('Formulário alterado:', values)
							}}
						/>
					</div>

					{/* Info Box para o segundo formulário */}
					<div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-amber-50 border border-amber-200 rounded-lg mx-2 sm:mx-0">
						<p className="text-xs sm:text-sm text-amber-800 mb-2">
							<strong>✨ Como funciona:</strong>
						</p>
						<ul className="text-xs sm:text-sm text-amber-800 space-y-1 list-disc list-inside">
							<li>
								Campos como <strong>weight</strong> e{' '}
								<strong>dimensions</strong> são <strong>required: true</strong>{' '}
								mas só aparecem quando{' '}
								<strong>productType === 'physical'</strong>
							</li>
							<li>
								Quando o campo está escondido, a validação não exige
								preenchimento
							</li>
							<li>
								Se o tipo for alterado para 'Físico', os campos aparecem e
								passam a ser obrigatórios
							</li>
							<li>
								Nenhum schema foi passado ao Form - ele gera automaticamente! 🚀
							</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	)
}
