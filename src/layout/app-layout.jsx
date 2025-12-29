import { Outlet } from 'react-router'
import { SidebarInset, SidebarProvider } from 'src/components/ui/sidebar'
import { AppHeader } from 'src/layout/components/app-header'
import { AppSidebar } from 'src/layout/components/app-sidebar'

export const AppLayout = () => {
	return (
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset>
				<AppHeader />
				<main className="flex flex-1 flex-col ">
					<Outlet />
				</main>
			</SidebarInset>
		</SidebarProvider>
	)
}
