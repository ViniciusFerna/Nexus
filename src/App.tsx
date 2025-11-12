import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SimpleLayout } from "@/components/SimpleLayout";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Vehicles from "./pages/Vehicles";
import RoutesPage from "./pages/RoutesPage";
import Cargo from "./pages/Cargo";
import Viagens from "./pages/Viagens";
import ViagemDetalhe from "@/pages/ViagemDetalhe";
import Reports from "./pages/Reports";
import Simulations from "./pages/Simulations";
import SimulationCreate from "./pages/SimulationCreate";
import SimulationCompare from "./pages/SimulationCompare";
import Settings from "@/pages/Settings";
import Custos from "@/pages/Custos";
import Parameters from "@/pages/Parameters";
import ParametrosGlobais from "@/pages/ParametrosGlobais";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<ProtectedRoute><SimpleLayout><Index /></SimpleLayout></ProtectedRoute>} />
            <Route path="/vehicles" element={<ProtectedRoute><SimpleLayout><Vehicles /></SimpleLayout></ProtectedRoute>} />
            <Route path="/routes" element={<ProtectedRoute><SimpleLayout><RoutesPage /></SimpleLayout></ProtectedRoute>} />
            <Route path="/viagens" element={<ProtectedRoute><SimpleLayout><Viagens /></SimpleLayout></ProtectedRoute>} />
            <Route path="/viagens/:id" element={<ProtectedRoute><SimpleLayout><ViagemDetalhe /></SimpleLayout></ProtectedRoute>} />
            <Route path="/cargo" element={<ProtectedRoute><SimpleLayout><Cargo /></SimpleLayout></ProtectedRoute>} />
            <Route path="/simulations" element={<ProtectedRoute><SimpleLayout><Simulations /></SimpleLayout></ProtectedRoute>} />
            <Route path="/simulations/create" element={<ProtectedRoute><SimpleLayout><SimulationCreate /></SimpleLayout></ProtectedRoute>} />
            <Route path="/simulations/compare/:id" element={<ProtectedRoute><SimpleLayout><SimulationCompare /></SimpleLayout></ProtectedRoute>} />
            <Route path="/custos" element={<ProtectedRoute><SimpleLayout><Custos /></SimpleLayout></ProtectedRoute>} />
            <Route path="/parameters" element={<ProtectedRoute><SimpleLayout><Parameters /></SimpleLayout></ProtectedRoute>} />
            <Route path="/parametros-globais" element={<ProtectedRoute><SimpleLayout><ParametrosGlobais /></SimpleLayout></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><SimpleLayout><Reports /></SimpleLayout></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><SimpleLayout><Settings /></SimpleLayout></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
</QueryClientProvider>
);

export default App;
