const createClient = window.supabase?.createClient;
const url = window.ORBI9_SUPABASE_CONFIG?.url || import.meta.env.VITE_SUPABASE_URL;
const key = window.ORBI9_SUPABASE_CONFIG?.key || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
if (!createClient || !url || !key || key.includes('PASTE_YOUR')) throw new Error('Orbi9 Database configuration is missing');
export const supabase = createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
export const productFromRow = row => { const images=Array.isArray(row.images)?row.images:[]; return {...row,id:String(row.id),quantity:Number(row.quantity||0),image_url:row.image_url||images[Number(row.primary_image||0)]||images[0]||'',images,variants:row.variants&&typeof row.variants==='object'?row.variants:{},seo:row.seo&&typeof row.seo==='object'?row.seo:{},primaryImage:Number(row.primary_image||0),slider:Boolean(row.slider),showInCategories:row.show_in_categories!==false,trackInventory:row.track_inventory!==false,updatedAt:row.updated_at||row.created_at}; };
export const productToRow = product => { const row={name:String(product.name||'').trim(),subtitle:product.subtitle||null,category:product.category||'',description:product.description||'',price:Number(product.price||0),status:product.status||'Draft',featured:Boolean(product.featured),slider:Boolean(product.slider),show_in_categories:product.showInCategories!==false,sku:product.sku||null,quantity:Number(product.quantity||0),track_inventory:product.trackInventory!==false,images:Array.isArray(product.images)?product.images:[],primary_image:Number(product.primaryImage||0),variants:product.variants||{},seo:product.seo||{}}; if(product.id!==undefined&&product.id!==null&&String(product.id)!=='') row.id=/^\d+$/.test(String(product.id))?Number(product.id):String(product.id); return row; };
export async function fetchProducts(){const {data,error}=await supabase.from('products').select('*').order('created_at',{ascending:false});if(error)throw error;return (data||[]).map(productFromRow);}
export async function saveProduct(product){
  const row=productToRow(product);
  // Older live tables may not yet have optional editor columns. Retry only for
  // an explicitly reported missing column so a valid product still persists.
  for(let attempt=0;attempt<12;attempt++){
    const query=row.id?supabase.from('products').update(row).eq('id',row.id).select().single():supabase.from('products').insert(row).select().single();
    const {data,error}=await query;
    if(!error)return productFromRow(data);
    if(error.code!=='42703'&&error.code!=='PGRST204')throw error;
    const message=String(error.message||'');
    const missing=message.match(/column [^\"']*[\"']([^\"']+)[\"']/i)?.[1]||message.match(/find the [\"']([^\"']+)[\"'] column/i)?.[1];
    if(!missing||!(missing in row))throw error;
    delete row[missing];
  }
  throw new Error('Product schema is missing too many fields; apply supabase/schema.sql');
}
export async function removeProduct(id){const value=/^\d+$/.test(String(id))?Number(id):String(id);const {error}=await supabase.from('products').delete().eq('id',value);if(error)throw error;}
