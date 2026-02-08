drop policy if exists "users_select_own" on public.users;
drop policy if exists "users_insert_own" on public.users;
drop policy if exists "users_update_own" on public.users;

drop policy if exists "organizations_select_authenticated" on public.organizations;

create policy "users_select_own"
  on public.users
  for select
  using (id::text = (select auth.uid())::text);

create policy "users_insert_own"
  on public.users
  for insert
  with check (id::text = (select auth.uid())::text);

create policy "users_update_own"
  on public.users
  for update
  using (id::text = (select auth.uid())::text)
  with check (id::text = (select auth.uid())::text);

create policy "organizations_select_authenticated"
  on public.organizations
  for select
  using ((select auth.role()) = 'authenticated');
