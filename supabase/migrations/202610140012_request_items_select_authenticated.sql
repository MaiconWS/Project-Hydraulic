-- Keep reads available to signed-in profiles while removing anonymous access.
-- Checklist inserts may request a representation, so this remains authenticated-wide.
alter policy "consulta"
on public.solicitacao_itens
to authenticated;
