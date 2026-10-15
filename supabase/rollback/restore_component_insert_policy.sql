-- Rollback para restaurar a policy original de INSERT em public.componentes.
alter policy "insert component"
on public.componentes
to anon, authenticated
with check (true);
