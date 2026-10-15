-- Rollback para restaurar exatamente a política removida em 2026-10-14.
-- Execute somente se for necessário reverter a etapa de restrição de INSERT.
-- Estado capturado no Supabase: public.usuarios, permissive, INSERT,
-- role authenticated, WITH CHECK (true).
create policy "Permitir insercao de usuarios"
on public.usuarios
as permissive
for insert
to authenticated
with check (true);
