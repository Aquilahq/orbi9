import fs from 'node:fs';
const base='http://localhost:9000';
const email=process.env.MEDUSA_ADMIN_EMAIL;
const password=process.env.MEDUSA_ADMIN_PASSWORD;
if(!email || !password) throw new Error('Set MEDUSA_ADMIN_EMAIL and MEDUSA_ADMIN_PASSWORD');
const login=await fetch(`${base}/auth/user/emailpass`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email,password})});
const {token}=await login.json(); if(!token) throw new Error('Medusa admin login failed');
const source=JSON.parse(fs.readFileSync('medusa-migration/products.json','utf8'));
const imageFor=p=>p.handle.includes('zenith')?'/product-images/vintage-radio.jpg':p.handle.includes('victor')?'/product-images/phonograph.jpg':p.handle.includes('western')?'/product-images/amplifier.jpg':p.handle.includes('tektronix')?'/product-images/oscilloscope.jpg':p.handle.includes('masudaya')?'/product-images/robot.jpg':null;
for(const p of source.products){
 const image=imageFor(p);
 const body={title:p.title,subtitle:p.subtitle||undefined,handle:p.handle,description:p.description,status:p.status.toLowerCase()==='published'?'published':'draft',thumbnail:image?`http://localhost:5173${image}`:undefined,options:[{title:'Default',values:['Default']}],variants:[{title:'Default',sku:p.sku||undefined,manage_inventory:p.track_inventory,options:{Default:'Default'},prices:[{amount:Math.round(p.price*100),currency_code:'usd'}]}]};
 const r=await fetch(`${base}/admin/products`,{method:'POST',headers:{'content-type':'application/json',authorization:`Bearer ${token}`},body:JSON.stringify(body)}); const text=await r.text(); if(!r.ok) throw new Error(`${p.title}: ${r.status} ${text}`); console.log(`Imported ${p.title}`);
}
