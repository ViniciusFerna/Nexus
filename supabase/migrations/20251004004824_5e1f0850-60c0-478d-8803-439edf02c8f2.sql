-- Garantir que todos os usuários tenham uma role atribuída
-- Se algum usuário não tiver role, atribui 'aluno' como padrão

INSERT INTO public.user_roles (user_id, role)
SELECT 
  au.id,
  'aluno'::app_role
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles ur WHERE ur.user_id = au.id
)
ON CONFLICT (user_id, role) DO NOTHING;