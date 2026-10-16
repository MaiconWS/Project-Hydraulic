-- Restore the pre-migration state if the application behavior regresses.
alter table public.pecas disable row level security;
