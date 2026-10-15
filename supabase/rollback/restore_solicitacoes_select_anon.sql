-- Rollback para restaurar leitura anon/autenticada anterior.
alter policy "visão das solicitações"
on public.solicitacoes
to anon, authenticated;
