# Form Component - Documentação Completa

Componente de formulário dinâmico e otimizado para React Web com validação integrada usando React Hook Form e Zod.

## 🚀 Features

### Tipos de Campos Suportados

#### Campos de Texto
- `text` - Texto simples
- `email` - E-mail com validação
- `password` - Senha com opções de minLength
- `tel` - Telefone
- `number` - Numérico
- `textarea` - Texto longo com contador de caracteres

#### Campos de Seleção
- `picker` - Select nativo (dropdown)
- `searchPicker` - Select com busca (single/multi)
- `radio` - Radio buttons (seleção única visível)
- `checkbox-group` - Checkboxes (seleção múltipla visível)

#### Campos Especiais
- `boolean` / `switch` - Toggle booleano
- `date` - Seletor de data
- `datetime` - Seletor de data e hora
- `currency` - Valor monetário formatado
- `fieldArray` - Arrays dinâmicos de campos
- `hidden` - Campos ocultos
- `custom` - Renderização customizada

### Lógica Condicional

Campos podem aparecer/desaparecer baseado nos valores de outros campos:

```javascript
{
  name: 'cpf',
  label: 'CPF',
  type: 'text',
  required: true,
  // Só aparece se tipo_pessoa for 'PF'
  condition: (values) => values.tipo_pessoa === 'PF'
}
```

### Sistema de Grid Responsivo

Layout baseado em 12 colunas (como Bootstrap/Tailwind):

```javascript
{ name: 'nome', type: 'text', cols: 6 },    // Metade da largura
{ name: 'email', type: 'email', cols: 6 },  // Metade da largura
{ name: 'obs', type: 'textarea', cols: 12 } // Largura total
```

### Validação Zod Automática

O schema de validação é gerado automaticamente baseado nos campos:

```javascript
const fields = [
  {
    name: 'email',
    type: 'email',
    required: true,
    maxLength: 100
  }
];

// Schema Zod gerado automaticamente:
// z.object({
//   email: z.string()
//     .email("Por favor, informe um e-mail válido")
//     .min(1, "Campo obrigatório")
//     .max(100, "Máximo de 100 caracteres")
// })
```

## 📖 API Reference

### Props do Componente Form

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `fields` | `Array` | `[]` | Array de definição dos campos |
| `schema` | `ZodSchema` | auto | Schema Zod customizado (opcional) |
| `data` | `Object` | `null` | Dados iniciais do formulário |
| `onSubmit` | `Function` | `()=>{}` | Callback ao submeter `(data) => void` |
| `onChange` | `Function` | `()=>{}` | Callback quando há mudanças `(values) => void` |
| `isLoading` | `Boolean` | `false` | Estado de loading do botão submit |
| `submitLabel` | `String` | `"Salvar"` | Texto do botão submit |
| `showSubmitButton` | `Boolean` | `true` | Mostrar botão submit |
| `showRequiredIndicator` | `Boolean` | `true` | Mostrar indicador de obrigatório |
| `formRef` | `React.Ref` | - | Ref para expor métodos do form |

### Definição de Campo (Field Object)

#### Propriedades Comuns

| Propriedade | Tipo | Descrição |
|------------|------|-----------|
| `name` | `String` | **Obrigatório.** Nome do campo (usado no objeto de dados) |
| `type` | `String` | **Obrigatório.** Tipo do campo |
| `label` | `String` | Label exibido acima do campo |
| `required` | `Boolean` | Se o campo é obrigatório |
| `cols` | `Number` | Largura do campo no grid (1-12, padrão: 12) |
| `condition` | `Function` | Função que retorna se deve mostrar: `(values) => Boolean` |
| `hidden` | `Boolean` | Campo oculto (não renderizado visualmente) |
| `editable` | `Boolean` | Se o campo é editável (padrão: true) |
| `onChange` | `Function` | Callback customizado: `(value, { setValue, watch }) => void` |
| `defaultValue` | `Any` | Valor padrão inicial |

#### Propriedades por Tipo

##### text, email, password, tel, number
```javascript
{
  name: 'campo',
  type: 'text', // ou email, password, tel, number
  placeholder: 'Digite aqui...',
  minLength: 3,
  maxLength: 100,
  requiredMessage: 'Mensagem customizada de erro'
}
```

##### textarea
```javascript
{
  name: 'observacoes',
  type: 'textarea',
  rows: 4,              // Número de linhas visíveis
  maxLength: 500,       // Mostra contador
  placeholder: 'Digite...'
}
```

##### radio
```javascript
{
  name: 'tipo',
  type: 'radio',
  options: [
    { label: 'Opção 1', value: 'opt1' },
    { label: 'Opção 2', value: 'opt2' }
  ],
  direction: 'horizontal' // ou 'vertical' (padrão)
}
```

##### checkbox-group
```javascript
{
  name: 'interesses',
  type: 'checkbox-group',
  options: [
    { label: 'Tecnologia', value: 'tech' },
    { label: 'Design', value: 'design' }
  ],
  direction: 'vertical',
  required: true, // Array deve ter pelo menos 1 item
  requiredMessage: 'Selecione pelo menos uma opção'
}
```

##### switch
```javascript
{
  name: 'aceitar_termos',
  type: 'switch',
  required: true,
  mustBeTrue: true,     // Força que seja true
  mustBeTrueMessage: 'Você precisa aceitar os termos',
  switchLabel: 'Aceito os termos',
  switchDescription: 'Descrição adicional'
}
```

##### picker
```javascript
{
  name: 'status',
  type: 'picker',
  options: [
    { label: 'Ativo', value: 1 },
    { label: 'Inativo', value: 0 }
  ]
}
```

##### searchPicker
```javascript
{
  name: 'categorias',
  type: 'searchPicker',
  multiSelect: true,    // Permite múltipla seleção
  options: [...],
  // ... outras props específicas
}
```

##### date / datetime
```javascript
{
  name: 'data_nascimento',
  type: 'date', // ou 'datetime'
  noFutureDate: true,        // Impede datas futuras
  alertFutureDate: true,     // Alerta mas permite
  futureDateMessage: 'Mensagem customizada',
  showCurrentButton: true    // Botão "Hoje/Agora"
}
```

##### currency
```javascript
{
  name: 'valor',
  type: 'currency',
  required: true,
  requiredMessage: 'Informe um valor'
}
```

##### fieldArray
```javascript
{
  name: 'items',
  type: 'fieldArray',
  label: 'Itens',
  minRows: 1,           // Mínimo de linhas
  maxRows: 10,          // Máximo de linhas
  addButtonLabel: 'Adicionar Item',
  removeButtonLabel: 'Remover',
  fields: [
    { name: 'descricao', type: 'text', label: 'Descrição', required: true },
    { name: 'quantidade', type: 'number', label: 'Qtd', required: true }
  ]
}
```

##### custom
```javascript
{
  name: 'custom_field',
  type: 'custom',
  render: ({ control, errors, setValue, watch }) => (
    <div>
      {/* Sua renderização customizada */}
    </div>
  )
}
```

##### button
```javascript
{
  type: 'button',
  label: 'Meu Botão',
  onPress: () => console.log('Clicado'),
  disabled: false,
  className: 'bg-green-600', // Classes Tailwind customizadas
  cols: 6,
  renderAfter: () => <div>Conteúdo abaixo do botão</div>
}
```

## 🎯 Exemplos de Uso

### Formulário Simples

```javascript
import Form from './components/Form/Form';

const SimpleForm = () => {
  const fields = [
    { name: 'nome', label: 'Nome', type: 'text', required: true },
    { name: 'email', label: 'E-mail', type: 'email', required: true }
  ];

  const handleSubmit = (data) => {
    console.log(data); // { nome: '...', email: '...' }
  };

  return <Form fields={fields} onSubmit={handleSubmit} />;
};
```

### Formulário com Layout Grid

```javascript
const fields = [
  { name: 'nome', label: 'Nome', type: 'text', required: true, cols: 6 },
  { name: 'sobrenome', label: 'Sobrenome', type: 'text', required: true, cols: 6 },
  { name: 'email', label: 'E-mail', type: 'email', required: true, cols: 8 },
  { name: 'telefone', label: 'Telefone', type: 'tel', required: true, cols: 4 },
  { name: 'observacoes', label: 'Obs', type: 'textarea', cols: 12 }
];
```

### Formulário com Campos Condicionais

```javascript
const fields = [
  {
    name: 'tipo_usuario',
    label: 'Tipo de Usuário',
    type: 'radio',
    required: true,
    options: [
      { label: 'Pessoa Física', value: 'PF' },
      { label: 'Pessoa Jurídica', value: 'PJ' }
    ]
  },
  {
    name: 'cpf',
    label: 'CPF',
    type: 'text',
    required: true,
    condition: (values) => values.tipo_usuario === 'PF'
  },
  {
    name: 'cnpj',
    label: 'CNPJ',
    type: 'text',
    required: true,
    condition: (values) => values.tipo_usuario === 'PJ'
  }
];
```

### Formulário com Validação Customizada

```javascript
import { z } from 'zod';

const customSchema = z.object({
  senha: z.string().min(8, 'Mínimo de 8 caracteres'),
  confirmar_senha: z.string()
}).refine(
  (data) => data.senha === data.confirmar_senha,
  {
    message: 'As senhas não coincidem',
    path: ['confirmar_senha']
  }
);

<Form
  fields={[
    { name: 'senha', label: 'Senha', type: 'password', required: true },
    { name: 'confirmar_senha', label: 'Confirmar Senha', type: 'password', required: true }
  ]}
  schema={customSchema}
  onSubmit={handleSubmit}
/>
```

### Formulário com Controle Programático

```javascript
import { useRef } from 'react';

const MyForm = () => {
  const formRef = useRef();

  const resetForm = () => {
    formRef.current.reset();
  };

  const fillForm = () => {
    formRef.current.setValue('nome', 'João Silva');
    formRef.current.setValue('email', 'joao@email.com');
  };

  const getValues = () => {
    const values = formRef.current.getValues();
    console.log(values);
  };

  return (
    <>
      <Form
        formRef={formRef}
        fields={fields}
        onSubmit={handleSubmit}
      />
      <button onClick={resetForm}>Limpar</button>
      <button onClick={fillForm}>Preencher</button>
      <button onClick={getValues}>Ver Valores</button>
    </>
  );
};
```

## 🎨 Customização

### Classes Tailwind

O componente usa classes do Tailwind CSS. Para customizar, você pode:

1. **Sobrescrever classes no campo:**
```javascript
{ name: 'campo', type: 'text', className: 'minha-classe-custom' }
```

2. **Modificar os componentes de campo:**
Os componentes estão em `src/components/Form/FormFields/` e podem ser editados.

### Safelist do Tailwind

As classes dinâmicas de grid precisam estar no safelist do `tailwind.config.js`:

```javascript
module.exports = {
  // ...
  safelist: [
    'col-span-1', 'col-span-2', 'col-span-3', 'col-span-4',
    'col-span-5', 'col-span-6', 'col-span-7', 'col-span-8',
    'col-span-9', 'col-span-10', 'col-span-11', 'col-span-12'
  ]
}
```

## 🔧 Troubleshooting

### Classes do Grid não aplicam

**Problema:** As classes `col-span-X` não estão funcionando.

**Solução:** Adicione as classes ao `safelist` do Tailwind (veja acima) ou use classes estáticas.

### Campos condicionais não validam corretamente

**Problema:** Campo condicional oculto ainda dispara erro de validação.

**Solução:** O campo deve ser `.optional()` no schema Zod ou use validação refinada:

```javascript
const schema = z.object({
  tipo: z.string(),
  cpf: z.string().optional()
}).refine(
  (data) => {
    if (data.tipo === 'PF' && !data.cpf) return false;
    return true;
  },
  { message: 'CPF obrigatório para PF', path: ['cpf'] }
);
```

### Performance em formulários grandes

**Problema:** O formulário fica lento com muitos campos.

**Solução:** 
1. Use `watch()` apenas para os campos que precisam de reatividade
2. Considere implementar `register` para campos nativos (veja IMPLEMENTACAO.md)

## 📝 Changelog

### Versão 2.0 (Atual)
- ✅ Novos tipos de campo: textarea, radio, checkbox-group, switch
- ✅ Lógica condicional com prop `condition`
- ✅ Sistema de grid com prop `cols` (1-12)
- ✅ Migração de React Native para Web (HTML/CSS)
- ✅ Validação Zod integrada para novos campos

### Versão 1.0 (Anterior)
- Tipos básicos: text, email, password, picker, searchPicker, etc.
- Validação Zod
- FieldArray dinâmico

## 🤝 Contribuindo

Para adicionar novos tipos de campo:

1. Crie o componente em `src/components/Form/FormFields/`
2. Exporte em `FormFields/index.js`
3. Adicione o tipo no switch de `renderField()`
4. Adicione validação no `generatedSchema`
5. Adicione valor padrão em `defaultValues`

## 📄 Licença

MIT
