-- Rollback para o estado imediatamente anterior: authenticated com USING (true).
alter policy "usuario"
on public.usuarios
to authenticated
using (true);
