import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import { useToast } from "@/hooks/use-toast";
import { Users as UsersIcon, Mail, Calendar, Shield, Edit2, Check, X } from "lucide-react";

interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'docente' | 'aluno';
  created_at: string;
}

interface UserWithRole {
  user_id: string;
  email?: string;
  role: 'admin' | 'docente' | 'aluno';
  role_id: string;
  created_at: string;
}

export default function Users() {
  const { user } = useAuth();
  const { role: currentUserRole } = useRole();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [newRole, setNewRole] = useState<'admin' | 'docente' | 'aluno'>('aluno');

  useEffect(() => {
    if (currentUserRole === 'admin') {
      fetchUsers();
    }
  }, [currentUserRole]);

  const fetchUsers = async () => {
    try {
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('id, user_id, role, created_at')
        .order('created_at', { ascending: false });

      if (rolesError) {
        console.error('Error fetching user roles:', rolesError);
        toast({
          title: "Erro ao carregar usuários",
          description: rolesError.message,
          variant: "destructive",
        });
        return;
      }

      const usersWithRoles = rolesData?.map(role => ({
        user_id: role.user_id,
        email: undefined, // Email não disponível via admin API
        role: role.role as 'admin' | 'docente' | 'aluno',
        role_id: role.id,
        created_at: role.created_at
      })) || [];

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (userId: string, roleId: string) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ role: newRole })
        .eq('id', roleId);

      if (error) throw error;

      toast({
        title: "Papel atualizado",
        description: "O papel do usuário foi atualizado com sucesso.",
      });

      setEditingUserId(null);
      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar papel",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'docente':
        return 'default';
      case 'aluno':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getRoleText = (role: string) => {
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

  const getInitials = (fullName: string | null, email?: string) => {
    if (fullName) {
      return fullName
        .split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return email?.[0]?.toUpperCase() || 'U';
  };

  if (currentUserRole !== 'admin') {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Acesso Negado</h1>
          <p className="text-muted-foreground">Você não tem permissão para acessar esta página.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Usuários</h1>
          <p className="text-muted-foreground">Carregando usuários...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2 min-h-[80px]">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <UsersIcon className="h-8 w-8" />
          Usuários do Sistema
        </h1>
        <p className="text-muted-foreground">
          Gerencie os usuários cadastrados no sistema TMS Educacional
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Administradores</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.role === 'admin').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Docentes</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.role === 'docente').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alunos</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.role === 'aluno').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {users.map((userWithRole) => (
          <Card key={userWithRole.user_id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                      {getInitials(null, userWithRole.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <CardTitle className="text-base truncate">
                      {userWithRole.email || 'Email não disponível'}
                    </CardTitle>
                    {editingUserId === userWithRole.user_id ? (
                      <div className="flex items-center gap-2">
                        <Select value={newRole} onValueChange={(value: any) => setNewRole(value)}>
                          <SelectTrigger className="h-7 w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="aluno">Aluno</SelectItem>
                            <SelectItem value="docente">Docente</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-7 w-7 p-0"
                          onClick={() => handleUpdateRole(userWithRole.user_id, userWithRole.role_id)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-7 w-7 p-0"
                          onClick={() => setEditingUserId(null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Badge variant={getRoleColor(userWithRole.role)}>
                          {getRoleText(userWithRole.role)}
                        </Badge>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-6 w-6 p-0"
                          onClick={() => {
                            setEditingUserId(userWithRole.user_id);
                            setNewRole(userWithRole.role);
                          }}
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2 text-sm">
                {userWithRole.email && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{userWithRole.email}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Cadastrado em {new Date(userWithRole.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {users.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <UsersIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <CardTitle className="mb-2">Nenhum usuário encontrado</CardTitle>
            <CardDescription>
              Quando outros usuários se cadastrarem, eles aparecerão aqui.
            </CardDescription>
          </CardContent>
        </Card>
      )}
    </div>
  );
}