-- Rollback para o estado imediatamente anterior: authenticated com condições true.
alter policy "Atualizar dados da solicitação"
on public.solicitacoes
to authenticated
using (true)
with check (true);
