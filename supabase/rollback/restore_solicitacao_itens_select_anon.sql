-- Rollback para restaurar leitura anon/autenticada anterior.
alter policy "consulta"
on public.solicitacao_itens
to anon, authenticated;
