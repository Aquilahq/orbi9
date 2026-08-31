-- Catalogue data for the ORBI9 admin console.
-- Run in Supabase SQL editor. RLS keeps the storefront readable and writes admin-only.
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  price numeric(12,2) not null default 0 check (price >= 0),
  image_url text,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  slider boolean not null default false
);

alter table public.products add column if not exists slider boolean not null default false;
alter table public.products add column if not exists show_in_categories boolean not null default true;

alter table public.products enable row level security;
drop policy if exists "Public can read products" on public.products;
create policy "Public can read products" on public.products for select using (true);
drop policy if exists "Authenticated users can manage products" on public.products;
create policy "Authenticated users can manage products" on public.products for all to authenticated using (true) with check (true);

create or replace function public.set_products_updated_at()
returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end; $$;
drop trigger if exists products_updated_at on public.products;
create trigger products_updated_at before update on public.products
for each row execute function public.set_products_updated_at();
