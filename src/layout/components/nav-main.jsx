import { ChevronRight, Lock, Shield, Users } from 'lucide-react'
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from 'src/components/ui/collapsible'
import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
	useSidebar,
} from 'src/components/ui/sidebar'
import { useHasPermission } from 'src/services/auth'

// Mapa de ícones usando lucide-react
const iconMap = {
	Users: Users,
	Shield: Shield,
	Lock: Lock,
}

export function NavMain({ items }) {
	const { state } = useSidebar()
	const isCollapsed = state === 'collapsed'

	// Filtrar subitens baseado em permissão
	const getFilteredSubItems = (subItems) => {
		if (!subItems) return []
		return subItems.filter((subItem) => {
			if (!subItem.permission) return true
			return useHasPermission(subItem.permission)
		})
	}

	// Filtrar itens baseado em permissão E se tem subitens visíveis
	const filteredItems = items.filter((item) => {
		// Se tem permissão específica, verificar
		if (item.permission && !useHasPermission(item.permission)) {
			return false
		}

		// Se tem subitens, verificar se pelo menos um é visível
		if (item.items && item.items.length > 0) {
			const visibleSubItems = getFilteredSubItems(item.items)
			return visibleSubItems.length > 0
		}

		// Item sem subitens e sem permissão específica (ou com permissão válida)
		return true
	})

	if (filteredItems.length === 0) {
		return null
	}

	return (
		<SidebarGroup>
			<SidebarGroupLabel>Menu</SidebarGroupLabel>
			<SidebarMenu>
				{filteredItems.map((item) => {
					const filteredSubItems = getFilteredSubItems(item.items)
					const IconComponent = iconMap[item.icon]
					const hasSubItems = filteredSubItems.length > 0

					// Quando colapsado e tem filhos, mostrar apenas os filhos com ícones
					if (isCollapsed && hasSubItems) {
						return (
							<div key={item.title} className="space-y-1">
								{filteredSubItems.map((subItem) => {
									const SubIconComponent = iconMap[subItem.icon]
									return (
										<SidebarMenuButton
											key={subItem.title}
											asChild
											tooltip={subItem.title}
											className="h-10 w-10 p-2 flex items-center justify-center"
										>
											<a href={subItem.url}>
												{SubIconComponent && (
													<SubIconComponent className="w-5 h-5" />
												)}
											</a>
										</SidebarMenuButton>
									)
								})}
							</div>
						)
					}

					// Comportamento normal quando expandido
					return (
						<Collapsible
							key={item.title}
							asChild
							defaultOpen={item.isActive}
							className="group/collapsible"
						>
							<SidebarMenuItem>
								<CollapsibleTrigger asChild>
									<SidebarMenuButton
										tooltip={item.title}
										className="cursor-pointer"
									>
										{IconComponent && <IconComponent className="w-4 h-4" />}
										<span>{item.title}</span>
										{hasSubItems && (
											<ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
										)}
									</SidebarMenuButton>
								</CollapsibleTrigger>
								{hasSubItems && (
									<CollapsibleContent>
										<SidebarMenuSub>
											{filteredSubItems.map((subItem) => {
												const SubIconComponent = iconMap[subItem.icon]
												return (
													<SidebarMenuSubItem key={subItem.title}>
														<SidebarMenuSubButton asChild>
															<a href={subItem.url}>
																{SubIconComponent && (
																	<SubIconComponent className="w-4 h-4" />
																)}
																<span>{subItem.title}</span>
															</a>
														</SidebarMenuSubButton>
													</SidebarMenuSubItem>
												)
											})}
										</SidebarMenuSub>
									</CollapsibleContent>
								)}
							</SidebarMenuItem>
						</Collapsible>
					)
				})}
			</SidebarMenu>
		</SidebarGroup>
	)
}
