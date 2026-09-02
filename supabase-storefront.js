import { fetchProducts, supabase } from './orbi9-database.js';

const key = 'orbi9-catalog-v2';
const syncEvent = 'orbi9-products-synced';

function cachedProducts() {
  try { return JSON.parse(localStorage.getItem(key) || '[]'); }
  catch { return []; }
}

function publish(products) {
  const next = JSON.stringify(products);
  if (next === JSON.stringify(cachedProducts())) return false;
  // Update the cache only after a successful Supabase response. A failed request
  // must never make products disappear from the live storefront.
  localStorage.setItem(key, next);
  window.dispatchEvent(new CustomEvent(syncEvent, { detail: { count: products.length } }));
  return true;
}

async function syncProducts({ reload = false } = {}) {
  try {
    const products = await fetchProducts();
    const changed = publish(products);
    // catalog.js may have rendered before the first network response.
    if (changed && reload) location.reload();
    return products;
  } catch (error) {
    console.error('Supabase catalogue sync failed; retaining last known catalogue.', error.message);
    return cachedProducts();
  }
}

// Initial load is authoritative, including an intentionally empty catalogue.
syncProducts({ reload: true });

// Keep open storefront tabs in step with admin changes when Realtime is enabled.
supabase.channel('orbi9-products-sync')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => syncProducts({ reload: true }))
  .subscribe(status => {
    if (status === 'SUBSCRIBED') syncProducts();
  });

// Polling is a safe fallback for deployments where Realtime publication is not enabled.
setInterval(() => syncProducts({ reload: true }), 30000);
