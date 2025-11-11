
import { AdminSetup } from "@/components/AdminSetup"
import { useNavigate } from "react-router-dom"
import { 
  Truck, 
  Route, 
  MapPin, 
  Play,
  DollarSign, 
  BarChart3,
  Users
} from "lucide-react"

const Index = () => {
  const navigate = useNavigate();

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

  return (
    <div className="min-h-[80vh] flex flex-col">
      {/* Admin Setup for first user */}
      <AdminSetup />

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background rounded-3xl p-12 mb-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-primary/5 [mask-image:linear-gradient(0deg,transparent,black)]"></div>
        <div className="relative">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-4">
            TMS Didático — SENAI
          </h1>
          <p className="text-xl text-muted-foreground mb-4">
            seu sistema de simulações
          </p>
          <div className="inline-block border-2 border-primary/30 rounded-full px-6 py-2 backdrop-blur-sm">
            <p className="text-primary font-medium">
              Logística sem fronteiras, aprendizagem exponencial!
            </p>
          </div>
        </div>
      </div>

      {/* Icon Menu Grid */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-8 md:gap-12 mb-16">
          {menuItems.map((item) => (
            <button
              key={item.title}
              onClick={() => navigate(item.url)}
              className="flex flex-col items-center gap-4 group transition-all hover:scale-110"
            >
              <div className={`
                w-24 h-24 md:w-28 md:h-28 rounded-full 
                ${item.bgClass}
                flex items-center justify-center 
                transition-all duration-300
                shadow-lg hover:shadow-xl
                ${item.shadowClass}
              `}>
                <item.icon className={`w-12 h-12 md:w-14 md:h-14 ${item.iconClass}`} />
              </div>
              <span className="text-sm md:text-base font-medium text-muted-foreground group-hover:text-foreground transition-colors uppercase tracking-wide">
                {item.title}
              </span>
            </button>
          ))}
        </div>

        {/* Quick Info */}
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-muted-foreground">
            Sistema educacional de gestão de transporte para ensino de logística.
            <br />
            Selecione uma opção acima para começar.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
