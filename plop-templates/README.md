# 🚀 Guia de Templates Plop

Templates atualizados com base na estrutura moderna do CRUD de Cards.

## 📋 Templates Disponíveis

### 1. **service** - Criar Service
Cria apenas o arquivo de service com hooks React Query

```bash
bun plop service
```

**Prompts:**
- Nome da entidade (ex: Usuario, Produto)
- Endpoint da API (ex: /seguranca/usuarios)
- Adicionar métodos customizados? (sim/não)

**Resultado:**
- `src/services/{entityPlural}.js`

---

### 2. **crud-page** - CRUD Completo
Cria service + páginas de listagem e detalhes

```bash
bun plop crud-page
```

**Prompts:**
- Nome da entidade (ex: Usuario, Produto)
- Endpoint da API (ex: /seguranca/usuarios)
- Caminho da rota (ex: admin/usuarios)

**Resultado:**
- `src/services/{entityPlural}.js`
- `src/pages/(auth)/{routePath}/index.jsx` (Listagem)
- `src/pages/(auth)/{routePath}/[id].jsx` (Criar/Editar)

---

## 🎯 Exemplo Prático

Criar CRUD de Produtos:

```bash
bun plop crud-page
```

Respostas:
1. **Nome da entidade**: Produto
2. **Endpoint da API**: /vendas/produtos
3. **Caminho da rota**: vendas/produtos

Arquivos gerados:
```
src/
├── services/
│   └── produtos.js
└── pages/
    └── (auth)/
        └── vendas/
            └── produtos/
                ├── index.jsx    # Listagem com GenericTable
                └── [id].jsx     # Formulário com Form component
```

---

## ✅ Características dos Templates

### **page-index.hbs** (Listagem)
✨ Recursos incluídos:
- ✅ GenericTable com paginação via URL
- ✅ Busca integrada com useSearchParams
- ✅ Delete com confirmação (DeleteConfirmDialog)
- ✅ useHeaderConfig para breadcrumbs e botão "Novo"
- ✅ PermissionRoute para controle de acesso
- ✅ Actions (Editar/Excluir) com permissões
- ✅ Loading states

### **page-detail.hbs** (Criar/Editar)
✨ Recursos incluídos:
- ✅ Form component com validação Zod
- ✅ Modo create/update automático
- ✅ useHeaderConfig para breadcrumbs
- ✅ Navegação com botão voltar
- ✅ Loading states
- ✅ Toast notifications

### **service.hbs**
✨ Recursos incluídos:
- ✅ createBaseService factory
- ✅ Hooks: useList, useGet, useCreate, useUpdate, useDelete
- ✅ Query keys organizadas
- ✅ Exemplo de método customizado

---

## 🔧 Após Gerar o CRUD

### 1. Ajustar campos da tabela
Em `index.jsx`, edite o array `headers`:

```jsx
const headers = useMemo(
  () => [
    {
      label: 'Nome',
      field: 'name',
    },
    {
      label: 'Preço',
      field: 'price',
      type: 'currency', // ou 'number', 'date', 'custom'
    },
    // ... outros campos
  ],
  [],
)
```

### 2. Ajustar campos do formulário
Em `[id].jsx`, edite:

**Schema Zod:**
```jsx
const produtoFormSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  price: z.number().min(0, 'Preço deve ser positivo'),
  // ... outros campos
})
```

**Fields:**
```jsx
const fields = [
  {
    name: 'name',
    label: 'Nome',
    type: 'text',
    required: true,
    cols: 6,
  },
  {
    name: 'price',
    label: 'Preço',
    type: 'number',
    required: true,
    cols: 3,
  },
  // ... outros campos
]
```

**Payload:**
```jsx
const payload = {
  name: data.name,
  price: data.price,
  // ... outros campos
}
```

### 3. Adicionar no menu
Em `src/layout/components/app-sidebar.jsx`:

```jsx
{
  title: "Produtos",
  url: "/vendas/produtos",
  icon: Package,
  permission: "produtos:read"
}
```

---

## 📚 Tipos de Campo Suportados

### Form Component
- `text`, `email`, `password`
- `number`, `currency`
- `date`, `datetime`
- `textarea`
- `select`, `multi-select`
- `checkbox`, `switch`
- `radio`
- `file`, `image`

### GenericTable
- `text` (padrão)
- `date`
- `number`
- `currency`
- `custom` (com função render)

---

## 🎨 Customizações Comuns

### Busca em múltiplos campos
```jsx
const { data } = useEntityList({
  page,
  pageSize,
  term: query,
  fields: ['name', 'description', 'code'], // ✅ Múltiplos campos
})
```

### Renderização customizada na tabela
```jsx
{
  label: 'Status',
  field: 'active',
  type: 'custom',
  render: (value) => (
    <Badge variant={value ? 'success' : 'secondary'}>
      {value ? 'Ativo' : 'Inativo'}
    </Badge>
  ),
}
```

### Método customizado no service
```jsx
// No arquivo do service
const customApi = {
  activate: async (id) => {
    const response = await api.post(`${BASE_URL}/${id}/activate`)
    return response.data
  },
}

export function useEntityActivate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => customApi.activate(id),
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: entityKeys.detail(id) })
    },
  })
}
```

---

## 🚨 Dicas e Boas Práticas

1. **Sempre ajuste os TODOs** nos arquivos gerados
2. **Configure permissões** adequadas para cada ação
3. **Valide os dados** com Zod antes de enviar
4. **Use tipos apropriados** nos campos (number para números, date para datas)
5. **Teste a paginação** e busca após gerar
6. **Adicione loading states** onde necessário
7. **Trate erros** com mensagens amigáveis

---

## 📖 Documentação Relacionada

- [Form Component](../docs/FORM_README.md)
- [GenericTable](../src/components/table/README.md)
- [Base Service](../src/services/base/README.md)
- [Hooks](../src/hooks/README.md)
