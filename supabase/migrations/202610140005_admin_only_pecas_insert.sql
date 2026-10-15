-- Spare-parts catalog writes are available only to the Admin profile.
alter policy "insert peç]ca"
on public.pecas
to authenticated
with check (private.perfil_atual() = 'Admin');
