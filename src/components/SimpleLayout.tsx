import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/useAuth"
import { useRole } from "@/hooks/useRole"
import { LogOut, Truck, Route, MapPin, Play, DollarSign, BarChart3, Users, Home } from "lucide-react"
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

interface SimpleLayoutProps {
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
    title: "Custos", 
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
  { 
    title: "Usuários", 
    url: "/users", 
    icon: Users,
    bgClass: "bg-primary/20 hover:bg-primary/30",
    iconClass: "text-primary",
    shadowClass: "group-hover:shadow-primary/50"
  },
];

export function SimpleLayout({ children }: SimpleLayoutProps) {
  const { user, signOut } = useAuth();
  const { role } = useRole();
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

  const getRoleLabel = (role: string | null) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'docente':
        return 'Docente';
      case 'aluno':
        return 'Aluno';
      default:
        return 'Usuário';
    }
  };

  const getRoleColor = (role: string | null) => {
    switch (role) {
      case 'admin':
        return 'bg-red-500/10 text-red-700 border-red-200';
      case 'docente':
        return 'bg-blue-500/10 text-blue-700 border-blue-200';
      case 'aluno':
        return 'bg-green-500/10 text-green-700 border-green-200';
      default:
        return 'bg-gray-500/10 text-gray-700 border-gray-200';
    }
  };

  const getPageTitle = (pathname: string): string => {
    const routes: Record<string, string> = {
      '/': 'Início',
      '/vehicles': 'Veículos',
      '/routes': 'Rotas',
      '/viagens': 'Viagens',
      '/simulations': 'Simulações',
      '/simulations/create': 'Nova Simulação',
      '/simulations/compare': 'Comparar Simulações',
      '/custos': 'Custos',
      '/custos/fixos': 'Custos Fixos',
      '/custos/variaveis': 'Custos Variáveis',
      '/pedagios': 'Pedágios',
      '/cargo': 'Carga',
      '/parameters': 'Parâmetros',
      '/parametros-globais': 'Parâmetros Globais',
      '/reports': 'Relatórios',
      '/users': 'Usuários',
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
    <div className="min-h-screen bg-background">
      {/* Header - Fixed height to prevent layout shift */}
      <header className="border-b bg-card px-6 py-4 h-[72px] flex items-center">
        <div className="flex items-center justify-between max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Truck className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">TMS Didático — SENAI</h1>
              <p className="text-xs text-muted-foreground">Sistema Educacional</p>
            </div>
          </div>
          
          {/* User Menu */}
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end gap-1">
              <p className="text-sm font-medium leading-none">
                {user?.user_metadata?.full_name || user?.email}
              </p>
              <Badge className={getRoleColor(role)}>
                {getRoleLabel(role)}
              </Badge>
            </div>
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
        </div>
      </header>

      {/* Icon Menu - Only show on non-home pages - Fixed height to prevent layout shift */}
      {location.pathname !== '/' && (
        <>
          <div className="border-b bg-card/50 py-6 min-h-[140px] flex items-center">
            <div className="max-w-7xl mx-auto px-6 w-full">
              <div className="flex gap-6 justify-center flex-wrap">
                {menuItems.map((item) => (
                  <button
                    key={item.title}
                    onClick={() => navigate(item.url)}
                    className={`flex flex-col items-center gap-2 group transition-all hover:scale-110 ${
                      location.pathname === item.url ? 'opacity-100' : 'opacity-60 hover:opacity-100'
                    }`}
                  >
                    <div className={`
                      w-16 h-16 rounded-full 
                      ${item.bgClass}
                      flex items-center justify-center 
                      transition-all duration-300
                      shadow-lg hover:shadow-xl
                      ${item.shadowClass}
                      ${location.pathname === item.url ? 'ring-2 ring-primary ring-offset-2' : ''}
                    `}>
                      <item.icon className={`w-8 h-8 ${item.iconClass}`} />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors uppercase tracking-wide">
                      {item.title}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {/* Breadcrumbs - Fixed height to prevent layout shift */}
          <div className="bg-background border-b min-h-[52px] flex items-center">
            <div className="max-w-7xl mx-auto px-6 py-3 w-full">
              <Breadcrumb>
                <BreadcrumbList>
                  {breadcrumbs.map((crumb, index) => {
                    const isLast = index === breadcrumbs.length - 1;
                    return (
                      <>
                        <BreadcrumbItem key={crumb.path}>
                          {isLast ? (
                            <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                          ) : (
                            <BreadcrumbLink asChild>
                              <Link to={crumb.path}>{crumb.label}</Link>
                            </BreadcrumbLink>
                          )}
                        </BreadcrumbItem>
                        {!isLast && <BreadcrumbSeparator key={`sep-${index}`} />}
                      </>
                    );
                  })}
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </div>
        </>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-6">
        {children}
      </main>
    </div>
  )
}
