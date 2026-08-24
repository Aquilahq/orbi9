# Orbi9 → Medusa migration

This is a phased migration. The current storefront remains usable while Medusa becomes the replacement catalog/commerce backend.

## Why this route

- Medusa replaces the current Supabase product/admin API with a commerce-native backend.
- The existing Vite storefront can be kept initially, then switched to Medusa after catalog and checkout smoke tests pass.
- Product images are retained as image URLs during the first import; production hosting can later move them to S3-compatible storage.

## Current phases

1. **Export** — run `node scripts/export-supabase-products.mjs` to create `medusa-migration/products.json`.
2. **Provision** — create a Medusa app with PostgreSQL and Redis credentials; no current data is deleted.
3. **Import** — map the export into Medusa products, variants, inventory, and product images.
4. **Adapter** — add a storefront API adapter behind the existing `fetchProducts` interface.
5. **Cutover** — verify catalog, images, cart, checkout, and admin, then switch the storefront API.

The migration is intentionally additive until cutover approval. Supabase remains the rollback source during this work.
