const createClient = window.supabase?.createClient;
const url = window.ORBI9_SUPABASE_CONFIG?.url || import.meta.env.VITE_SUPABASE_URL;
const key = window.ORBI9_SUPABASE_CONFIG?.key || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
if (!createClient || !url || !key || key.includes('PASTE_YOUR')) throw new Error('Orbi9 Database configuration is missing');
export const supabase = createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
export const productFromRow = row => { const images=Array.isArray(row.images)?row.images:[]; return {...row,id:String(row.id),quantity:Number(row.quantity||0),image_url:row.image_url||images[Number(row.primary_image||0)]||images[0]||'',images,variants:row.variants&&typeof row.variants==='object'?row.variants:{},tags:Array.isArray(row.tags)?row.tags:[],seo:row.seo&&typeof row.seo==='object'?row.seo:{},primaryImage:Number(row.primary_image||0),slider:Boolean(row.slider),showInCategories:row.show_in_categories!==false,trackInventory:row.track_inventory!==false,updatedAt:row.updated_at||row.created_at}; };
export const productToRow = product => { const row={name:String(product.name||'').trim(),subtitle:product.subtitle||null,category:product.category||'',description:product.description||'',price:Number(product.price||0),status:product.status||'Draft',featured:Boolean(product.featured),sku:product.sku||null,quantity:Number(product.quantity||0),track_inventory:product.trackInventory!==false,images:Array.isArray(product.images)?product.images:[],primary_image:Number(product.primaryImage||0),variants:product.variants||{},seo:product.seo||{}}; if(product.id!==undefined&&product.id!==null&&String(product.id)!=='') row.id=/^\d+$/.test(String(product.id))?Number(product.id):String(product.id); return row; };
export async function fetchProducts(){const {data,error}=await supabase.from('products').select('*').order('created_at',{ascending:false});if(error)throw error;return (data||[]).map(productFromRow);}

function missingColumn(error,row){
  const message=String(error?.message||'');
  // PostgREST uses both “Could not find the 'x' column...” and
  // “column x does not exist”, depending on whether its schema cache is stale.
  const matches=[
    message.match(/find the ['\"]([^'\"]+)['\"] column/i),
    message.match(/column ['\"]?([A-Za-z_][A-Za-z0-9_]*)['\"]? does not exist/i),
    message.match(/column ['\"]?([A-Za-z_][A-Za-z0-9_]*)['\"]? of/i),
    message.match(/column ['\"]?([A-Za-z_][A-Za-z0-9_]*)['\"]? in the schema cache/i)
  ];
  const name=matches.find(Boolean)?.[1];
  return name && Object.prototype.hasOwnProperty.call(row,name) ? name : null;
}

export async function saveProduct(product){
  const row=productToRow(product);
  const {data:{session}}=await supabase.auth.getSession();
  if(!session?.access_token) throw new Error('Your inventory session has expired. Sign in again.');
  const existing=Boolean(row.id);
  const response=await fetch(existing?`/api/products?id=${encodeURIComponent(row.id)}`:'/api/products',{method:existing?'PATCH':'POST',headers:{'content-type':'application/json',authorization:`Bearer ${session.access_token}`},body:JSON.stringify(row)});
  const result=await response.json().catch(()=>({}));
  if(!response.ok) throw new Error(result.message||result.detail||'Product could not be saved.');
  return productFromRow(result);
}
export async function removeProduct(id){
  const {data:{session}}=await supabase.auth.getSession();
  if(!session?.access_token) throw new Error('Your inventory session has expired. Sign in again.');
  const value=/^\d+$/.test(String(id))?Number(id):String(id);
  const response=await fetch(`/api/products?id=${encodeURIComponent(value)}`,{method:'DELETE',headers:{authorization:`Bearer ${session.access_token}`} });
  if(!response.ok){const result=await response.json().catch(()=>({}));throw new Error(result.message||'Product could not be deleted.');}
}
