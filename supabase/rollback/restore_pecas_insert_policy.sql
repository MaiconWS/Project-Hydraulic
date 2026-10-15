-- Rollback para restaurar a policy original de INSERT em public.pecas.
alter policy "insert peç]ca"
on public.pecas
to anon, authenticated
with check (true);
