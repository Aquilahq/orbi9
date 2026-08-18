# Product Editor Plan

## Current architecture
- Static HTML5/Vite storefront (`index.html`) with shared `catalog.js` client catalogue behavior.
- The existing admin page was a static authenticated local catalogue manager; there was no running product API or server implementation (`backend/admin.js` was empty).
- Product records are currently read/written in browser `localStorage` under `orbi9-catalog-v2`. The storefront also reads this key, so edits are immediately visible in the same browser.

## Files being modified
- `admin.html`: working responsive editor, live preview, media/variant controls, autosave and manual save.
- `PRODUCT-EDITOR-PLAN.md`: this architecture record.

## Product data structure
`{ id, name, subtitle, status, description, price, compareAtPrice, costPerItem, taxable, sku, quantity, trackInventory, continueSelling, physical, weight, weightUnit, shippingProfile, images[], primaryImage, variants: { options[], items[] }, seo: { title, description, slug }, category, updatedAt }`.

## Database tables / API routes
No database or product API existed in the inspected project. Supabase is present as a dependency and has a minimal `public.products` table in `supabase/schema.sql`, but no configured client, credentials, or admin API route is present. This editor preserves the existing browser storage contract rather than inventing a second database. The editor has a clearly isolated save adapter so a future authenticated API can replace it without changing the UI.

## Image storage
Existing storefront data has a single `image_url` concept and no storage bucket. This editor stores uploaded images as data URLs in the existing browser catalogue record, with URL images supported as well. A production Supabase Storage bucket/API should be wired into the adapter before using large images in production.

## Save and autosave workflow
State is initialized from `orbi9-catalog-v2` (then `/orbi9-products.json`, then a safe demo record). Edits update the preview immediately. Changes are debounced for 1.5 seconds, then persisted through the existing `Orbi9Catalog.saveProducts` adapter. The explicit Save Changes action flushes immediately; status bar reports saving, saved, unsaved, and failed states.

## Variant structure
Options are represented as `{name, values[]}` and generated combinations as `{id, values: {Color: 'Black'}, price, sku, quantity, image}`. The UI supports adding/removing options and values and regenerating combinations without losing existing per-variant fields where possible.

## Authentication
The existing session-gated admin login and credentials were retained. No authentication provider or server session endpoint was present, so this change does not rename or replace the current auth mechanism.

## Deployment considerations
Run `npm run build` for the Vite bundle. Deploy the generated `dist/` through the existing static host. Browser-local edits are intentionally scoped to the current browser until an authenticated product API and storage bucket are configured; do not claim cross-device persistence until that backend exists.
