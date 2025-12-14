import { useState } from 'react'
import Form from '../components/Form/Form'

/**
 * Exemplo completo de uso do Form Component com todas as novas features:
 * - Novos tipos de campos (textarea, radio, checkbox-group, switch)
 * - Lógica condicional (condition)
 * - Sistema de grid (cols)
 * - Validação Zod integrada
 */
const FormExample = () => {
	const [formData, setFormData] = useState(null)

	const fields = [
		// ========== SEÇÃO 1: DADOS PESSOAIS ==========

		// Linha 1: Nome e Email (metade da largura cada)
		{
			name: 'nome',
			label: 'Nome Completo',
			type: 'text',
			required: true,
			cols: 6,
			placeholder: 'Digite seu nome completo',
			minLength: 3,
			maxLength: 100,
		},
		{
			name: 'email',
			label: 'E-mail',
			type: 'email',
			required: true,
			cols: 6,
			placeholder: 'seu@email.com',
			maxLength: 100,
		},

		// Linha 2: Telefone e Data de Nascimento
		{
			name: 'telefone',
			label: 'Telefone',
			type: 'tel',
			required: true,
			cols: 6,
			placeholder: '(00) 00000-0000',
			minLength: 10,
			maxLength: 15,
		},
		{
			name: 'data_nascimento',
			label: 'Data de Nascimento',
			type: 'date',
			required: true,
			cols: 6,
			noFutureDate: true, // Não permite datas futuras
		},

		// ========== SEÇÃO 2: TIPO DE PESSOA ==========

		{
			name: 'tipo_pessoa',
			label: 'Tipo de Pessoa',
			type: 'radio',
			required: true,
			options: [
				{ label: 'Pessoa Física', value: 'PF' },
				{ label: 'Pessoa Jurídica', value: 'PJ' },
			],
			direction: 'horizontal',
			cols: 12,
		},

		// CONDICIONAL: CPF só aparece se tipo_pessoa = 'PF'
		{
			name: 'cpf',
			label: 'CPF',
			type: 'text',
			required: true,
			cols: 6,
			placeholder: '000.000.000-00',
			condition: (values) => values.tipo_pessoa === 'PF',
		},

		// CONDICIONAL: CNPJ e Razão Social só aparecem se tipo_pessoa = 'PJ'
		{
			name: 'cnpj',
			label: 'CNPJ',
			type: 'text',
			required: true,
			cols: 6,
			placeholder: '00.000.000/0000-00',
			condition: (values) => values.tipo_pessoa === 'PJ',
		},
		{
			name: 'razao_social',
			label: 'Razão Social',
			type: 'text',
			required: true,
			cols: 6,
			condition: (values) => values.tipo_pessoa === 'PJ',
		},

		// ========== SEÇÃO 3: ENDEREÇO ==========

		{
			name: 'cep',
			label: 'CEP',
			type: 'text',
			required: true,
			cols: 3,
			placeholder: '00000-000',
			maxLength: 9,
		},
		{
			name: 'endereco',
			label: 'Endereço',
			type: 'text',
			required: true,
			cols: 6,
		},
		{
			name: 'numero',
			label: 'Número',
			type: 'text',
			required: true,
			cols: 3,
		},
		{
			name: 'complemento',
			label: 'Complemento',
			type: 'text',
			cols: 4,
		},
		{
			name: 'bairro',
			label: 'Bairro',
			type: 'text',
			required: true,
			cols: 4,
		},
		{
			name: 'cidade',
			label: 'Cidade',
			type: 'text',
			required: true,
			cols: 4,
		},

		// ========== SEÇÃO 4: INFORMAÇÕES ADICIONAIS ==========

		{
			name: 'observacoes',
			label: 'Observações',
			type: 'textarea',
			rows: 4,
			maxLength: 500,
			cols: 12,
			placeholder: 'Informações adicionais sobre o cadastro...',
		},

		// ========== SEÇÃO 5: PREFERÊNCIAS ==========

		{
			name: 'interesses',
			label: 'Áreas de Interesse',
			type: 'checkbox-group',
			options: [
				{ label: 'Tecnologia', value: 'tech' },
				{ label: 'Negócios', value: 'business' },
				{ label: 'Design', value: 'design' },
				{ label: 'Marketing', value: 'marketing' },
				{ label: 'Educação', value: 'education' },
			],
			direction: 'vertical',
			cols: 6,
		},

		{
			name: 'comunicacao',
			label: 'Formas de Comunicação Preferidas',
			type: 'checkbox-group',
			required: true,
			options: [
				{ label: 'E-mail', value: 'email' },
				{ label: 'SMS', value: 'sms' },
				{ label: 'WhatsApp', value: 'whatsapp' },
				{ label: 'Telefone', value: 'phone' },
			],
			direction: 'vertical',
			cols: 6,
			requiredMessage: 'Selecione pelo menos uma forma de comunicação',
		},

		// ========== SEÇÃO 6: CONFIGURAÇÕES ==========

		{
			name: 'receber_newsletter',
			label: 'Newsletter',
			type: 'switch',
			switchLabel: 'Desejo receber newsletter',
			switchDescription: 'Receba novidades e atualizações por e-mail',
			cols: 6,
		},

		{
			name: 'perfil_publico',
			label: 'Perfil Público',
			type: 'switch',
			switchLabel: 'Tornar meu perfil público',
			switchDescription: 'Seu perfil será visível para outros usuários',
			cols: 6,
		},

		// ========== SEÇÃO 7: TERMOS ==========

		{
			name: 'aceitar_termos',
			label: 'Termos e Condições',
			type: 'switch',
			required: true,
			mustBeTrue: true,
			mustBeTrueMessage: 'Você precisa aceitar os termos para continuar',
			switchLabel: 'Li e aceito os termos de uso e política de privacidade',
			cols: 12,
		},
	]

	const handleSubmit = (data) => {
		console.log('📝 Dados do formulário:', data)
		setFormData(data)

		// Aqui você faria a chamada à API
		// await api.post('/cadastro', data);
	}

	const handleChange = (values) => {
		console.log('🔄 Valores atualizados:', values)
	}

	return (
		<div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-4xl mx-auto">
				<div className="bg-white shadow-sm rounded-lg p-6 sm:p-8">
					<div className="mb-8">
						<h1 className="text-3xl font-bold text-gray-900 mb-2">
							Formulário de Cadastro
						</h1>
						<p className="text-gray-600">
							Exemplo completo com todos os tipos de campos e funcionalidades
						</p>
					</div>

					<Form
						fields={fields}
						onSubmit={handleSubmit}
						onChange={handleChange}
						submitLabel="Finalizar Cadastro"
						showRequiredIndicator={true}
					/>

					{/* Exibir dados submetidos */}
					{formData && (
						<div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
							<h3 className="text-lg font-semibold text-green-900 mb-2">
								✅ Formulário enviado com sucesso!
							</h3>
							<details className="cursor-pointer">
								<summary className="text-green-700 hover:text-green-900">
									Ver dados enviados
								</summary>
								<pre className="mt-2 text-xs bg-white p-4 rounded border overflow-auto">
									{JSON.stringify(formData, null, 2)}
								</pre>
							</details>
						</div>
					)}
				</div>

				{/* Card de explicação das features */}
				<div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
					<h2 className="text-xl font-bold text-blue-900 mb-4">
						💡 Features Demonstradas
					</h2>
					<ul className="space-y-2 text-blue-800">
						<li className="flex items-start">
							<span className="mr-2">✨</span>
							<span>
								<strong>Sistema de Grid:</strong> Campos com diferentes larguras
								usando a prop `cols` (1-12)
							</span>
						</li>
						<li className="flex items-start">
							<span className="mr-2">🔀</span>
							<span>
								<strong>Lógica Condicional:</strong> CPF/CNPJ aparecem baseado
								no tipo de pessoa selecionado
							</span>
						</li>
						<li className="flex items-start">
							<span className="mr-2">📝</span>
							<span>
								<strong>Novos Tipos de Campo:</strong> textarea, radio,
								checkbox-group, switch
							</span>
						</li>
						<li className="flex items-start">
							<span className="mr-2">✅</span>
							<span>
								<strong>Validação Integrada:</strong> Schema Zod gerado
								automaticamente com validações customizadas
							</span>
						</li>
						<li className="flex items-start">
							<span className="mr-2">🎨</span>
							<span>
								<strong>Layout Responsivo:</strong> Grid de 12 colunas se adapta
								a diferentes tamanhos de tela
							</span>
						</li>
					</ul>
				</div>
			</div>
		</div>
	)
}

export default FormExample
