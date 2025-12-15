import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { AlertCircle, CalendarIcon, Loader2 } from 'lucide-react'
import React, { useEffect, useImperativeHandle, useMemo } from 'react'
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
		// --- 1. GERAÇÃO DE SCHEMA (Lógica Mantida e Adaptada) ---
		const generatedSchema = useMemo(() => {
			if (schema) return schema
			const shape = {}

			fields.forEach((field) => {
				// Se tiver condição, começamos como optional, pois pode estar oculto
				let baseSchema

				// Simplificação da lógica de schema para brevidade, mantendo a robustez original
				switch (field.type) {
					case 'email':
						baseSchema = z.string().email('E-mail inválido')
						if (!field.required) baseSchema = baseSchema.or(z.literal(''))
						break
					case 'number':
						// Na web, inputs number retornam string vazia ou string numérica.
						// Usamos valueAsNumber no register, que retorna NaN se vazio.
						baseSchema = z.number({ invalid_type_error: 'Deve ser um número' })
						if (!field.required) baseSchema = baseSchema.or(z.nan()).optional()
						break
					case 'date':
					case 'datetime':
						baseSchema = z.date({ required_error: 'Selecione uma data' })
						if (!field.required) baseSchema = baseSchema.optional().nullable()
						break
					case 'boolean':
					case 'switch':
						baseSchema = z.boolean()
						if (field.mustBeTrue)
							baseSchema = baseSchema.refine(
								(val) => val === true,
								'Obrigatório',
							)
						if (!field.required) baseSchema = baseSchema.optional()
						break
					case 'checkbox-group':
					case 'searchPicker': // Multi
						if (field.multiSelect) {
							baseSchema = z.array(z.union([z.string(), z.number()]))
							if (field.required)
								baseSchema = baseSchema.min(1, 'Selecione pelo menos uma opção')
						} else {
							baseSchema = z.string()
						}
						break
					default: // text, textarea, select (string), radio
						baseSchema = z.string()
						if (field.required)
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

		// Memoização dos valores padrão
		const defaultValues = useMemo(() => {
			return fields.reduce((acc, field) => {
				if (data && data[field.name] !== undefined) {
					// Tratamento especial para datas vindas de string ISO
					if (
						(field.type === 'date' || field.type === 'datetime') &&
						typeof data[field.name] === 'string'
					) {
						acc[field.name] = new Date(data[field.name])
					} else {
						acc[field.name] = data[field.name]
					}
				} else {
					// Defaults base
					switch (field.type) {
						case 'switch':
						case 'boolean':
							return false
						case 'checkbox-group':
						case 'searchPicker':
							return field.multiSelect ? [] : ''
						case 'number':
							return '' // Input number uncontrolled lida melhor com string vazia
						default:
							return ''
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

		// Sync data prop
		useEffect(() => {
			if (data) {
				// Lógica simplificada de reset inteligente
				Object.keys(data).forEach((key) => {
					let val = data[key]
					// Convert strings to Date objects for Shadcn Calendar
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
				})
			}
		}, [data, setValue, fields])

		// Watch changes
		useEffect(() => {
			const subscription = watch((value) => onChange(value))
			return () => subscription.unsubscribe()
		}, [watch, onChange])

		const formValues = watch() // Necessário para campos condicionais

		// --- 4. RENDERIZADORES ---

		const renderField = (field) => {
			// 1. Lógica Condicional
			if (field.condition && typeof field.condition === 'function') {
				if (!field.condition(formValues)) return null
			}
			if (field.hidden) return null

			const { name, label, type, required, placeholder, disabled, options } =
				field
			const errorMessage = errors[name]?.message

			// Grid Setup
			const cols = field.cols || 12
			// Classes de grid responsivas (mobile 12, desktop usa o cols definido)
			const gridClass =
				cols === 12 ? 'col-span-12' : `col-span-12 md:col-span-${cols}`

			// Common Wrapper
			const Wrapper = ({ children }) => (
				<div className={`${gridClass} space-y-2`}>
					{type !== 'boolean' && type !== 'switch' && type !== 'checkbox' && (
						<Label
							htmlFor={name}
							className={cn(errorMessage && 'text-red-500')}
						>
							{label}{' '}
							{required && showRequiredIndicator && (
								<span className="text-red-500">*</span>
							)}
						</Label>
					)}
					{children}
					<ErrorMessage error={errorMessage} />
				</div>
			)

			// --- STRATEGY: REGISTER (Performance Nativa) ---
			// Usado para inputs que suportam ref nativo HTML

			if (
				type === 'text' ||
				type === 'email' ||
				type === 'password' ||
				type === 'tel'
			) {
				return (
					<Wrapper key={name}>
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
					</Wrapper>
				)
			}

			if (type === 'number') {
				return (
					<Wrapper key={name}>
						<Input
							id={name}
							type="number"
							placeholder={placeholder}
							disabled={disabled}
							className={cn(
								errorMessage && 'border-red-500 focus-visible:ring-red-500',
							)}
							{...register(name, { valueAsNumber: true })}
						/>
					</Wrapper>
				)
			}

			if (type === 'textarea') {
				return (
					<Wrapper key={name}>
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
					</Wrapper>
				)
			}

			// --- STRATEGY: CONTROLLER (Componentes Shadcn Complexos) ---
			// Shadcn Select, Calendar, Switch não usam inputs nativos

			if (type === 'select' || type === 'picker') {
				return (
					<Wrapper key={name}>
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
					</Wrapper>
				)
			}

			if (type === 'date' || type === 'datetime') {
				return (
					<Wrapper key={name}>
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
					</Wrapper>
				)
			}

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
					<Wrapper key={name}>
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
					</Wrapper>
				)
			}

			// Checkbox Single (Boolean)
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
								{label} {required && <span className="text-red-500">*</span>}
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

			// Checkbox Group (Multi Select)
			if (type === 'checkbox-group') {
				return (
					<Wrapper key={name}>
						<div className="grid gap-2">
							{options?.map((item) => (
								<Controller
									key={item.value}
									control={control}
									name={name}
									render={({ field: { onChange, value } }) => {
										// Value é um array aqui
										const checked =
											Array.isArray(value) && value.includes(item.value)

										return (
											<div className="flex items-center space-x-2">
												<Checkbox
													id={`${name}-${item.value}`}
													checked={checked}
													onCheckedChange={(isChecked) => {
														const current = Array.isArray(value) ? value : []
														if (isChecked) {
															onChange([...current, item.value])
														} else {
															onChange(
																current.filter((val) => val !== item.value),
															)
														}
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
					</Wrapper>
				)
			}

			return null
		}

		return (
			<div className="w-full">
				{/* Container Grid */}
				<form
					onSubmit={handleSubmit(onSubmit)}
					className="grid grid-cols-12 gap-6"
				>
					{fields.map(renderField)}

					{/* Botão de Submit */}
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
