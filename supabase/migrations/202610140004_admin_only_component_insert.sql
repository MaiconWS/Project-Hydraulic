-- Component catalog writes are available only to the Admin profile.
alter policy "insert component"
on public.componentes
to authenticated
with check (private.perfil_atual() = 'Admin');
