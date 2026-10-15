-- Authentication passwords belong exclusively to Supabase Auth.
-- Keep the legacy column nullable during transition so profile inserts can omit it.
alter table public.usuarios
    alter column senha drop not null;

comment on column public.usuarios.senha is
    'Deprecated. Passwords are managed exclusively by Supabase Auth; do not write to this column.';
