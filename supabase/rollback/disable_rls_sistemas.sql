-- Restore the pre-migration state if the application behavior regresses.
alter table public.sistemas disable row level security;
