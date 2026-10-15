-- Only Aprovisionador/Admin can mark request items as delivered.
alter policy "atualizar itens"
on public.solicitacao_itens
to authenticated
using (private.perfil_atual() in ('Aprovisionador', 'Admin'))
with check (private.perfil_atual() in ('Aprovisionador', 'Admin'));
