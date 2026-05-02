drop policy if exists "reports are readable" on public.reports;

create policy "reports are publicly readable"
on public.reports for select
to anon, authenticated
using (true);

notify pgrst, 'reload schema';
