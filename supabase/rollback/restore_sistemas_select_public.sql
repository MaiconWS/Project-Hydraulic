-- Rollback para restaurar leitura pública de public.sistemas.
alter policy "Enable read access for all users"
on public.sistemas
to public;
