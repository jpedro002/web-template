'use client'

import { Command } from 'lucide-react'
import { useEffect, useState } from 'react'
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarRail,
} from 'src/components/ui/sidebar'
import { NavMain } from 'src/layout/components/nav-main'
import { NavUser } from 'src/layout/components/nav-user'

// Dados de navegação com permissões organizados por módulos
const data = {
	navMain: [
		{
			title: 'Segurança',
			icon: 'Shield',
			permission: null, // Módulo raiz sem permissão específica
			items: [
				{
					title: 'Usuários',
					url: '/seguranca/usuarios',
					icon: 'Users',
					permission: 'users:read',
				},
				{
					title: 'Roles',
					url: '/seguranca/roles',
					icon: 'Shield',
					permission: 'roles:read',
				},
				{
					title: 'Permissões',
					url: '/seguranca/permissoes',
					icon: 'Lock',
					permission: 'permissions:read',
				},
			],
		},
	],
}

export function AppSidebar({ ...props }) {
	const [defaultOpen, setDefaultOpen] = useState(true)

	useEffect(() => {
		// Definir sidebar colapsada por padrão em telas menores que lg (1024px)
		const handleResize = () => {
			setDefaultOpen(window.innerWidth >= 1024)
		}

		// Executar na inicialização
		handleResize()

		// Adicionar listener para mudanças de tamanho
		window.addEventListener('resize', handleResize)
		return () => window.removeEventListener('resize', handleResize)
	}, [])

	return (
		<Sidebar collapsible="icon" defaultOpen={defaultOpen} {...props}>
			<SidebarHeader className="flex flex-row">
				<div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
					<Command className="size-4" />
				</div>
				<div className="grid flex-1 text-left text-sm leading-tight">
					<span className="truncate font-semibold">Seu App</span>
					<span className="truncate text-xs">v1.0</span>
				</div>
			</SidebarHeader>
			<SidebarContent>
				<NavMain items={data.navMain} />
			</SidebarContent>
			<SidebarFooter>
				<NavUser />
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	)
}
