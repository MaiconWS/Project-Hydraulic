-- Users can read their own profile; Admins can read profiles for management.
alter policy "usuario"
on public.usuarios
to authenticated
using (
  auth.uid() = auth_user_id
  or private.perfil_atual() = 'Admin'
);
