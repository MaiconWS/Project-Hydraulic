-- Rollback para restaurar o estado anterior desta etapa.
alter policy "Atualizar dados da solicitação"
on public.solicitacoes
to anon, authenticated;
