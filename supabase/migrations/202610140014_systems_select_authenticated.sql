-- System/category data is read by application pages after authentication.
alter policy "Enable read access for all users"
on public.sistemas
to authenticated;
