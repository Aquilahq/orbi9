const SUPABASE_URL = 'https://rogaddkicxzalpqfcpeq.supabase.co';
const products = [
  { name: 'ZENITH 6-S-126', subtitle: 'Space-age tabletop radio', category: 'Radios & Receivers', description: 'A space-age tabletop radio selected for its warm analogue character.', price: 285, status: 'Published', featured: true, quantity: 1, track_inventory: true, images: ['/product-images/vintage-radio.jpg'], primary_image: 0, variants: {}, seo: {} },
  { name: 'VICTOR VV-XIV', subtitle: 'Vintage phonograph', category: 'Phonographs & Audio', description: 'A collectible vintage phonograph with a distinctive mechanical character.', price: 450, status: 'Published', featured: true, quantity: 1, track_inventory: true, images: ['/product-images/phonograph.jpg'], primary_image: 0, variants: {}, seo: {} },
  { name: 'WESTERN ELECTRIC 91-A', subtitle: 'Classic tube amplifier', category: 'Tubes & Components', description: 'A rare vintage amplifier selected for its engineering and sculptural form.', price: 320, status: 'Published', featured: true, quantity: 1, track_inventory: true, images: ['/product-images/amplifier.jpg'], primary_image: 0, variants: {}, seo: {} },
  { name: 'TEKTRONIX 515', subtitle: 'Vintage test equipment', category: 'Test Equipment', description: 'A distinctive vintage oscilloscope for collectors of scientific instruments.', price: 380, status: 'Published', featured: true, quantity: 1, track_inventory: true, images: ['/product-images/oscilloscope.jpg'], primary_image: 0, variants: {}, seo: {} },
  { name: 'MASUDAYA SPACE ROBOT', subtitle: 'Japanese space-age collectible', category: 'Sci-Fi Collectibles', description: 'A highly collectible space-age robot with an iconic mid-century silhouette.', price: 215, status: 'Published', featured: true, quantity: 1, track_inventory: true, images: ['/product-images/robot.jpg'], primary_image: 0, variants: {}, seo: {} },
];

export async function onRequestPost({ env }) {
  if (!env.SUPABASE_SERVICE_ROLE_KEY) return Response.json({ message: 'Supabase sync is not configured.' }, { status: 503 });
  const headers = { apikey: env.SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`, 'content-type': 'application/json' };
  const existingResponse = await fetch(`${SUPABASE_URL}/rest/v1/products?select=id,name,images`, { headers });
  if (!existingResponse.ok) return Response.json({ message: 'Could not read Supabase products.' }, { status: 502 });
  const existing = await existingResponse.json();
  const byName = new Map(existing.map(row => [row.name, row]));
  const missing = products.filter(product => !byName.has(product.name));
  if (missing.length) {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/products`, { method: 'POST', headers: { ...headers, Prefer: 'return=representation' }, body: JSON.stringify(missing) });
    if (!response.ok) return Response.json({ message: 'Could not add products to Supabase.', detail: await response.text() }, { status: 502 });
  }
  const updated = [];
  for (const product of products) {
    const row = byName.get(product.name);
    if (!row || JSON.stringify(row.images || []) === JSON.stringify(product.images)) continue;
    const response = await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${encodeURIComponent(row.id)}`, { method: 'PATCH', headers: { ...headers, Prefer: 'return=minimal' }, body: JSON.stringify({ images: product.images, primary_image: product.primary_image }) });
    if (!response.ok) return Response.json({ message: `Could not update image for ${product.name}.`, detail: await response.text() }, { status: 502 });
    updated.push(product.name);
  }
  return Response.json({ synced: products.length, added: missing.length, images_updated: updated.length, products: products.map(product => product.name) });
}

export function onRequest(context) {
  if (context.request.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
  return onRequestPost(context);
}
