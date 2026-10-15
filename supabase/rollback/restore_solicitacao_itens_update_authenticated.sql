-- Rollback para o estado imediatamente anterior: authenticated com condições true.
alter policy "atualizar itens"
on public.solicitacao_itens
to authenticated
using (true)
with check (true);
