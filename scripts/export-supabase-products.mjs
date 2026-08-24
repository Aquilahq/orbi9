import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { mkdir, writeFile } from 'node:fs/promises';

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
if (!url || !key) throw new Error('VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY are required');

const supabase = createClient(url, key);
const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: true });
if (error) throw error;

const products = (data || []).map(product => {
  const images = Array.isArray(product.images) ? product.images : [];
  const image = images[Number(product.primary_image || 0)] || images[0] || null;
  return {
    source_id: String(product.id),
    title: product.name,
    handle: String(product.name || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    subtitle: product.subtitle || null,
    description: product.description || '',
    category: product.category || 'Uncategorized',
    status: product.status || 'Draft',
    price: Number(product.price || 0),
    sku: product.sku || null,
    quantity: Number(product.quantity || 0),
    track_inventory: product.track_inventory !== false,
    images: images.filter(value => typeof value === 'string' && !/orbi9newlogo/i.test(value)),
    primary_image: image,
    variants: product.variants || {},
    exported_at: new Date().toISOString()
  };
});

await mkdir('medusa-migration', { recursive: true });
await writeFile('medusa-migration/products.json', JSON.stringify({ source: 'supabase', exported_at: new Date().toISOString(), products }, null, 2) + '\n');
console.log(`Exported ${products.length} products to medusa-migration/products.json`);
