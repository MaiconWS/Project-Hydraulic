-- Rollback para restaurar leitura pública do catálogo de peças.
alter policy "Enable read access for all users"
on public.pecas
to public;
