-- Keep the existing UPDATE behavior for signed-in users while removing anon.
-- Application operations in Requisicoes/Liberadas run after Supabase Auth login.
alter policy "Atualizar dados da solicitação"
on public.solicitacoes
to authenticated;
