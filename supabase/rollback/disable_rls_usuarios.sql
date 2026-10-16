-- Restore the pre-migration state if the application behavior regresses.
alter table public.usuarios disable row level security;
