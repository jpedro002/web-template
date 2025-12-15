import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { AlertCircle, CalendarIcon, Loader2 } from 'lucide-react'
import React, {
	useEffect,
	useImperativeHandle,
	useMemo,
	useRef,
	useState,
} from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Button } from 'src/components/ui/button'
import { Calendar } from 'src/components/ui/calendar'
import { Checkbox } from 'src/components/ui/checkbox'
// Componentes Shadcn UI
import { Input } from 'src/components/ui/input'
import { Label } from 'src/components/ui/label'
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from 'src/components/ui/popover'
import { RadioGroup, RadioGroupItem } from 'src/components/ui/radio-group'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from 'src/components/ui/select'
import { SearchSelect } from 'src/components/ui/search-select'
import { Switch } from 'src/components/ui/switch'
import { Textarea } from 'src/components/ui/textarea'
// Utilitários
import { cn } from 'src/lib/utils'
import { z } from 'zod'

/**
 * Helper para exibir erros
 */
const ErrorMessage = ({ error }) => {
	if (!error) return null
	return (
		<span className="text-xs text-red-500 mt-1 flex items-center gap-1">
			<AlertCircle className="w-3 h-3" />
			{error}
		</span>
	)
}

/**
 * Helper para Grid Classes
 */
const getGridClass = (cols) => {
	const colsMap = {
		1: 'col-span-12 md:col-span-1',
		2: 'col-span-12 md:col-span-2',
		3: 'col-span-12 md:col-span-3',
		4: 'col-span-12 md:col-span-4',
		5: 'col-span-12 md:col-span-5',
		6: 'col-span-12 md:col-span-6',
		7: 'col-span-12 md:col-span-7',
		8: 'col-span-12 md:col-span-8',
		9: 'col-span-12 md:col-span-9',
		10: 'col-span-12 md:col-span-10',
		11: 'col-span-12 md:col-span-11',
		12: 'col-span-12',
	}
	return colsMap[cols] || colsMap[12]
}

/**
 * Wrapper Component
 */
const FieldWrapper = ({ field, error, showRequiredIndicator, children }) => {
	const { name, label, type, required } = field
	const cols = field.cols || 12
	const gridClass = getGridClass(cols)

	return (
		<div className={`${gridClass} space-y-2`}>
			{type !== 'boolean' && type !== 'switch' && type !== 'checkbox' && (
				<Label htmlFor={name} className={cn(error && 'text-red-500')}>
					{label}{' '}
					{required && showRequiredIndicator && (
						<span className="text-red-500">*</span>
					)}
				</Label>
			)}
			{children}
			<ErrorMessage error={error} />
		</div>
	)
}

const Form = React.forwardRef(
	(
		{
			fields = [],
			schema,
			data = null,
			showRequiredIndicator = true,
			onSubmit = () => {},
			onChange = () => {},
			isLoading = false,
			submitLabel = 'Salvar',
			showSubmitButton = true,
		},
		ref,
	) => {
		// --- 1. GERAÇÃO DE SCHEMA ---
		const generatedSchema = useMemo(() => {
			if (schema) return schema
			const shape = {}

			fields.forEach((field) => {
				const hasCondition = !!field.condition
				const shouldBeRequired = field.required && !hasCondition
				let baseSchema

				switch (field.type) {
					case 'email':
						baseSchema = z.string().email('E-mail inválido')
						if (!shouldBeRequired) baseSchema = baseSchema.or(z.literal(''))
						break
					case 'number':
						baseSchema = z.number({ invalid_type_error: 'Deve ser um número' })
						if (!shouldBeRequired)
							baseSchema = baseSchema.or(z.nan()).optional()
						break
					case 'date':
					case 'datetime':
						baseSchema = z.date({ required_error: 'Selecione uma data' })
						if (!shouldBeRequired) baseSchema = baseSchema.optional().nullable()
						break
					case 'boolean':
					case 'switch':
					case 'checkbox':
						baseSchema = z.boolean()
						if (field.mustBeTrue)
							baseSchema = baseSchema.refine(
								(val) => val === true,
								'Obrigatório',
							)
						if (!shouldBeRequired) baseSchema = baseSchema.optional()
						break
					case 'checkbox-group':
				case 'searchSelect':
				case 'searchPicker':
					if (field.multiple || field.multiSelect) {
						baseSchema = z.array(z.union([z.string(), z.number()]))
						if (shouldBeRequired)
							baseSchema = baseSchema.min(1, 'Selecione pelo menos uma opção')
						else baseSchema = baseSchema.optional()
					} else {
						baseSchema = z.union([z.string(), z.number()])
							if (!shouldBeRequired)
								baseSchema = baseSchema.optional().or(z.literal(''))
						}
						break
					default:
						baseSchema = z.string()
						if (shouldBeRequired)
							baseSchema = baseSchema.min(
								1,
								field.requiredMessage || 'Campo obrigatório',
							)
						else baseSchema = baseSchema.optional().or(z.literal(''))
				}
				shape[field.name] = baseSchema
			})
			return z.object(shape)
		}, [fields, schema])

		// --- 2. CONFIGURAÇÃO DO FORM ---
		const defaultValues = useMemo(() => {
			return fields.reduce((acc, field) => {
				if (data && data[field.name] !== undefined) {
					if (
						(field.type === 'date' || field.type === 'datetime') &&
						typeof data[field.name] === 'string'
					) {
						acc[field.name] = new Date(data[field.name])
					} else {
						acc[field.name] = data[field.name]
					}
				} else {
					switch (field.type) {
						case 'switch':
						case 'boolean':
							acc[field.name] = false
							break
						case 'checkbox-group':
					case 'searchSelect':
					case 'searchPicker':
						acc[field.name] = field.multiple || field.multiSelect ? [] : ''
							break
						case 'number':
							acc[field.name] = ''
							break
						default:
							acc[field.name] = ''
					}
				}
				return acc
			}, {})
		}, [data, fields])

		const {
			register,
			control,
			handleSubmit,
			watch,
			reset,
			setValue,
			formState: { errors },
		} = useForm({
			resolver: zodResolver(generatedSchema),
			defaultValues,
		})

		// --- 3. EFEITOS E HANDLERS ---
		useImperativeHandle(
			ref,
			() => ({
				reset: (vals) => reset(vals || defaultValues),
				setValue,
				watch,
				getValues: watch,
			}),
			[reset, setValue, watch, defaultValues],
		)

		// Estado local para controle condicional
		const [formValuesState, setFormValuesState] = useState(defaultValues)
		const formValuesRef = useRef(defaultValues)
		const fieldsAffectingConditionsRef = useRef(new Set())

		// Identificar campos que afetam condições (campos referenciados nas funções condition)
		useMemo(() => {
			fieldsAffectingConditionsRef.current.clear()
			fields.forEach((field) => {
				if (field.condition && typeof field.condition === 'function') {
					// Adicionar campos comuns que geralmente afetam condições
					// Para uma solução mais robusta, poderíamos analisar o código da função
					// Por ora, vamos detectar alguns padrões comuns
					const conditionStr = field.condition.toString()
					fields.forEach((otherField) => {
						if (conditionStr.includes(otherField.name)) {
							fieldsAffectingConditionsRef.current.add(otherField.name)
						}
					})
				}
			})
		}, [fields])

		// Sync data prop
		useEffect(() => {
			if (data) {
				const processedData = {}
				Object.keys(data).forEach((key) => {
					let val = data[key]
					if (
						fields.find(
							(f) =>
								f.name === key && (f.type === 'date' || f.type === 'datetime'),
						) &&
						typeof val === 'string'
					) {
						val = new Date(val)
					}
					setValue(key, val)
					processedData[key] = val
				})
				// Força atualização do estado para que condições sejam reavaliadas
				setFormValuesState((prev) => ({ ...prev, ...processedData }))
			}
		}, [data, setValue, fields])

		// Inicialização do estado com valores do formulário
		useEffect(() => {
			const currentValues = watch()
			setFormValuesState(currentValues)
			formValuesRef.current = currentValues
		}, [watch])

		// Watch changes
		useEffect(() => {
			const subscription = watch((value) => {
				const previousValues = formValuesRef.current
				formValuesRef.current = value

				let hasConditionalFieldChange = false
				for (const fieldName of fieldsAffectingConditionsRef.current) {
					if (previousValues[fieldName] !== value[fieldName]) {
						hasConditionalFieldChange = true
						break
					}
				}

				// Atualiza o state se houver mudança em campo que afeta condições
				if (hasConditionalFieldChange) {
					setFormValuesState(value)
				}
				onChange(value)
			})
			return () => subscription.unsubscribe()
		}, [watch, onChange])

		// --- 4. RENDERIZADORES ---

		const renderField = (field) => {
			if (field.condition && typeof field.condition === 'function') {
				// Se formValuesState estiver vazio (bug anterior), isso retornava falso/erro
				if (!field.condition(formValuesState)) return null
			}
			if (field.hidden) return null

			const { name, label, type, placeholder, disabled, options } = field
			const errorMessage = errors[name]?.message
			const cols = field.cols || 12
			const gridClass = getGridClass(cols)

			// CORREÇÃO 2: Removemos 'key' daqui. A key deve ir direto no componente JSX.
			const wrapperProps = {
				field,
				error: errorMessage,
				showRequiredIndicator,
			}

			// --- STRATEGY: REGISTER ---
			if (['text', 'email', 'password', 'tel'].includes(type)) {
				return (
					<FieldWrapper key={name} {...wrapperProps}>
						<Input
							id={name}
							type={type}
							placeholder={placeholder}
							disabled={disabled}
							className={cn(
								errorMessage && 'border-red-500 focus-visible:ring-red-500',
							)}
							{...register(name)}
						/>
					</FieldWrapper>
				)
			}

			if (type === 'number') {
				return (
					<FieldWrapper key={name} {...wrapperProps}>
						<Controller
							control={control}
							name={name}
							render={({ field: { onChange, value } }) => (
								<Input
									id={name}
									type="number"
									placeholder={placeholder}
									disabled={disabled}
									className={cn(
										errorMessage && 'border-red-500 focus-visible:ring-red-500',
									)}
									value={value ?? ''}
									onChange={(e) => onChange(e.target.value)}
									onBlur={(e) => {
										const numValue =
											e.target.value === '' ? '' : Number(e.target.value)
										onChange(numValue)
									}}
								/>
							)}
						/>
					</FieldWrapper>
				)
			}

			if (type === 'textarea') {
				return (
					<FieldWrapper key={name} {...wrapperProps}>
						<Textarea
							id={name}
							placeholder={placeholder}
							disabled={disabled}
							rows={field.rows || 3}
							className={cn(
								errorMessage && 'border-red-500 focus-visible:ring-red-500',
							)}
							{...register(name)}
						/>
					</FieldWrapper>
				)
			}

			// --- STRATEGY: CONTROLLER ---
			if (type === 'select' || type === 'picker') {
				return (
					<FieldWrapper key={name} {...wrapperProps}>
						<Controller
							control={control}
							name={name}
							render={({ field: { onChange, value } }) => (
								<Select
									onValueChange={onChange}
									value={value}
									disabled={disabled}
								>
									<SelectTrigger
										className={cn(errorMessage && 'border-red-500')}
									>
										<SelectValue placeholder={placeholder || 'Selecione...'} />
									</SelectTrigger>
									<SelectContent>
										{options?.map((opt) => (
											<SelectItem key={opt.value} value={String(opt.value)}>
												{opt.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							)}
						/>
					</FieldWrapper>
				)
			}

			if (type === 'date' || type === 'datetime') {
				return (
					<FieldWrapper key={name} {...wrapperProps}>
						<Controller
							control={control}
							name={name}
							render={({ field: { value, onChange } }) => (
								<Popover>
									<PopoverTrigger asChild>
										<Button
											variant={'outline'}
											className={cn(
												'w-full justify-start text-left font-normal',
												!value && 'text-muted-foreground',
												errorMessage && 'border-red-500',
											)}
											disabled={disabled}
										>
											<CalendarIcon className="mr-2 h-4 w-4" />
											{value ? (
												format(value, 'dd/MM/yyyy', { locale: ptBR })
											) : (
												<span>{placeholder || 'Selecione a data'}</span>
											)}
										</Button>
									</PopoverTrigger>
									<PopoverContent className="w-auto p-0">
										<Calendar
											mode="single"
											selected={value}
											onSelect={onChange}
											initialFocus
											locale={ptBR}
											disabled={(date) => {
												if (field.noFutureDate) return date > new Date()
												return false
											}}
										/>
									</PopoverContent>
								</Popover>
							)}
						/>
					</FieldWrapper>
				)
			}

			// --- Layouts Customizados ---
			if (type === 'switch') {
				return (
					<div
						key={name}
						className={`${gridClass} flex flex-row items-center justify-between rounded-lg border p-4`}
					>
						<div className="space-y-0.5">
							<Label className="text-base">{label}</Label>
							{field.description && (
								<p className="text-sm text-muted-foreground">
									{field.description}
								</p>
							)}
						</div>
						<Controller
							control={control}
							name={name}
							render={({ field: { onChange, value } }) => (
								<Switch
									checked={value}
									onCheckedChange={onChange}
									disabled={disabled}
								/>
							)}
						/>
						{errorMessage && (
							<div className="absolute bottom-1 right-4">
								<ErrorMessage error={errorMessage} />
							</div>
						)}
					</div>
				)
			}

			if (type === 'radio') {
				return (
					<FieldWrapper key={name} {...wrapperProps}>
						<Controller
							control={control}
							name={name}
							render={({ field: { onChange, value } }) => (
								<RadioGroup
									onValueChange={onChange}
									defaultValue={value}
									value={value}
									className="flex flex-col space-y-1"
									disabled={disabled}
								>
									{options?.map((opt) => (
										<div
											key={opt.value}
											className="flex items-center space-x-2"
										>
											<RadioGroupItem
												value={String(opt.value)}
												id={`${name}-${opt.value}`}
											/>
											<Label
												htmlFor={`${name}-${opt.value}`}
												className="font-normal cursor-pointer"
											>
												{opt.label}
											</Label>
										</div>
									))}
								</RadioGroup>
							)}
						/>
					</FieldWrapper>
				)
			}

			if (type === 'boolean' || type === 'checkbox') {
				return (
					<div
						key={name}
						className={`${gridClass} flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4`}
					>
						<Controller
							control={control}
							name={name}
							render={({ field: { onChange, value } }) => (
								<Checkbox
									checked={value}
									onCheckedChange={onChange}
									disabled={disabled}
									id={name}
								/>
							)}
						/>
						<div className="space-y-1 leading-none">
							<Label htmlFor={name}>
								{label}{' '}
								{field.required && <span className="text-red-500">*</span>}
							</Label>
							{field.description && (
								<p className="text-sm text-muted-foreground">
									{field.description}
								</p>
							)}
							<ErrorMessage error={errorMessage} />
						</div>
					</div>
				)
			}

			if (type === 'checkbox-group') {
				return (
					<FieldWrapper key={name} {...wrapperProps}>
						<div className="grid gap-2">
							{options?.map((item) => (
								<Controller
									key={item.value}
									control={control}
									name={name}
									render={({ field: { onChange, value } }) => {
										const checked =
											Array.isArray(value) && value.includes(item.value)
										return (
											<div className="flex items-center space-x-2">
												<Checkbox
													id={`${name}-${item.value}`}
													checked={checked}
													onCheckedChange={(isChecked) => {
														const current = Array.isArray(value) ? value : []
														if (isChecked) onChange([...current, item.value])
														else
															onChange(
																current.filter((val) => val !== item.value),
															)
													}}
												/>
												<Label
													htmlFor={`${name}-${item.value}`}
													className="font-normal"
												>
													{item.label}
												</Label>
											</div>
										)
									}}
								/>
							))}
						</div>
					</FieldWrapper>
				)
			}

			if (type === 'searchSelect') {
				return (
					<FieldWrapper key={name} {...wrapperProps}>
						<Controller
							control={control}
							name={name}
							render={({ field: { onChange, value } }) => (
								<SearchSelect
									options={options || []}
									value={value}
									onChange={onChange}
									placeholder={placeholder || 'Selecione uma opção...'}
									searchPlaceholder={field.searchPlaceholder || 'Buscar...'}
									multiple={field.multiple || false}
									disabled={disabled}
									className={cn(
										errorMessage && 'border-red-500 focus-visible:ring-red-500',
									)}
								/>
							)}
						/>
					</FieldWrapper>
				)
			}

			if (type === 'custom') {
				return (
					<FieldWrapper key={name} {...wrapperProps}>
						{field.render && typeof field.render === 'function' ? (
							field.render()
						) : (
							<div className="text-red-500 text-sm">
								Campo customizado sem função render()
							</div>
						)}
					</FieldWrapper>
				)
			}

			return null
		}

		return (
			<div className="w-full">
				<form
					onSubmit={handleSubmit(onSubmit)}
					className="grid grid-cols-12 gap-3 sm:gap-4 md:gap-6"
				>
					{fields.map(renderField)}
					{showSubmitButton && (
						<div className="col-span-12 mt-4 flex justify-end">
							<Button
								type="submit"
								disabled={isLoading}
								className="w-full md:w-auto"
							>
								{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
								{submitLabel}
							</Button>
						</div>
					)}
				</form>
			</div>
		)
	},
)

Form.displayName = 'Form'

export default Form
