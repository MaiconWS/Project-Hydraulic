-- Rollback para restaurar o estado anterior desta etapa.
alter policy "atualizar itens"
on public.solicitacao_itens
to anon, authenticated;
