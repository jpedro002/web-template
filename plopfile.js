export default function (plop) {
	// ==========================================
	// HELPERS
	// ==========================================
	plop.setHelper('lowercase', (text) => text.toLowerCase())
	plop.setHelper('uppercase', (text) => text.toUpperCase())

	plop.setHelper('camelCase', (text) => {
		return text
			.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) =>
				index === 0 ? word.toLowerCase() : word.toUpperCase(),
			)
			.replace(/\s+/g, '')
	})

	plop.setHelper('pascalCase', (text) => {
		return text
			.replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => word.toUpperCase())
			.replace(/\s+/g, '')
	})

	plop.setHelper('kebabCase', (text) => {
		return text
			.replace(/([a-z])([A-Z])/g, '$1-$2')
			.replace(/\s+/g, '-')
			.toLowerCase()
	})

	plop.setHelper('pluralize', (word) => {
		const irregulars = {
			user: 'users',
			usuario: 'usuarios',
			role: 'roles',
			permission: 'permissions',
			permissao: 'permissoes',
			category: 'categories',
			categoria: 'categorias',
			person: 'people',
			pessoa: 'pessoas',
			produto: 'produtos',
			venda: 'vendas',
		}

		const lower = word.toLowerCase()
		if (irregulars[lower]) return irregulars[lower]

		// Regras para português
		if (lower.endsWith('ão')) return lower.slice(0, -2) + 'ões'
		if (lower.endsWith('al')) return lower.slice(0, -2) + 'ais'
		if (lower.endsWith('el')) return lower.slice(0, -2) + 'éis'
		if (lower.endsWith('ol')) return lower.slice(0, -2) + 'óis'
		if (lower.endsWith('ul')) return lower.slice(0, -2) + 'uis'
		if (lower.endsWith('r') || lower.endsWith('z')) return lower + 'es'
		if (lower.endsWith('s')) return lower // já está no plural

		// Regra padrão
		return lower + 's'
	})

	// ==========================================
	// GENERATOR: SERVICE BASE
	// ==========================================
	plop.setGenerator('service', {
		description: 'Criar um service com base no createBaseService factory',
		prompts: [
			{
				type: 'input',
				name: 'entityName',
				message: 'Nome da entidade (singular, ex: Usuario, Produto, Venda):',
				validate: (value) => {
					if (!value) return 'Nome da entidade é obrigatório'
					return true
				},
			},
			{
				type: 'input',
				name: 'endpoint',
				message: 'Endpoint da API (ex: /seguranca/usuarios, /vendas/produtos):',
				validate: (value) => {
					if (!value) return 'Endpoint é obrigatório'
					if (!value.startsWith('/')) return 'Endpoint deve começar com /'
					return true
				},
			},
			{
				type: 'confirm',
				name: 'addCustomMethods',
				message: 'Adicionar exemplos de métodos customizados?',
				default: false,
			},
		],
		actions: (data) => {
			const actions = []

			// Preparar dados derivados
			const entityCamel = plop.getHelper('camelCase')(data.entityName)
			const entityPascal = plop.getHelper('pascalCase')(data.entityName)
			const entityLower = data.entityName.toLowerCase()
			const entityPlural = plop.getHelper('pluralize')(entityLower)
			const entityPluralCamel = plop.getHelper('camelCase')(entityPlural)

			const templateData = {
				...data,
				entityCamel,
				entityPascal,
				entityLower,
				entityPlural,
				entityPluralCamel,
			}

			// Criar o arquivo de service
			actions.push({
				type: 'add',
				path: 'src/services/{{entityPlural}}.js',
				templateFile: 'plop-templates/service.hbs',
				data: templateData,
			})

			// Mensagem de sucesso
			actions.push(() => {
				return `
✅ Service criado com sucesso!

📁 Arquivo: src/services/${entityPlural}.js

📖 Como usar no componente:

import { 
  use${entityPascal}List,
  use${entityPascal},
  use${entityPascal}Create,
  use${entityPascal}Update,
  use${entityPascal}Delete
} from 'src/services/${entityPlural}'

// Exemplo de uso:
const { data, isLoading } = use${entityPascal}List({ page: 1, pageSize: 10 })
				`
			})

			return actions
		},
	})

	// ==========================================
	// GENERATOR: PÁGINA CRUD COMPLETA
	// ==========================================
	plop.setGenerator('crud-page', {
		description: 'Criar página CRUD completa com tabela + formulário + service',
		prompts: [
			{
				type: 'input',
				name: 'entityName',
				message: 'Nome da entidade (singular, ex: Usuario, Produto):',
				validate: (value) => {
					if (!value) return 'Nome da entidade é obrigatório'
					return true
				},
			},
			{
				type: 'input',
				name: 'endpoint',
				message: 'Endpoint da API (ex: /seguranca/usuarios):',
				validate: (value) => {
					if (!value) return 'Endpoint é obrigatório'
					if (!value.startsWith('/')) return 'Endpoint deve começar com /'
					return true
				},
			},
			{
				type: 'input',
				name: 'routePath',
				message: 'Caminho da rota (ex: admin/usuarios, vendas/produtos):',
				validate: (value) => {
					if (!value) return 'Caminho da rota é obrigatório'
					return true
				},
			},
			{
				type: 'list',
				name: 'layoutType',
				message: 'Tipo de layout:',
				choices: [
					{ name: 'Admin (protegido)', value: 'admin' },
					{ name: 'Público', value: 'public' },
				],
				default: 'admin',
			},
		],
		actions: (data) => {
			const actions = []

			const entityCamel = plop.getHelper('camelCase')(data.entityName)
			const entityPascal = plop.getHelper('pascalCase')(data.entityName)
			const entityLower = data.entityName.toLowerCase()
			const entityPlural = plop.getHelper('pluralize')(entityLower)
			const entityPluralCamel = plop.getHelper('camelCase')(entityPlural)
			const entityKebab = plop.getHelper('kebabCase')(data.entityName)

			const templateData = {
				...data,
				entityCamel,
				entityPascal,
				entityLower,
				entityPlural,
				entityPluralCamel,
				entityKebab,
			}

			// 1. Criar service
			actions.push({
				type: 'add',
				path: 'src/services/{{entityPlural}}.js',
				templateFile: 'plop-templates/service.hbs',
				skipIfExists: true,
				data: templateData,
			})

			// 2. Criar página index (lista)
			actions.push({
				type: 'add',
				path: 'src/pages/(auth)/({{layoutType}})/{{entityPlural}}/index.jsx',
				templateFile: 'plop-templates/page-index.hbs',
				data: templateData,
			})

			// 3. Criar página de detalhe/edição
			actions.push({
				type: 'add',
				path: 'src/pages/(auth)/({{layoutType}})/{{entityPlural}}/[id].jsx',
				templateFile: 'plop-templates/page-detail.hbs',
				data: templateData,
			})

			// 4. Criar arquivo de colunas da tabela
			actions.push({
				type: 'add',
				path: 'src/pages/(auth)/({{layoutType}})/{{entityPlural}}/columns.jsx',
				templateFile: 'plop-templates/columns.hbs',
				data: templateData,
			})

			// Mensagem final
			actions.push(() => {
				return `
✅ CRUD completo criado!

📁 Arquivos criados:
  - src/services/${entityPlural}.js
  - src/pages/(auth)/(${data.layoutType})/${entityPlural}/index.jsx
  - src/pages/(auth)/(${data.layoutType})/${entityPlural}/[id].jsx
  - src/pages/(auth)/(${data.layoutType})/${entityPlural}/columns.jsx

🔗 Rota gerada: /${data.routePath}

⚠️  Não esqueça de:
  1. Adicionar a rota no menu (src/layout/components/app-sidebar.jsx)
  2. Ajustar as colunas da tabela em columns.jsx
  3. Criar o schema de validação se necessário
				`
			})

			return actions
		},
	})
}
