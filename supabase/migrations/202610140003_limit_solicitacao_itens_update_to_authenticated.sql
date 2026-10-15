-- Keep delivery updates for signed-in users while removing anon access.
-- The application performs these updates from its authenticated Requisicoes page.
alter policy "atualizar itens"
on public.solicitacao_itens
to authenticated;
