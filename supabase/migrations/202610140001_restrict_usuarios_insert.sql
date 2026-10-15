-- Removes the unrestricted authenticated INSERT policy.
-- User profiles are created/updated by the create-user-account Edge Function
-- using the server-side service_role key, which bypasses RLS.
drop policy if exists "Permitir insercao de usuarios" on public.usuarios;
