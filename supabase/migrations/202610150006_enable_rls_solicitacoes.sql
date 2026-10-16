-- Enable existing authenticated SELECT/INSERT and Aprovisionador/Admin UPDATE policies.
-- Confirm the CRR server uses service_role or an authenticated server-side path
-- before applying; anon access will be denied by RLS.
-- Rollback: supabase/rollback/disable_rls_solicitacoes.sql
alter table public.solicitacoes enable row level security;
