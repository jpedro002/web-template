import Form from '../src/components/form/Form'

/**
 * CASOS DE USO PRÁTICOS DO FORM COMPONENT
 *
 * Exemplos prontos para copiar e adaptar ao seu projeto
 */

// ============================================
// 1. FORMULÁRIO DE LOGIN
// ============================================
export const LoginForm = ({ onSubmit }) => {
	const fields = [
		{
			name: 'email',
			label: 'E-mail',
			type: 'email',
			required: true,
			cols: 12,
			placeholder: 'seu@email.com',
		},
		{
			name: 'senha',
			label: 'Senha',
			type: 'password',
			required: true,
			cols: 12,
			minLength: 6,
		},
		{
			name: 'lembrar',
			label: 'Lembrar de mim',
			type: 'switch',
			switchLabel: 'Manter conectado',
			cols: 12,
		},
	]

	return <Form fields={fields} onSubmit={onSubmit} submitLabel="Entrar" />
}

// ============================================
// 2. FORMULÁRIO DE CADASTRO DE USUÁRIO
// ============================================
export const CadastroUsuarioForm = ({ onSubmit }) => {
	const fields = [
		{
			name: 'nome',
			label: 'Nome Completo',
			type: 'text',
			required: true,
			cols: 12,
			minLength: 3,
			maxLength: 100,
		},
		{
			name: 'email',
			label: 'E-mail',
			type: 'email',
			required: true,
			cols: 6,
		},
		{
			name: 'telefone',
			label: 'Telefone',
			type: 'tel',
			required: true,
			cols: 6,
			placeholder: '(00) 00000-0000',
		},
		{
			name: 'senha',
			label: 'Senha',
			type: 'password',
			required: true,
			cols: 6,
			minLength: 8,
		},
		{
			name: 'confirmar_senha',
			label: 'Confirmar Senha',
			type: 'password',
			required: true,
			cols: 6,
			minLength: 8,
		},
		{
			name: 'aceitar_termos',
			label: 'Termos',
			type: 'switch',
			required: true,
			mustBeTrue: true,
			mustBeTrueMessage: 'Você precisa aceitar os termos',
			switchLabel: 'Li e aceito os termos de uso',
			cols: 12,
		},
	]

	return <Form fields={fields} onSubmit={onSubmit} submitLabel="Criar Conta" />
}

// ============================================
// 3. FORMULÁRIO DE ENDEREÇO (COM CEP)
// ============================================
export const EnderecoForm = ({ onSubmit }) => {
	const fields = [
		{
			name: 'cep',
			label: 'CEP',
			type: 'text',
			required: true,
			cols: 4,
			maxLength: 9,
			placeholder: '00000-000',
			onChange: async (value, { setValue }) => {
				// Buscar endereço por CEP
				if (value?.length === 9) {
					try {
						const res = await fetch(
							`https://viacep.com.br/ws/${value.replace('-', '')}/json/`,
						)
						const data = await res.json()
						if (!data.erro) {
							setValue('endereco', data.logradouro)
							setValue('bairro', data.bairro)
							setValue('cidade', data.localidade)
							setValue('estado', data.uf)
						}
					} catch (error) {
						console.error('Erro ao buscar CEP:', error)
					}
				}
			},
		},
		{
			name: 'endereco',
			label: 'Endereço',
			type: 'text',
			required: true,
			cols: 8,
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
			cols: 9,
		},
		{
			name: 'bairro',
			label: 'Bairro',
			type: 'text',
			required: true,
			cols: 6,
		},
		{
			name: 'cidade',
			label: 'Cidade',
			type: 'text',
			required: true,
			cols: 4,
		},
		{
			name: 'estado',
			label: 'Estado',
			type: 'text',
			required: true,
			cols: 2,
			maxLength: 2,
			placeholder: 'UF',
		},
	]

	return <Form fields={fields} onSubmit={onSubmit} />
}

// ============================================
// 4. FORMULÁRIO DE PRODUTO/SERVIÇO
// ============================================
export const ProdutoForm = ({ onSubmit }) => {
	const fields = [
		{
			name: 'nome',
			label: 'Nome do Produto',
			type: 'text',
			required: true,
			cols: 8,
		},
		{
			name: 'codigo',
			label: 'Código/SKU',
			type: 'text',
			required: true,
			cols: 4,
		},
		{
			name: 'categoria',
			label: 'Categoria',
			type: 'picker',
			required: true,
			cols: 6,
			options: [
				{ label: 'Eletrônicos', value: 'eletronicos' },
				{ label: 'Roupas', value: 'roupas' },
				{ label: 'Alimentos', value: 'alimentos' },
			],
		},
		{
			name: 'status',
			label: 'Status',
			type: 'radio',
			required: true,
			cols: 6,
			direction: 'horizontal',
			options: [
				{ label: 'Ativo', value: 1 },
				{ label: 'Inativo', value: 0 },
			],
		},
		{
			name: 'preco',
			label: 'Preço',
			type: 'currency',
			required: true,
			cols: 4,
		},
		{
			name: 'estoque',
			label: 'Estoque',
			type: 'number',
			required: true,
			cols: 4,
		},
		{
			name: 'peso',
			label: 'Peso (kg)',
			type: 'number',
			cols: 4,
		},
		{
			name: 'descricao',
			label: 'Descrição',
			type: 'textarea',
			required: true,
			rows: 4,
			maxLength: 500,
			cols: 12,
		},
		{
			name: 'tags',
			label: 'Tags/Palavras-chave',
			type: 'checkbox-group',
			cols: 12,
			options: [
				{ label: 'Novo', value: 'novo' },
				{ label: 'Promoção', value: 'promocao' },
				{ label: 'Destaque', value: 'destaque' },
				{ label: 'Frete Grátis', value: 'frete_gratis' },
			],
		},
	]

	return (
		<Form fields={fields} onSubmit={onSubmit} submitLabel="Salvar Produto" />
	)
}

// ============================================
// 5. FORMULÁRIO DE PEDIDO/VENDA
// ============================================
export const PedidoForm = ({ onSubmit }) => {
	const fields = [
		{
			name: 'cliente',
			label: 'Cliente',
			type: 'searchPicker',
			required: true,
			cols: 8,
			options: [], // Seria carregado de uma API
			placeholder: 'Buscar cliente...',
		},
		{
			name: 'data',
			label: 'Data do Pedido',
			type: 'date',
			required: true,
			cols: 4,
			noFutureDate: false,
		},
		{
			name: 'items',
			label: 'Itens do Pedido',
			type: 'fieldArray',
			required: true,
			minRows: 1,
			cols: 12,
			fields: [
				{
					name: 'produto',
					label: 'Produto',
					type: 'searchPicker',
					required: true,
					options: [], // Seria carregado de uma API
				},
				{
					name: 'quantidade',
					label: 'Quantidade',
					type: 'number',
					required: true,
				},
				{
					name: 'preco_unitario',
					label: 'Preço Unit.',
					type: 'currency',
					required: true,
				},
			],
		},
		{
			name: 'forma_pagamento',
			label: 'Forma de Pagamento',
			type: 'radio',
			required: true,
			cols: 6,
			options: [
				{ label: 'Dinheiro', value: 'dinheiro' },
				{ label: 'Cartão', value: 'cartao' },
				{ label: 'PIX', value: 'pix' },
				{ label: 'Boleto', value: 'boleto' },
			],
		},
		{
			name: 'desconto',
			label: 'Desconto',
			type: 'currency',
			cols: 3,
		},
		{
			name: 'frete',
			label: 'Frete',
			type: 'currency',
			cols: 3,
		},
		{
			name: 'observacoes',
			label: 'Observações',
			type: 'textarea',
			rows: 3,
			cols: 12,
		},
	]

	return (
		<Form fields={fields} onSubmit={onSubmit} submitLabel="Finalizar Pedido" />
	)
}

// ============================================
// 6. FORMULÁRIO DE CONFIGURAÇÕES/PREFERÊNCIAS
// ============================================
export const ConfiguracoesForm = ({ onSubmit, data }) => {
	const fields = [
		{
			name: 'notificacoes_email',
			label: 'E-mail',
			type: 'switch',
			switchLabel: 'Receber notificações por e-mail',
			cols: 6,
		},
		{
			name: 'notificacoes_sms',
			label: 'SMS',
			type: 'switch',
			switchLabel: 'Receber notificações por SMS',
			cols: 6,
		},
		{
			name: 'idioma',
			label: 'Idioma',
			type: 'radio',
			cols: 12,
			direction: 'horizontal',
			options: [
				{ label: '🇧🇷 Português', value: 'pt-BR' },
				{ label: '🇺🇸 English', value: 'en-US' },
				{ label: '🇪🇸 Español', value: 'es-ES' },
			],
		},
		{
			name: 'temas_interesse',
			label: 'Temas de Interesse',
			type: 'checkbox-group',
			cols: 12,
			options: [
				{ label: 'Tecnologia', value: 'tech' },
				{ label: 'Negócios', value: 'business' },
				{ label: 'Educação', value: 'education' },
				{ label: 'Saúde', value: 'health' },
				{ label: 'Entretenimento', value: 'entertainment' },
			],
		},
		{
			name: 'perfil_publico',
			label: 'Privacidade',
			type: 'switch',
			switchLabel: 'Tornar meu perfil público',
			switchDescription: 'Seu perfil será visível para outros usuários',
			cols: 12,
		},
	]

	return (
		<Form
			fields={fields}
			data={data}
			onSubmit={onSubmit}
			submitLabel="Salvar Configurações"
		/>
	)
}

// ============================================
// 7. FORMULÁRIO DE AGENDAMENTO
// ============================================
export const AgendamentoForm = ({ onSubmit }) => {
	const fields = [
		{
			name: 'tipo_servico',
			label: 'Tipo de Serviço',
			type: 'picker',
			required: true,
			cols: 12,
			options: [
				{ label: 'Consulta', value: 'consulta' },
				{ label: 'Exame', value: 'exame' },
				{ label: 'Retorno', value: 'retorno' },
			],
		},
		{
			name: 'profissional',
			label: 'Profissional',
			type: 'searchPicker',
			required: true,
			cols: 6,
			options: [], // Seria carregado de uma API
			condition: (values) => !!values.tipo_servico,
		},
		{
			name: 'especialidade',
			label: 'Especialidade',
			type: 'picker',
			required: true,
			cols: 6,
			options: [
				{ label: 'Clínico Geral', value: 'clinico' },
				{ label: 'Cardiologia', value: 'cardio' },
				{ label: 'Dermatologia', value: 'derma' },
			],
			condition: (values) => values.tipo_servico === 'consulta',
		},
		{
			name: 'data',
			label: 'Data',
			type: 'date',
			required: true,
			cols: 6,
			noFutureDate: false,
		},
		{
			name: 'horario',
			label: 'Horário',
			type: 'picker',
			required: true,
			cols: 6,
			options: [
				{ label: '08:00', value: '08:00' },
				{ label: '09:00', value: '09:00' },
				{ label: '10:00', value: '10:00' },
				{ label: '14:00', value: '14:00' },
				{ label: '15:00', value: '15:00' },
				{ label: '16:00', value: '16:00' },
			],
		},
		{
			name: 'observacoes',
			label: 'Observações',
			type: 'textarea',
			rows: 3,
			cols: 12,
			placeholder: 'Descreva seus sintomas ou motivo da consulta...',
		},
		{
			name: 'primeira_consulta',
			label: 'Primeira Consulta',
			type: 'switch',
			switchLabel: 'É a minha primeira consulta com este profissional',
			cols: 12,
		},
	]

	return <Form fields={fields} onSubmit={onSubmit} submitLabel="Agendar" />
}

// ============================================
// 8. FORMULÁRIO DE FILTROS/PESQUISA
// ============================================
export const FiltrosForm = ({ onSubmit, onReset }) => {
	const fields = [
		{
			name: 'busca',
			label: 'Buscar',
			type: 'text',
			cols: 12,
			placeholder: 'Digite para buscar...',
		},
		{
			name: 'categoria',
			label: 'Categoria',
			type: 'checkbox-group',
			cols: 6,
			options: [
				{ label: 'Eletrônicos', value: 'eletronicos' },
				{ label: 'Roupas', value: 'roupas' },
				{ label: 'Livros', value: 'livros' },
			],
		},
		{
			name: 'preco_min',
			label: 'Preço Mínimo',
			type: 'currency',
			cols: 3,
		},
		{
			name: 'preco_max',
			label: 'Preço Máximo',
			type: 'currency',
			cols: 3,
		},
		{
			name: 'apenas_estoque',
			label: 'Estoque',
			type: 'switch',
			switchLabel: 'Apenas produtos em estoque',
			cols: 12,
		},
		{
			type: 'button',
			label: 'Limpar Filtros',
			onPress: onReset,
			className: 'bg-gray-500',
			cols: 6,
		},
	]

	return (
		<Form
			fields={fields}
			onSubmit={onSubmit}
			submitLabel="Aplicar Filtros"
			showSubmitButton={true}
		/>
	)
}

// ============================================
// 9. FORMULÁRIO DE CONTATO/SUPORTE
// ============================================
export const ContatoForm = ({ onSubmit }) => {
	const fields = [
		{
			name: 'nome',
			label: 'Nome',
			type: 'text',
			required: true,
			cols: 6,
		},
		{
			name: 'email',
			label: 'E-mail',
			type: 'email',
			required: true,
			cols: 6,
		},
		{
			name: 'assunto',
			label: 'Assunto',
			type: 'picker',
			required: true,
			cols: 12,
			options: [
				{ label: 'Dúvida', value: 'duvida' },
				{ label: 'Sugestão', value: 'sugestao' },
				{ label: 'Reclamação', value: 'reclamacao' },
				{ label: 'Outro', value: 'outro' },
			],
		},
		{
			name: 'mensagem',
			label: 'Mensagem',
			type: 'textarea',
			required: true,
			rows: 6,
			maxLength: 1000,
			cols: 12,
			placeholder: 'Descreva sua mensagem...',
		},
		{
			name: 'receber_copia',
			label: 'Cópia',
			type: 'switch',
			switchLabel: 'Receber cópia por e-mail',
			cols: 12,
		},
	]

	return (
		<Form fields={fields} onSubmit={onSubmit} submitLabel="Enviar Mensagem" />
	)
}

// ============================================
// 10. FORMULÁRIO CONDICIONAL COMPLEXO
// ============================================
export const FormularioCondicional = ({ onSubmit }) => {
	const fields = [
		{
			name: 'tipo_cadastro',
			label: 'Tipo de Cadastro',
			type: 'radio',
			required: true,
			direction: 'horizontal',
			cols: 12,
			options: [
				{ label: 'Pessoa Física', value: 'PF' },
				{ label: 'Pessoa Jurídica', value: 'PJ' },
				{ label: 'Estrangeiro', value: 'EST' },
			],
		},

		// Campos para Pessoa Física
		{
			name: 'cpf',
			label: 'CPF',
			type: 'text',
			required: true,
			cols: 6,
			condition: (values) => values.tipo_cadastro === 'PF',
		},
		{
			name: 'rg',
			label: 'RG',
			type: 'text',
			required: true,
			cols: 6,
			condition: (values) => values.tipo_cadastro === 'PF',
		},

		// Campos para Pessoa Jurídica
		{
			name: 'cnpj',
			label: 'CNPJ',
			type: 'text',
			required: true,
			cols: 6,
			condition: (values) => values.tipo_cadastro === 'PJ',
		},
		{
			name: 'razao_social',
			label: 'Razão Social',
			type: 'text',
			required: true,
			cols: 6,
			condition: (values) => values.tipo_cadastro === 'PJ',
		},
		{
			name: 'inscricao_estadual',
			label: 'Inscrição Estadual',
			type: 'text',
			cols: 6,
			condition: (values) => values.tipo_cadastro === 'PJ',
		},

		// Campos para Estrangeiro
		{
			name: 'passaporte',
			label: 'Passaporte',
			type: 'text',
			required: true,
			cols: 6,
			condition: (values) => values.tipo_cadastro === 'EST',
		},
		{
			name: 'pais_origem',
			label: 'País de Origem',
			type: 'text',
			required: true,
			cols: 6,
			condition: (values) => values.tipo_cadastro === 'EST',
		},

		// Campos comuns a todos
		{
			name: 'email',
			label: 'E-mail',
			type: 'email',
			required: true,
			cols: 6,
		},
		{
			name: 'telefone',
			label: 'Telefone',
			type: 'tel',
			required: true,
			cols: 6,
		},
	]

	return <Form fields={fields} onSubmit={onSubmit} />
}

export default {
	LoginForm,
	CadastroUsuarioForm,
	EnderecoForm,
	ProdutoForm,
	PedidoForm,
	ConfiguracoesForm,
	AgendamentoForm,
	FiltrosForm,
	ContatoForm,
	FormularioCondicional,
}
