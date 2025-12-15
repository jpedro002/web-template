# 🚀 Gerador Plop - Frontend

Automatiza a criação de services e páginas CRUD completas no frontend.

## 📋 Índice

- [Instalação](#instalação)
- [Geradores Disponíveis](#geradores-disponíveis)
- [Exemplos de Uso](#exemplos-de-uso)
- [Estrutura Gerada](#estrutura-gerada)
- [Customização](#customização)

---

## Instalação

O Plop já está configurado no projeto. Para usar:

```bash
# Modo interativo (escolhe o gerador)
bun run generate

# Ou executar diretamente
bun run generate:service   # Gerar apenas service
bun run generate:crud      # Gerar CRUD completo
```

---

## Geradores Disponíveis

### 1. 📦 Service (`generate:service`)

Cria um service baseado no `createBaseService` factory.

**O que é gerado:**
- ✅ CRUD completo (list, get, create, update, delete)
- ✅ React Query hooks prontos
- ✅ Invalidação automática de cache
- ✅ Estrutura para métodos customizados (opcional)

**Quando usar:**
- Você já tem as páginas e só precisa do service
- Quer integrar com um endpoint novo da API
- Precisa apenas da camada de dados

---

### 2. 🎨 CRUD Page (`generate:crud`)

Cria uma página CRUD completa com tabela, formulário e service.

**O que é gerado:**
- ✅ Service completo
- ✅ Página de listagem com tabela
- ✅ Página de criação/edição
- ✅ Arquivo de colunas da tabela
- ✅ Integração com React Router

**Quando usar:**
- Você está começando um módulo do zero
- Precisa de uma interface completa rapidamente
- Quer manter o padrão do projeto

---

## Exemplos de Uso

### Exemplo 1: Criar Service para "Produtos"

```bash
bun run generate:service
```

**Prompts:**
```
? Nome da entidade: Produto
? Endpoint da API: /vendas/produtos
? Adicionar exemplos de métodos customizados? No
```

**Resultado:**
```
✅ Service criado!
📁 src/services/produtos.js
```

**Uso no componente:**
```jsx
import { useProdutoList, useProdutoCreate } from 'src/services/produtos'

function ProdutosPage() {
    const { data, isLoading } = useProdutoList({ page: 1, pageSize: 10 })
    const createMutation = useProdutoCreate()
    
    // ...
}
```

---

### Exemplo 2: Criar CRUD Completo para "Clientes"

```bash
bun run generate:crud
```

**Prompts:**
```
? Nome da entidade: Cliente
? Endpoint da API: /vendas/clientes
? Caminho da rota: vendas/clientes
? Tipo de layout: Admin (protegido)
```

**Resultado:**
```
✅ CRUD completo criado!

📁 Arquivos criados:
  - src/services/clientes.js
  - src/pages/(auth)/(admin)/clientes/index.jsx
  - src/pages/(auth)/(admin)/clientes/[id].jsx
  - src/pages/(auth)/(admin)/clientes/columns.jsx

🔗 Rota: /vendas/clientes
```

**Acessar:**
- Lista: `http://localhost:5173/vendas/clientes`
- Criar: `http://localhost:5173/vendas/clientes/new`
- Editar: `http://localhost:5173/vendas/clientes/123`

---

## Estrutura Gerada

### Service (`produtos.js`)

```javascript
import { createBaseService } from './base/createBaseService'

const baseService = createBaseService('/vendas/produtos', 'produtos')

const { 
    keys: produtosKeys,
    api: baseApi,
    useList: useProdutoList,
    useGet: useProduto,
    useCreate: useProdutoCreate,
    useUpdate: useProdutoUpdate,
    useDelete: useProdutoDelete
} = baseService

// Métodos customizados (se necessário)
const customApi = {
    ativar: async (id) => {
        const response = await api.post(`/vendas/produtos/${id}/ativar`)
        return response.data
    }
}

export function useProdutoAtivar() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: customApi.ativar,
        onSuccess: (data, id) => {
            queryClient.invalidateQueries({ queryKey: produtosKeys.detail(id) })
        }
    })
}

export {
    produtosKeys,
    useProdutoList,
    useProduto,
    useProdutoCreate,
    useProdutoUpdate,
    useProdutoDelete
}
```

### Página de Listagem (`index.jsx`)

```jsx
import { useProdutoList, useProdutoDelete } from 'src/services/produtos'

export default function ProdutosPage() {
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    })

    const { data, isLoading } = useProdutoList({
        page: pagination.pageIndex + 1,
        pageSize: pagination.pageSize,
    })

    // Tabela com paginação, busca e ações
}
```

### Colunas da Tabela (`columns.jsx`)

```jsx
export const columns = ({ onDelete }) => [
    { accessorKey: 'id', header: 'ID' },
    { accessorKey: 'nome', header: 'Nome' },
    {
        accessorKey: 'ativo',
        header: 'Status',
        cell: ({ row }) => (
            <Badge variant={row.getValue('ativo') ? 'default' : 'secondary'}>
                {row.getValue('ativo') ? 'Ativo' : 'Inativo'}
            </Badge>
        )
    },
    // Menu de ações (Editar, Excluir)
]
```

---

## Customização

### Adicionar Métodos Customizados

Depois de gerar o service, você pode adicionar métodos específicos:

```javascript
// src/services/produtos.js

const customApi = {
    // Método específico de produtos
    atualizarEstoque: async (id, quantidade) => {
        const response = await api.patch(`/vendas/produtos/${id}/estoque`, { quantidade })
        return response.data
    },
    
    // Outro método específico
    gerarRelatorio: async (filtros) => {
        const response = await api.get('/vendas/produtos/relatorio', { params: filtros })
        return response.data
    }
}

// Hook para o método customizado
export function useProdutoAtualizarEstoque() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, quantidade }) => customApi.atualizarEstoque(id, quantidade),
        onSuccess: (data, { id }) => {
            // Invalida o cache do produto específico
            queryClient.invalidateQueries({ queryKey: produtosKeys.detail(id) })
            // Invalida a lista para atualizar a tabela
            queryClient.invalidateQueries({ queryKey: produtosKeys.all })
            toast.success('Estoque atualizado!')
        }
    })
}
```

### Personalizar Colunas da Tabela

Edite o arquivo `columns.jsx` gerado:

```jsx
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export const columns = ({ onDelete }) => [
    {
        accessorKey: 'codigo',
        header: 'Código',
        size: 100,
    },
    {
        accessorKey: 'nome',
        header: 'Nome',
        cell: ({ row }) => (
            <div className="font-medium">{row.getValue('nome')}</div>
        )
    },
    {
        accessorKey: 'preco',
        header: 'Preço',
        cell: ({ row }) => {
            const preco = row.getValue('preco')
            return new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            }).format(preco)
        },
        size: 120,
    },
    {
        accessorKey: 'estoque',
        header: 'Estoque',
        cell: ({ row }) => {
            const estoque = row.getValue('estoque')
            return (
                <Badge variant={estoque > 0 ? 'default' : 'destructive'}>
                    {estoque}
                </Badge>
            )
        },
        size: 100,
    },
    // ... ações
]
```

### Adicionar Filtros na Listagem

```jsx
// Na página index.jsx
const [filters, setFilters] = useState({
    page: 1,
    pageSize: 10,
    term: '',
    ativo: undefined
})

const { data, isLoading } = useProdutoList(filters)

// Adicione campos de busca e filtros no JSX
<Input
    placeholder="Buscar produtos..."
    value={filters.term}
    onChange={(e) => setFilters({ ...filters, term: e.target.value })}
/>
```

### Usar Campos Específicos (Select)

```jsx
// Buscar apenas os campos necessários
const { data } = useProdutoList({
    page: 1,
    pageSize: 10,
    select: 'id,nome,preco,estoque' // Otimiza a resposta da API
})
```

---

## 🔥 Dicas Pro

### 1. Gere Múltiplos Módulos Rapidamente

```bash
# Terminal 1
bun run generate:crud
# Criar: Produtos

# Terminal 2 (após o primeiro terminar)
bun run generate:crud
# Criar: Clientes

# Terminal 3
bun run generate:crud
# Criar: Vendas
```

### 2. Reutilize Services em Diferentes Contextos

```jsx
// No formulário de Venda, use o service de Produtos
import { useProdutoListAll } from 'src/services/produtos'

function VendaForm() {
    // Lista TODOS os produtos (sem paginação) para o select
    const { data: produtos } = useProdutoListAll()
    
    return (
        <Select>
            {produtos?.map(p => (
                <option key={p.id} value={p.id}>{p.nome}</option>
            ))}
        </Select>
    )
}
```

### 3. Compartilhe Lógica Entre Páginas

```javascript
// src/hooks/useProdutoActions.js
import { useProdutoDelete, useProdutoAtivar } from 'src/services/produtos'

export function useProdutoActions() {
    const deleteMutation = useProdutoDelete({
        onSuccess: () => toast.success('Produto excluído!')
    })
    
    const ativarMutation = useProdutoAtivar({
        onSuccess: () => toast.success('Produto ativado!')
    })
    
    return { deleteMutation, ativarMutation }
}
```

---

## 📌 Checklist Pós-Geração

Após gerar um CRUD, não esqueça de:

- [ ] Adicionar a rota no menu lateral (`src/layout/components/app-sidebar.jsx`)
- [ ] Ajustar as colunas da tabela conforme seu modelo
- [ ] Adicionar validação com `zod` (se necessário)
- [ ] Customizar o formulário com os campos corretos
- [ ] Testar create, update, delete
- [ ] Adicionar permissões de acesso (se usar RBAC)

---

## 🆘 Troubleshooting

### "Endpoint não encontrado"
Verifique se o endpoint no backend existe e está correto.

### "Hook não encontrado"
Certifique-se de que o service foi gerado corretamente e está exportando os hooks.

### "Rota não funciona"
Verifique se a estrutura de pastas está correta e se o React Router está configurado.

---

## 📚 Recursos Relacionados

- [createBaseService Factory](./src/services/base/createBaseService.js)
- [Exemplo: usuariosService](./src/services/usuarios.js)
- [Componente DataTable](./src/components/table/table.jsx)

---

**Desenvolvido por:** João  
**Data:** Dezembro 2024  
**Versão:** 1.0.0
