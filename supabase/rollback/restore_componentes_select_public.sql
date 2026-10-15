-- Rollback para restaurar leitura pública do catálogo de componentes.
alter policy "Enable read access for all users"
on public.componentes
to public;
