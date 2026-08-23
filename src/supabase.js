import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key || key.includes('PASTE_YOUR')) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY in .env');
}

export const supabase = createClient(url, key, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
});

export const productFromRow = row => ({
  ...row,
  id: String(row.id),
  image_url: row.image_url || '',
  images: Array.isArray(row.images) ? row.images : [],
  variants: row.variants && typeof row.variants === 'object' ? row.variants : {},
  seo: row.seo && typeof row.seo === 'object' ? row.seo : {},
  primaryImage: Number(row.primary_image || 0),
  trackInventory: row.track_inventory !== false,
  updatedAt: row.updated_at || row.created_at
});

export const productToRow = product => {
  const row = {
    name: String(product.name || '').trim(),
    subtitle: product.subtitle || null,
    category: product.category || '',
    description: product.description || '',
    price: Number(product.price || 0),
    image_url: product.image_url || product.images?.[product.primaryImage || 0] || null,
    status: product.status || 'Draft',
    featured: Boolean(product.featured),
    sku: product.sku || null,
    quantity: Number(product.quantity || 0),
    track_inventory: product.trackInventory !== false,
    images: Array.isArray(product.images) ? product.images : [],
    primary_image: Number(product.primaryImage || 0),
    variants: product.variants || {},
    seo: product.seo || {},
    updated_at: new Date().toISOString()
  };
  if (/^\d+$/.test(String(product.id || ''))) row.id = Number(product.id);
  return row;
};

export async function fetchProducts() {
  const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(productFromRow);
}

export async function saveProduct(product) {
  const row = productToRow(product);
  const query = row.id
    ? supabase.from('products').update(row).eq('id', row.id).select().single()
    : supabase.from('products').insert(row).select().single();
  const { data, error } = await query;
  if (error) throw error;
  return productFromRow(data);
}

export async function removeProduct(id) {
  const { error } = await supabase.from('products').delete().eq('id', Number(id));
  if (error) throw error;
}
