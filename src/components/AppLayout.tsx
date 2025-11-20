import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "@/hooks/useAuth"
import { LogOut, Truck, Route, MapPin, Play, DollarSign, BarChart3, Package, Home } from "lucide-react"
import { ReactNode, useMemo } from "react"
import { useNavigate, useLocation, Link } from "react-router-dom"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import nexusLogo from "@/assets/nexus-logo.png"

interface AppLayoutProps {
  children: ReactNode
}

const menuItems = [
  { 
    title: "Veículos", 
    url: "/vehicles", 
    icon: Truck,
    bgClass: "bg-primary/20 hover:bg-primary/30",
    iconClass: "text-primary",
    shadowClass: "group-hover:shadow-primary/50"
  },
  { 
    title: "Rotas", 
    url: "/routes", 
    icon: Route,
    bgClass: "bg-success/20 hover:bg-success/30",
    iconClass: "text-success",
    shadowClass: "group-hover:shadow-success/50"
  },
  { 
    title: "Cargas", 
    url: "/cargo", 
    icon: Package,
    bgClass: "bg-amber-500/20 hover:bg-amber-500/30",
    iconClass: "text-amber-700",
    shadowClass: "group-hover:shadow-amber-500/50"
  },
  { 
    title: "Viagens", 
    url: "/viagens", 
    icon: MapPin,
    bgClass: "bg-warning/20 hover:bg-warning/30",
    iconClass: "text-warning",
    shadowClass: "group-hover:shadow-warning/50"
  },
  { 
    title: "Simulações", 
    url: "/simulations", 
    icon: Play,
    bgClass: "bg-primary/20 hover:bg-primary/30",
    iconClass: "text-primary",
    shadowClass: "group-hover:shadow-primary/50"
  },
  { 
    title: "Parâmetros", 
    url: "/custos", 
    icon: DollarSign,
    bgClass: "bg-success/20 hover:bg-success/30",
    iconClass: "text-success",
    shadowClass: "group-hover:shadow-success/50"
  },
  { 
    title: "Relatórios", 
    url: "/reports", 
    icon: BarChart3,
    bgClass: "bg-warning/20 hover:bg-warning/30",
    iconClass: "text-warning",
    shadowClass: "group-hover:shadow-warning/50"
  },
];

export function AppLayout({ children }: AppLayoutProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const getUserInitials = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name
        .split(' ')
        .map((name: string) => name[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return user?.email?.[0]?.toUpperCase() || 'U';
  };

  const getPageTitle = (pathname: string): string => {
    const routes: Record<string, string> = {
      '/': 'Início',
      '/vehicles': 'Veículos',
      '/routes': 'Rotas',
      '/cargo': 'Cargas',
      '/viagens': 'Viagens',
      '/simulations': 'Simulações',
      '/simulations/create': 'Nova Simulação',
      '/simulations/compare': 'Comparar Simulações',
      '/custos': 'Parâmetros',
      '/parameters': 'Parâmetros',
      '/parametros-globais': 'Parâmetros Globais',
      '/reports': 'Relatórios',
      '/settings': 'Configurações',
    };
    return routes[pathname] || 'Página';
  };

  const breadcrumbs = useMemo(() => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const crumbs = [{ label: 'Início', path: '/' }];
    
    let currentPath = '';
    pathSegments.forEach((segment) => {
      currentPath += `/${segment}`;
      crumbs.push({
        label: getPageTitle(currentPath),
        path: currentPath,
      });
    });
    
    return crumbs;
  }, [location.pathname]);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col relative">
          {/* Watermark */}
          <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-0">
            <img 
              src={nexusLogo} 
              alt="" 
              className="w-[500px] h-[500px] object-contain opacity-[0.05]"
            />
          </div>
          {/* Header */}
          <header className="h-14 flex items-center border-b bg-card px-4 gap-4">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
            <div className="flex-1">
              <h1 className="text-lg font-semibold text-foreground">
                NEXUS
              </h1>
            </div>
            
            {/* User Menu */}
            <div className="flex items-center gap-3">
              <p className="text-sm font-medium leading-none">
                {user?.user_metadata?.full_name || user?.email}
              </p>
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <Button
                variant="ghost"
                size="sm"
                onClick={signOut}
                className="gap-2 text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:block">Sair</span>
              </Button>
            </div>
          </header>

          {/* Icon Menu - Horizontal - Only show on non-home pages */}
          {location.pathname !== '/' && (
            <div className="border-b bg-card/50 py-4 relative z-10">
              <div className="px-6">
                <div className="flex gap-6 justify-center flex-wrap">
                  {menuItems.map((item) => (
                    <button
                      key={item.title}
                      onClick={() => navigate(item.url)}
                      className={`flex flex-col items-center gap-2 group transition-all hover:scale-110 ${
                        location.pathname === item.url || location.pathname.startsWith(item.url + '/') 
                          ? 'opacity-100' 
                          : 'opacity-60 hover:opacity-100'
                      }`}
                    >
                      <div className={`
                        w-14 h-14 rounded-full 
                        ${item.bgClass}
                        flex items-center justify-center 
                        transition-all duration-300
                        shadow-lg hover:shadow-xl
                        ${item.shadowClass}
                        ${location.pathname === item.url || location.pathname.startsWith(item.url + '/') 
                          ? 'ring-2 ring-primary ring-offset-2' 
                          : ''
                        }
                      `}>
                        <item.icon className={`w-7 h-7 ${item.iconClass}`} />
                      </div>
                      <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors uppercase tracking-wide">
                        {item.title}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Breadcrumbs - Only show on non-home pages */}
          {location.pathname !== '/' && (
            <div className="bg-background border-b min-h-[52px] flex items-center relative z-10">
              <div className="px-6 py-3 w-full">
                <Breadcrumb>
                  <BreadcrumbList>
                    {breadcrumbs.map((crumb, index) => {
                      const isLast = index === breadcrumbs.length - 1;
                      return (
                        <div key={crumb.path} className="contents">
                          <BreadcrumbItem>
                            {isLast ? (
                              <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                            ) : (
                              <BreadcrumbLink asChild>
                                <Link to={crumb.path}>{crumb.label}</Link>
                              </BreadcrumbLink>
                            )}
                          </BreadcrumbItem>
                          {!isLast && <BreadcrumbSeparator />}
                        </div>
                      );
                    })}
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
            </div>
          )}

          {/* Main Content */}
          <main className="flex-1 p-6 relative z-10">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}