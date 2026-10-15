-- Parts catalog data remains readable to logged-in users, not anonymous callers.
alter policy "Enable read access for all users"
on public.pecas
to authenticated;
