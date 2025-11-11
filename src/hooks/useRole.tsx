import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

type UserRole = 'admin' | 'docente' | 'aluno' | null;

interface RoleContextType {
  role: UserRole;
  loading: boolean;
  hasPermission: (action: string, entity?: string) => boolean;
  canCreate: (entity: string) => boolean;
  canRead: (entity: string) => boolean;
  canUpdate: (entity: string) => boolean;
  canDelete: (entity: string) => boolean;
}

const RoleContext = createContext<RoleContextType>({} as RoleContextType);

const PERMISSIONS = {
  admin: {
    all: true // Admin can do everything
  },
  docente: {
    vehicles: ['create', 'read', 'update', 'delete'],
    routes: ['create', 'read', 'update', 'delete'],
    cargo: ['create', 'read', 'update', 'delete'],
    trips: ['create', 'read', 'update', 'delete'],
    custos_fixos: ['create', 'read', 'update', 'delete'],
    custos_variaveis: ['create', 'read', 'update', 'delete'],
    pedagios: ['create', 'read', 'update', 'delete'],
    parametros_globais: ['read', 'update'],
    calculos: ['create', 'read', 'update', 'delete'],
    calculator: ['create', 'read', 'update', 'delete'],
    simulations: ['create', 'read', 'update', 'delete'],
    reports: ['create', 'read', 'update', 'delete'],
    parameters: ['read', 'update']
  },
  aluno: {
    vehicles: ['read'],
    routes: ['read'],
    cargo: ['read'],
    trips: ['read'],
    custos_fixos: ['read'],
    custos_variaveis: ['read'],
    pedagios: ['read'],
    parametros_globais: ['read'],
    calculos: ['read'],
    calculator: ['read'],
    simulations: ['create', 'read'],
    reports: ['read'],
    parameters: ['read']
  }
};

export function RoleProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !user) {
      setLoading(authLoading);
      return;
    }

    const fetchUserRole = async () => {
      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error('Error fetching user role:', error);
          setRole('aluno'); // Default role
        } else {
          setRole(data?.role || 'aluno');
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
        setRole('aluno');
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [user, authLoading]);

  const hasPermission = (action: string, entity: string = ''): boolean => {
    if (!role) return false;
    
    if (role === 'admin') return true;
    
    const rolePermissions = PERMISSIONS[role as keyof typeof PERMISSIONS];
    if (!rolePermissions) return false;
    
    if ('all' in rolePermissions && rolePermissions.all) return true;
    
    const entityPermissions = rolePermissions[entity as keyof typeof rolePermissions] as string[] | undefined;
    if (!entityPermissions || !Array.isArray(entityPermissions)) return false;
    
    return entityPermissions.includes(action);
  };

  const canCreate = (entity: string): boolean => hasPermission('create', entity);
  const canRead = (entity: string): boolean => hasPermission('read', entity);
  const canUpdate = (entity: string): boolean => hasPermission('update', entity);
  const canDelete = (entity: string): boolean => hasPermission('delete', entity);

  return (
    <RoleContext.Provider value={{
      role,
      loading,
      hasPermission,
      canCreate,
      canRead,
      canUpdate,
      canDelete,
    }}>
      {children}
    </RoleContext.Provider>
  );
}

export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};