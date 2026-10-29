-- Mecânicos só podem incluir novas peças em O.S. próprias ainda pendentes.
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
        and s.status = 'Pendente'
    )
  )
);
