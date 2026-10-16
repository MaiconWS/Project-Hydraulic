-- Restore the pre-migration state if the application or CRR integration regresses.
alter table public.solicitacoes disable row level security;
