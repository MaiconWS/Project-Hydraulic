-- Permite que apenas o perfil Admin altere e exclua peças do catálogo.
create policy "admin update pecas"
on public.pecas
for update
to authenticated
using (private.perfil_atual() = 'Admin')
with check (private.perfil_atual() = 'Admin');

create policy "admin delete pecas"
on public.pecas
for delete
to authenticated
using (private.perfil_atual() = 'Admin');
