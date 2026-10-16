-- Enable the existing authenticated SELECT and Admin INSERT policies.
-- Rollback: supabase/rollback/disable_rls_componentes.sql
alter table public.componentes enable row level security;
