# Implementação - Melhorias do Form Component

## ✅ Concluído

### 1. Novos Tipos de Campos Web
- ✅ **TextareaField**: Campo de texto longo com contador de caracteres
- ✅ **RadioField**: Seleção única com opções visíveis (horizontal/vertical)
- ✅ **CheckboxGroupField**: Seleção múltipla com opções expostas
- ✅ **SwitchField**: Toggle moderno para valores booleanos

### 2. Lógica de Campos Condicionais
- ✅ Propriedade `condition` adicionada
- ✅ Função recebe valores do formulário e retorna se deve mostrar o campo
- ✅ Campos condicionais não são renderizados quando condição é falsa

### 3. Sistema de Grid Layout
- ✅ Propriedade `cols` adicionada (1-12, padrão: 12)
- ✅ Container do formulário usa CSS Grid com 12 colunas
- ✅ Campos ocupam espaço baseado na prop `cols`
- ✅ Suporte para layouts responsivos

### 4. Schema Zod Atualizado
- ✅ Validações para `textarea` (minLength, maxLength)
- ✅ Validações para `radio` (required, optional)
- ✅ Validações para `checkbox-group` (array, min items)
- ✅ Validações para `switch` (boolean, mustBeTrue)

### 5. Default Values
- ✅ `switch` inicia como `false` (ou defaultValue)
- ✅ `radio` inicia como `null`
- ✅ `checkbox-group` inicia como array vazio `[]`
- ✅ `textarea` inicia como string vazia `""`

### 6. Migração de React Native para Web
- ✅ Removidos imports de React Native (View, Text, TouchableOpacity, ActivityIndicator)
- ✅ Substituídos por elementos HTML nativos (div, span, button)
- ✅ Classes Tailwind mantidas para estilização

## 🚧 Próximas Etapas (Não Implementadas)

### 1. Otimização de Performance com `register`
**Status**: Estrutura preparada, mas não implementado

A implementação atual ainda usa `Controller` para todos os campos. Para melhor performance:

```javascript
// CASO A: Inputs Nativos (Use register - mais performático)
// text, email, password, number, date, textarea, radio
const Input = React.forwardRef(({ label, error, ...props }, ref) => (
  <div>
    <label>{label}</label>
    <input ref={ref} {...props} />
    {error && <span>{error}</span>}
  </div>
));

// No renderField:
if (['text', 'email', 'password', 'number', 'date'].includes(type)) {
  return <Input {...register(name)} />;
}

// CASO B: Componentes Complexos (Mantenha Controller)
// picker, searchPicker, currency, datetime (com pickers customizados)
```

**Vantagens do `register`**:
- Não força re-render do form a cada tecla
- Melhor performance em formulários grandes
- Menos overhead de React Hook Form

### 2. Tipos de Campo Adicionais

#### File Upload
```javascript
case "file":
  return <FileField {...register(name)} />;
```

#### Rich Text Editor
```javascript
case "richtext":
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => <RichTextEditor {...field} />}
    />
  );
```

#### Masked Input
```javascript
case "mask":
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => <MaskedInput mask={fieldProps.mask} {...field} />}
    />
  );
```

### 3. Validação Condicional no Schema
Quando um campo depende de outro, o schema Zod deve refletir isso:

```javascript
const schema = z.object({
  tipo_pessoa: z.enum(['PF', 'PJ']),
  cpf: z.string().optional(),
  cnpj: z.string().optional(),
}).refine(
  (data) => {
    if (data.tipo_pessoa === 'PF' && !data.cpf) return false;
    if (data.tipo_pessoa === 'PJ' && !data.cnpj) return false;
    return true;
  },
  {
    message: "Campo obrigatório baseado na seleção",
    path: ["cpf"], // ou ["cnpj"]
  }
);
```

## 📝 Exemplo de Uso

```javascript
const fields = [
  // Linha 1: Nome e Email (50% cada)
  { 
    name: 'nome', 
    label: 'Nome Completo', 
    type: 'text', 
    required: true, 
    cols: 6 
  },
  { 
    name: 'email', 
    label: 'E-mail', 
    type: 'email', 
    required: true, 
    cols: 6 
  },

  // Linha 2: Tipo de Pessoa (100% da largura)
  { 
    name: 'tipo_pessoa', 
    label: 'Tipo de Pessoa', 
    type: 'radio',
    options: [
      { label: 'Física', value: 'PF' }, 
      { label: 'Jurídica', value: 'PJ' }
    ],
    required: true,
    direction: 'horizontal',
    cols: 12 
  },

  // CONDICIONAL: CPF só aparece se tipo_pessoa for 'PF'
  { 
    name: 'cpf', 
    label: 'CPF', 
    type: 'text',
    required: true, 
    cols: 6,
    condition: (values) => values.tipo_pessoa === 'PF'
  },

  // CONDICIONAL: CNPJ só aparece se tipo_pessoa for 'PJ'
  { 
    name: 'cnpj', 
    label: 'CNPJ', 
    type: 'text',
    required: true, 
    cols: 6,
    condition: (values) => values.tipo_pessoa === 'PJ'
  },
  
  // Textarea
  {
    name: 'observacoes',
    label: 'Observações',
    type: 'textarea',
    rows: 4,
    maxLength: 500,
    cols: 12
  },

  // Switch
  {
    name: 'aceitar_termos',
    label: 'Aceitar Termos',
    type: 'switch',
    required: true,
    mustBeTrue: true,
    switchLabel: 'Aceito os termos e condições',
    cols: 12
  },

  // Checkbox Group
  {
    name: 'interesses',
    label: 'Áreas de Interesse',
    type: 'checkbox-group',
    options: [
      { label: 'Tecnologia', value: 'tech' },
      { label: 'Negócios', value: 'business' },
      { label: 'Design', value: 'design' }
    ],
    direction: 'vertical',
    cols: 12
  }
];

<Form 
  fields={fields} 
  onSubmit={handleSubmit}
  submitLabel="Cadastrar"
/>
```

## 🎯 Diferenças Chave: React Native vs Web

### React Native (Anterior)
- `<View>` para containers
- `<Text>` para texto
- `<TouchableOpacity>` para botões
- `<ActivityIndicator>` para loading
- Estilos inline ou StyleSheet

### Web (Atual)
- `<div>` para containers
- `<span>`, `<p>` para texto
- `<button>` para botões
- Elementos HTML/CSS para loading
- Classes Tailwind CSS

## ⚠️ Notas Importantes

1. **Classes Tailwind Dinâmicas**: As classes `col-span-{n}` precisam existir no arquivo CSS ou serem configuradas no `safelist` do Tailwind para funcionarem corretamente.

2. **Watch Performance**: O `watch()` sem argumentos observa todos os campos. Para forms muito grandes, considere observar apenas os campos que causam mudanças condicionais:
   ```javascript
   const tipoPessoa = watch('tipo_pessoa');
   // Ao invés de:
   const formValues = watch();
   ```

3. **Validação Assíncrona**: Se precisar validar com API (ex: verificar se email já existe), use `resolver` customizado do React Hook Form.

4. **Campos Dinâmicos**: Para adicionar/remover campos dinamicamente, use `useFieldArray` do React Hook Form (já implementado no `FieldArrayField`).
