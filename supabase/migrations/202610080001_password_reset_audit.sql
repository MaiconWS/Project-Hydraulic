create table if not exists public.auditoria_redefinicao_senha (
    id bigint generated always as identity primary key,
    usuario_id integer references public.usuarios(id) on delete set null,
    auth_user_id uuid not null,
    redefinido_por uuid not null,
    criado_em timestamptz not null default now()
);

alter table public.auditoria_redefinicao_senha enable row level security;
revoke all on table public.auditoria_redefinicao_senha from anon, authenticated;
