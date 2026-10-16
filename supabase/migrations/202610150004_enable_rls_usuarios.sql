-- Enable the existing self-or-Admin SELECT policy.
-- User creation and password-management functions use service_role server-side.
-- Rollback: supabase/rollback/disable_rls_usuarios.sql
alter table public.usuarios enable row level security;
