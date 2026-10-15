-- Request reads remain available to every signed-in profile. The checklist
-- reads back its newly inserted request; anonymous callers no longer can read.
alter policy "visão das solicitações"
on public.solicitacoes
to authenticated;
