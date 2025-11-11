import { ReactNode } from 'react';
import { useRole } from '@/hooks/useRole';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface RoleProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'docente' | 'aluno';
  requiredPermission?: {
    action: string;
    entity: string;
  };
  fallback?: ReactNode;
}

export function RoleProtectedRoute({ 
  children, 
  requiredRole, 
  requiredPermission,
  fallback 
}: RoleProtectedRouteProps) {
  const { role, hasPermission, loading } = useRole();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Check role access
  if (requiredRole && role !== requiredRole && role !== 'admin') {
    return fallback || (
      <Alert className="m-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Você não tem permissão para acessar esta página. 
          {requiredRole === 'admin' && ' Acesso restrito aos administradores.'}
          {requiredRole === 'docente' && ' Acesso restrito aos docentes.'}
          {requiredRole === 'aluno' && ' Acesso restrito aos alunos.'}
        </AlertDescription>
      </Alert>
    );
  }

  // Check permission access
  if (requiredPermission && !hasPermission(requiredPermission.action, requiredPermission.entity)) {
    return fallback || (
      <Alert className="m-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Você não tem permissão para realizar esta ação nesta seção.
        </AlertDescription>
      </Alert>
    );
  }

  return <>{children}</>;
}