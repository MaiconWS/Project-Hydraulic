-- Enable the existing authenticated SELECT policy.
-- Rollback: supabase/rollback/disable_rls_sistemas.sql
alter table public.sistemas enable row level security;
