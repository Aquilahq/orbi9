-- Orbi9 image storage. Run once in the Orbi9 Database SQL editor.
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

drop policy if exists "Public product images" on storage.objects;
create policy "Public product images" on storage.objects for select to public
using (bucket_id = 'product-images');

drop policy if exists "Authenticated users upload product images" on storage.objects;
create policy "Authenticated users upload product images" on storage.objects for insert to authenticated
with check (bucket_id = 'product-images');

drop policy if exists "Authenticated users manage product images" on storage.objects;
create policy "Authenticated users manage product images" on storage.objects for delete to authenticated
using (bucket_id = 'product-images');
