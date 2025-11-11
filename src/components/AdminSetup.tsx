import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRole } from '@/hooks/useRole';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Shield, UserPlus } from 'lucide-react';

export function AdminSetup() {
  const { user } = useAuth();
  const { role } = useRole();
  const [isFirstUser, setIsFirstUser] = useState(false);
  const [loading, setLoading] = useState(true);
  const [promoting, setPromoting] = useState(false);

  useEffect(() => {
    checkIfFirstUser();
  }, [user]);

  const checkIfFirstUser = async () => {
    if (!user) return;

    try {
      // Check if there are any admins in the system
      const { data: admins, error } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'admin')
        .limit(1);

      if (error) {
        console.error('Error checking for admins:', error);
        return;
      }

      // If no admins exist and current user is not admin, show promotion option
      setIsFirstUser(admins.length === 0 && role !== 'admin');
    } catch (error) {
      console.error('Error checking first user:', error);
    } finally {
      setLoading(false);
    }
  };

  const promoteToAdmin = async () => {
    if (!user) return;

    setPromoting(true);
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ role: 'admin' })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Parabéns!",
        description: "Você foi promovido a Administrador do sistema.",
      });

      // Refresh the page to update role context
      window.location.reload();
    } catch (error) {
      console.error('Error promoting to admin:', error);
      toast({
        title: "Erro",
        description: "Não foi possível promover o usuário a administrador.",
        variant: "destructive",
      });
    } finally {
      setPromoting(false);
    }
  };

  if (loading) {
    return null;
  }

  if (!isFirstUser) {
    return null;
  }

  return (
    <Card className="border-primary/20 bg-primary/5 mb-6">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <CardTitle>Configuração Inicial do Sistema</CardTitle>
        </div>
        <CardDescription>
          Este parece ser o primeiro acesso ao sistema. Como o primeiro usuário, 
          você pode se tornar o administrador do TMS Didático — SENAI.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Badge variant="outline">Seu papel atual: Aluno</Badge>
          <span className="text-sm text-muted-foreground">→</span>
          <Badge className="bg-red-500/10 text-red-700 border-red-200">
            Administrador
          </Badge>
        </div>
        
        <div className="text-sm text-muted-foreground space-y-1">
          <p><strong>Como administrador, você poderá:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Gerenciar usuários e definir papéis (Admin, Docente, Aluno)</li>
            <li>Acessar todas as funcionalidades do sistema</li>
            <li>Configurar parâmetros do sistema</li>
            <li>Gerar relatórios completos</li>
          </ul>
        </div>

        <Button 
          onClick={promoteToAdmin}
          disabled={promoting}
          className="gap-2"
        >
          <UserPlus className="h-4 w-4" />
          {promoting ? 'Promovendo...' : 'Tornar-me Administrador'}
        </Button>
      </CardContent>
    </Card>
  );
}