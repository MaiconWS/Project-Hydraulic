-- Enable existing authenticated SELECT/INSERT and Aprovisionador/Admin UPDATE policies.
-- Confirm the CRR server uses service_role or an authenticated server-side path
-- before applying; anon access will be denied by RLS.
-- Rollback: supabase/rollback/disable_rls_solicitacao_itens.sql
alter table public.solicitacao_itens enable row level security;
