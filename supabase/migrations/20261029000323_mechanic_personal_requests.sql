alter table public.solicitacoes
  add column if not exists solicitante_auth_id uuid
  references auth.users(id) on delete set null;

alter table public.solicitacao_itens
  add column if not exists peca_nova boolean not null default false;

create index if not exists solicitacoes_solicitante_auth_id_idx
  on public.solicitacoes (solicitante_auth_id);

-- Relaciona O.S. antigas ao usuário somente quando o nome aponta para uma conta única.
with solicitantes_unicos as (
  select s.id, (array_agg(distinct u.auth_user_id))[1] as auth_user_id
  from public.solicitacoes s
  join public.usuarios u
    on lower(trim(u.nome)) = lower(trim(s.solicitante_nome))
  where u.auth_user_id is not null
  group by s.id
  having count(distinct u.auth_user_id) = 1
)
update public.solicitacoes s
set solicitante_auth_id = su.auth_user_id
from solicitantes_unicos su
where s.id = su.id
  and s.solicitante_auth_id is null;

alter policy "visão das solicitações"
on public.solicitacoes
to authenticated
using (
  private.perfil_atual() in ('Aprovisionador', 'Admin')
  or solicitante_auth_id = auth.uid()
);

alter policy "usuarios autorizados podem criar solicitacoes"
on public.solicitacoes
to authenticated
with check (
  private.perfil_atual() in ('Aprovisionador', 'Admin')
  or (
    private.perfil_atual() = 'Mecanico'
    and solicitante_auth_id = auth.uid()
  )
);

alter policy "consulta"
on public.solicitacao_itens
to authenticated
using (
  private.perfil_atual() in ('Aprovisionador', 'Admin')
  or exists (
    select 1
    from public.solicitacoes s
    where s.id = solicitacao_id
      and s.solicitante_auth_id = auth.uid()
  )
);

alter policy "usuarios autorizados podem criar itens"
on public.solicitacao_itens
to authenticated
with check (
  private.perfil_atual() in ('Aprovisionador', 'Admin')
  or (
    private.perfil_atual() = 'Mecanico'
    and exists (
      select 1
      from public.solicitacoes s
      where s.id = solicitacao_id
        and s.solicitante_auth_id = auth.uid()
    )
  )
);
