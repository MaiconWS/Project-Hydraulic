create or replace function public.laudos_listar_condenacoes()
returns table (
  id bigint,
  os_numero text,
  modelo_solicitado text,
  data_envio timestamptz,
  status text
)
language sql
stable
security definer
set search_path = ''
as $function$
  select s.id, s.os_numero, s.modelo_solicitado, s.data_envio, s.status
  from public.solicitacoes as s
  where lower(trim(coalesce(s.status, ''))) = 'condenado'
    and (select private.perfil_atual()) in ('Mecanico', 'Aprovisionador', 'Admin');
$function$;

create or replace function public.laudos_listar_itens_condenacao(p_solicitacao_id bigint)
returns table (
  solicitacao_id bigint,
  sap_peca text,
  descricao text,
  quantidade integer
)
language sql
stable
security definer
set search_path = ''
as $function$
  select i.solicitacao_id, i.sap_peca, i.descricao, i.quantidade
  from public.solicitacao_itens as i
  join public.solicitacoes as s on s.id = i.solicitacao_id
  where s.id = p_solicitacao_id
    and lower(trim(coalesce(s.status, ''))) = 'condenado'
    and (select private.perfil_atual()) in ('Mecanico', 'Aprovisionador', 'Admin');
$function$;

revoke all on function public.laudos_listar_condenacoes() from public, anon;
revoke all on function public.laudos_listar_itens_condenacao(bigint) from public, anon;
grant execute on function public.laudos_listar_condenacoes() to authenticated;
grant execute on function public.laudos_listar_itens_condenacao(bigint) to authenticated;
