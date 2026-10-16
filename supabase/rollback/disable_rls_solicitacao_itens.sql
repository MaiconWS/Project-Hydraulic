-- Restore the pre-migration state if the application or CRR integration regresses.
alter table public.solicitacao_itens disable row level security;
