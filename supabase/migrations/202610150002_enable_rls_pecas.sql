-- Enable the existing authenticated SELECT and Admin INSERT policies.
-- Rollback: supabase/rollback/disable_rls_pecas.sql
alter table public.pecas enable row level security;
