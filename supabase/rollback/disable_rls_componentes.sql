-- Restore the pre-migration state if the application behavior regresses.
alter table public.componentes disable row level security;
