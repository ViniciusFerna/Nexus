import { 
  Truck, 
  Route, 
  Play,
  BarChart3, 
  Home,
  Users,
  DollarSign,
  MapPin,
  Package
} from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const mainItems = [
  { title: "Início", url: "/", icon: Home },
  { title: "Veículos", url: "/vehicles", icon: Truck },
  { title: "Rotas", url: "/routes", icon: Route },
  { title: "Cargas", url: "/cargo", icon: Package },
  { title: "Viagens", url: "/viagens", icon: MapPin },
  { title: "Simulações", url: "/simulations", icon: Play },
]

const managementItems = [
  { title: "Parâmetros", url: "/custos", icon: DollarSign },
  { title: "Relatórios", url: "/reports", icon: BarChart3 },
]

export function AppSidebar() {
  const location = useLocation()
  const currentPath = location.pathname

  const isActive = (path: string) => currentPath === path
  
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-primary text-primary-foreground font-semibold hover:bg-primary-hover transition-colors" 
      : "text-sidebar-foreground/90 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"

  return (
    <Sidebar className="w-64">
      <SidebarContent className="bg-sidebar border-sidebar-border border-r">
        {/* Logo/Brand */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Truck className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-sidebar-foreground">NEXUS</h2>
              <p className="text-xs text-sidebar-foreground/60">Logistics Simulation</p>
            </div>
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/70 font-semibold text-xs uppercase tracking-wide">Sistema</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end 
                      className={getNavCls}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/70 font-semibold text-xs uppercase tracking-wide">Administração</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {managementItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end 
                      className={getNavCls}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}