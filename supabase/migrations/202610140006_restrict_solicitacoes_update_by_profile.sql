-- Only Aprovisionador/Admin can change workflow status in the requests screen.
alter policy "Atualizar dados da solicitação"
on public.solicitacoes
to authenticated
using (private.perfil_atual() in ('Aprovisionador', 'Admin'))
with check (private.perfil_atual() in ('Aprovisionador', 'Admin'));
