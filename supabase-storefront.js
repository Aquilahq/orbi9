import { fetchProducts } from './orbi9-database.js';

const key = 'orbi9-catalog-v2';
const marker = 'orbi9-supabase-catalog-hash';
const hash = value => JSON.stringify(value).length + ':' + JSON.stringify(value).slice(0, 120);

(async () => {
  try {
    const products = await fetchProducts();
    const next = JSON.stringify(products);
    if (products.length && next !== localStorage.getItem(key)) {
      localStorage.setItem(key, next);
      const signature = hash(products);
      if (sessionStorage.getItem(marker) !== signature) {
        sessionStorage.setItem(marker, signature);
        location.reload();
      }
    }
  } catch (error) {
    localStorage.removeItem(key);
    console.error('Supabase catalogue unavailable; storefront cleared.', error.message);
  }
})();
