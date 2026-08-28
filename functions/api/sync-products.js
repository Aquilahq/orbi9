const SUPABASE_URL = 'https://rogaddkicxzalpqfcpeq.supabase.co';
const products = [
  { name: 'Chrome Starburst Camera', subtitle: 'Mid-century camera', category: 'Cameras', description: 'A collectible mid-century camera with sculptural chrome detailing.', price: 185, status: 'Published', featured: true, quantity: 1, track_inventory: true, images: ['/product-images/amplifier.jpg'], primary_image: 0, variants: {}, seo: {} },
  { name: 'Apollo Desk Radio', subtitle: 'Space-age tabletop radio', category: 'Radios', description: 'A space-age tabletop radio selected for its warm analogue character.', price: 240, status: 'Published', featured: true, quantity: 1, track_inventory: true, images: ['/product-images/vintage-radio.jpg'], primary_image: 0, variants: {}, seo: {} },
  { name: 'Retro Computer Terminal', subtitle: 'Vintage computing object', category: 'Computing', description: 'A distinctive vintage computing object for collectors.', price: 395, status: 'Published', featured: true, quantity: 1, track_inventory: true, images: ['/product-images/oscilloscope.jpg'], primary_image: 0, variants: {}, seo: {} },
];

export async function onRequestPost({ env }) {
  if (!env.SUPABASE_SERVICE_ROLE_KEY) return Response.json({ message: 'Supabase sync is not configured.' }, { status: 503 });
  const headers = { apikey: env.SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`, 'content-type': 'application/json' };
  const existingResponse = await fetch(`${SUPABASE_URL}/rest/v1/products?select=name`, { headers });
  if (!existingResponse.ok) return Response.json({ message: 'Could not read Supabase products.' }, { status: 502 });
  const existing = new Set((await existingResponse.json()).map(row => row.name));
  const missing = products.filter(product => !existing.has(product.name));
  if (missing.length) {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/products`, { method: 'POST', headers: { ...headers, Prefer: 'return=representation' }, body: JSON.stringify(missing) });
    if (!response.ok) return Response.json({ message: 'Could not add products to Supabase.', detail: await response.text() }, { status: 502 });
  }
  return Response.json({ synced: products.length, added: missing.length, products: products.map(product => product.name) });
}

export function onRequest(context) {
  if (context.request.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
  return onRequestPost(context);
}
